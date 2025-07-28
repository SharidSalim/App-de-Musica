const express = require("express");

const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const {
  generateRoomCode,
  getRoom,
  roomData,
  songData,
  memberData,
  chatData,
  rankPriority,
  downloadSong,
} = require("./modules/utilities");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use("/audio", express.static("audio"));
app.use(
  "/audio",
  express.static("audio", {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
      }
    },
  })
);

function tryPlayNext(room) {
  if (!room || !room.queue.length) {
    console.log("tryPlayNext Didn't run!");
    io.to(room.roomId).emit("stop-song");
    return;
  }

  const next = room.queue[0];

    // Download next songs (up to 2 ahead)
  for (let i = 1; i <= 2; i++) {
    if (room.queue[i]) {
      if(!room.queue[i].isDownloaded)
      consistentDownload(room.queue[i], room);
    }
  }

  if (next.isDownloaded && room.nowPlaying === undefined) {
    room.nowPlaying = next;
      room.playedHistory.push(room.nowPlaying);
    room.startTime = Date.now();
    io.to(room.roomId).emit("play-song", {
      path: next.path(PORT, room.roomId),
      startTime: room.startTime,
    });

    console.log("Now Playing: ", room.nowPlaying);

    room.timeoutId = setTimeout(() => {
       const audioFolderPath = path.join(__dirname, "audio", room.roomId);
      const filePath = path.join(audioFolderPath, `${next.videoId}.mp3`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Deleted played song: ${next.videoId}.mp3`);
      }
      room.loadedSongs -= 1;
      room.queue.shift();
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.nowPlaying = undefined;
      io.to(room.roomId).emit("set-queue", room.queue);
      tryPlayNext(room); // Play next track
    }, next.duration * 1000);
  }
}

// function consistentDownload(song, room) {
//   console.log("Loaded Songs", room.loadedSongs);

//   if (room.loadedSongs >= 4 || song.isDownloaded || song.isDownloading) {
//     console.log("didn't download a song");
//     return;
//   }
//   if (room.loadedSongs < 4) {
//     song.isDownloading = true;
//     room.loadedSongs += 1;
//     console.log("updated loaded songs", room.loadedSongs);

//     downloadSong(
//       song.url,
//       __dirname,
//       room.roomId,
//       song.videoId,
//       () => {
//         song.isDownloaded = true;
//         song.isDownloading = false;
//         tryPlayNext(room);
//       },
//       () => {
//         room.loadedSongs -= 1;
//       }
//     );
//   }
// }

function consistentDownload(song, room) {
  // If already downloaded or downloading, skip
  if (song.isDownloaded || song.isDownloading) {
    return;
  }
  
  // Limit concurrent downloads to 3
  const activeDownloads = room.queue.filter(
    s => s.isDownloading
  ).length;
  
  if (activeDownloads >= 3) {
    return;
  }

  song.isDownloading = true;
  console.log("Starting download for:", song.videoId);

  downloadSong(
    song.url,
    __dirname,
    room.roomId,
    song.videoId,
    () => {
      song.isDownloaded = true;
      song.isDownloading = false;
      tryPlayNext(room);
    },
    () => {
      song.isDownloading = false;
    }
  );
}

const rooms = [];

app.post("/create-room", (req, res) => {
  const room = new roomData(generateRoomCode(8));
  rooms.push(room);
  const audioFolderPath = path.join(__dirname, "audio", room.roomId);

  if (!fs.existsSync(audioFolderPath)) {
    fs.mkdirSync(audioFolderPath, { recursive: true });
    console.log("Folder created at:", audioFolderPath);
  } else {
    console.log("Folder already exists at:", audioFolderPath);
  }
  res.send(room);
});

app.get("/rooms", (req, res) => {
  const cleanedRooms = rooms.map(({ timeoutId, ...room }) => room);
  res.send(cleanedRooms);
});

app.get("/rooms/:id", (req, res) => {
  const roomInfo = rooms.find((obj) => obj.roomId === req.params.id);
  const { timeoutId, ...safeRoomInfo } = roomInfo;
  res.send(safeRoomInfo);
});

// Socket.io connection
io.on("connection", (socket) => {
  //Join room
  socket.on("join-room", (data) => {
    socket.join(data.roomId);

    let indexRoom = rooms.findIndex((obj) => obj.roomId === data.roomId);
    let rank = rooms[indexRoom]?.members.length === 0 ? "host" : "guest";

    if (indexRoom !== -1) {
      const newMember = new memberData(data.name, socket.id, rank);
      rooms[indexRoom].members.push(newMember);
      socket.socketSession = newMember;

      socket.emit("userData-retrieve", {
        name: data.name,
        rank: rank,
        id: socket.id,
      });

      socket.emit("set-chat", rooms[indexRoom]?.chats);
      socket.emit("set-queue", rooms[indexRoom]?.queue);
      socket.emit("get-server-status", rooms[indexRoom]?.roomState);

      const currentSong = rooms[indexRoom]?.nowPlaying;
      if (currentSong) {
        socket.emit("play-song", {
          path: currentSong.path(PORT, rooms[indexRoom].roomId),
          startTime: rooms[indexRoom].startTime,
        });
      }

      const members = rooms[indexRoom]?.members;
      members.sort((a, b) => {
        return rankPriority[a.rank] - rankPriority[b.rank];
      });
      io.to(data.roomId).emit("update-join", members);
    }
    console.log(`User ${data.name}:${socket.id} joined room ${data.roomId}`);
  });

  //Send texts
  socket.on("send-msg", (data) => {
    const msg = new chatData(data.name, socket.id, data.msg);
    const room = getRoom(data.roomId, rooms);

    getRoom(data.roomId, rooms).chats.push(msg);
    if (getRoom(data.roomId, rooms).chats.length > 50) {
      getRoom(data.roomId, rooms).chats.shift();
    }
    io.to(data.roomId).emit("set-chat", room.chats);
  });

  //skip Song
  socket.on("skip-song", (data) => {
    const room = getRoom(data, rooms);
    if (!room) return;

    room.queue.shift();
    if (room.queue.length === 0) {
      room.nowPlaying = undefined;
      io.to(data).emit("set-queue", room.queue);
    } else {
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.nowPlaying = undefined;

      io.to(data).emit("set-queue", room.queue);
      tryPlayNext(room);
    }
  });

  //Server public/private state
  socket.on("change-server-status", (roomId) => {
    let room = getRoom(roomId, rooms);
    if (room?.roomState === "public") {
      room.roomState = "private";
    } else if (room?.roomState === "private") room.roomState = "public";
    io.to(roomId).emit("get-server-status", room.roomState);
  });

  //add a new song
  socket.on("add-song", (data) => {
    const room = getRoom(data.roomId, rooms);
    if (!room) return;

    const song = new songData(
      data.url,
      data.addedBy,
      data.title,
      data.channel,
      data.thumbnail,
      data.videoId,
      data.duration
    );
    song.serial = room.queue.length + 1;
    song.isDownloaded = false;

    room.queue.push(song);

    // downloadSong(
    //   song.url,
    //   __dirname,
    //   data.roomId,
    //   song.videoId,
    //   () => {
    //     song.isDownloaded = true;
    //     io.to(data.roomId).emit("set-queue", room.queue);
    //     tryPlayNext(room);
    //   },
    //   () => {
    //     io.to(data.roomId).emit("set-queue", room.queue);
    //   }
    // );
    if (room.queue.length <= 3) {
    consistentDownload(song, room);
  }

    io.to(data.roomId).emit("set-queue", room.queue);
  });

  //   socket.on("play-prev", (roomId) => {
  //   const room = getRoom(roomId, rooms);
  //   if (!room) return;

  //   // ✅ Pop the last played song
  //   const previous = room.playedHistory.pop();
  //   if (!previous) return; // No history available

  //   // ✅ Re-insert current song back to front of queue
  //   if (room.nowPlaying) {z
  //     room.queue.unshift(room.nowPlaying);
  //   }

  //   // ✅ Set previous song as now playing
  //   room.nowPlaying = previous;
  //   room.startTime = Date.now();

  //   io.to(roomId).emit("set-queue", room.queue);

  //   // ✅ Reset timer
  //   if (room.timeoutId) clearTimeout(room.timeoutId);
  //   room.timeoutId = setTimeout(() => {
  //     tryPlayNext(room);
  //   }, previous.duration * 1000);
  // });

  //play previous track
  socket.on("play-prev", (roomId) => {
    const room = getRoom(roomId, rooms);
    if (!room) return;

    if (room.playPrev()) {
      io.to(roomId).emit("play-song", {
        path: room.nowPlaying.path(PORT, room.roomId),
        startTime: room.startTime,
      });

      // Set timeout for the previous song
      room.timeoutId = setTimeout(() => {
        room.playedHistory.push(room.nowPlaying);
        room.nowPlaying = undefined;
        tryPlayNext(room);
      }, room.nowPlaying.duration * 1000);

      io.to(roomId).emit("set-queue", room.queue);
    }
  });

  //disconnect from server
  socket.on("disconnect", () => {
    let roomId = null;
    for (const room of rooms) {
      const index = room.members.findIndex((m) => m.id === socket.id);
      if (index !== -1) {
        roomId = room.roomId;
        console.log(
          `${socket.socketSession.name}(${socket.socketSession.id}) left the room ${roomId}`
        );
        room.members.splice(index, 1);
        io.to(roomId).emit("update-join", room.members);

        if (room.members.length === 0) {
          console.log(`Room ${room.roomId} is empty, deleting it.`);
          const roomIndex = rooms.findIndex((obj) => obj.roomId === roomId);
          if (roomIndex !== -1) {
            rooms.splice(roomIndex, 1);
            const audioFolderPath = path.join(__dirname, "audio", roomId);

            if (fs.existsSync(audioFolderPath)) {
              fs.rmSync(audioFolderPath, { recursive: true, force: true });
              console.log("Folder deleted:", audioFolderPath);
            } else {
              console.log("Folder does not exist:", audioFolderPath);
            }
          }
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
