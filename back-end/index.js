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
  getRandomInt,
} = require("./modules/utilities");

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

function deleteSongFile(room, songId) {
  if (room.nowPlaying && room.nowPlaying.videoId === songId) return;
  
  const audioFolderPath = path.join(__dirname, "audio", room.roomId);
  const filePath = path.join(audioFolderPath, `${songId}.mp3`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🧹 Deleted played song: ${songId}.mp3`);
  }
}

function tryPlayNext(room) {
  if (!room || !room.queue.length) {
    console.log("tryPlayNext Didn't run!");
    io.to(room.roomId).emit("stop-song");
    return;
  }

  const next = room.queue[0];
  console.log("next song:", next);

  // Download next songs (up to 2 ahead)
  for (let i = 1; i <= 2; i++) {
    if (room.queue[i]) {
      if (!room.queue[i].isDownloaded) consistentDownload(room.queue[i], room);
    }
  }

  if (next.isDownloaded && room.nowPlaying === undefined) {
    clearTimeout(room.timeoutId);
    room.nowPlaying = next;

    room.startTime = Date.now();
    io.to(room.roomId).emit("play-song", {
      path: next.path(PORT, room.roomId),
      startTime: room.startTime,
    });

    console.log("Now Playing: ", room.nowPlaying);

    room.timeoutId = setTimeout(() => {
      deleteSongFile(room, next.videoId);
      room.queue.shift();
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.playedHistory.push(room.nowPlaying);
      room.nowPlaying = undefined;
      io.to(room.roomId).emit("set-queue", room.queue);
      tryPlayNext(room); // Play next track
    }, next.duration * 1000);
  }
}

// Add this function to handle pause/resume logic
function togglePlayState(room, shouldPause, clientTime) {
  if (!room || !room.nowPlaying) return;

  currentSongId = room.nowPlaying.videoId;
  room.paused = shouldPause;

  if (shouldPause) {
    // Pause logic
    if (room.timeoutId) {
      clearTimeout(room.timeoutId);
      room.timeoutId = null;
    }

    room.elapsedBeforePause = clientTime || Date.now() - room.startTime;
  } else {
    // Resume logic
    room.startTime = Date.now() - room.elapsedBeforePause;
    room.timeoutId = setTimeout(() => {
      deleteSongFile(room, currentSongId);
      room.queue.shift();
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.nowPlaying = undefined;
      io.to(room.roomId).emit("set-queue", room.queue);
      tryPlayNext(room);
    }, room.nowPlaying.duration * 1000 - room.elapsedBeforePause);
  }
}

function handleseekTime(room, seektime) {
  if (!room || !room.nowPlaying) return;
  if (room.queue[0].isDownloading) return;
  if (!room.paused) {
    clearTimeout(room.timeoutId);
    room.timeoutId = setTimeout(() => {
      deleteSongFile(room, room.nowPlaying.videoId);
      room.queue.shift();
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.nowPlaying = undefined;
      io.to(room.roomId).emit("set-queue", room.queue);
      tryPlayNext(room);
    }, room.nowPlaying.duration * 1000 - seektime * 1000);
  } else {
    room.elapsedBeforePause = seektime * 1000;
  }
}

function consistentDownload(song, room) {
  // If already downloaded or downloading, skip
  if (song.isDownloaded || song.isDownloading) {
    return;
  }

  // Limit concurrent downloads to 3
  const activeDownloads = room.queue.filter((s) => s.isDownloading).length;

  if (activeDownloads >= 3) {
    return;
  }

  song.isDownloading = true;
  console.log("Starting download for:", song.videoId);

  const process = downloadSong(
    song,
    __dirname,
    room.roomId,
    () => {
      song.isDownloaded = true;
      song.isDownloading = false;
      tryPlayNext(room);
    },
    () => {
      song.isDownloading = false;
    }
  );
  song.downloadProcess = process;
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
  function sendErrorMsg(msg, room, allClient = false) {
    if (allClient) {
      io.to(room.roomId).emit("server-err", msg);
    } else socket.emit("server-err", msg);
  }

  //Join room
  socket.on("join-room", (data) => {
    socket.join(data.roomId);
    const room = getRoom(data.roomId, rooms);
    if (!room) return;
    let indexRoom = rooms.findIndex((obj) => obj.roomId === data.roomId);

    let rank = room.members.length === 0 ? "host" : "guest";

    if (indexRoom !== -1) {
      const newMember = new memberData(data.name, socket.id, rank);
      room.members.push(newMember);
      socket.socketSession = newMember;

      socket.emit("userData-retrieve", {
        name: data.name,
        rank: rank,
        id: socket.id,
      });

      socket.emit("set-chat", rooms.chats);
      socket.emit("set-queue", room.queue);
      socket.emit("get-server-status", room.roomState);

      const currentSong = room.nowPlaying;
      if (currentSong) {
        if (room.paused) {
          // Send paused state with elapsed time
          socket.emit("play-song", {
            path: currentSong.path(PORT, room.roomId),
            startTime: room.startTime,
            paused: true,
            elapsed: room.elapsedBeforePause,
          });
        } else {
          // Send normal play command
          socket.emit("play-song", {
            path: currentSong.path(PORT, room.roomId),
            startTime: room.startTime,
          });
        }
      }

      const members = room.members;
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
    if (!room || room.nowPlaying === undefined) {
      sendErrorMsg("Nothing is being played right now!", room);
      return;
    }

    if (room.queue[1] && room.queue[1].isDownloading) {
      sendErrorMsg("Next song hasn't loaded yet!", room);
      return;
    }
    deleteSongFile(room, room.nowPlaying.videoId);
    room.playedHistory.push(room.nowPlaying);
    room.nowPlaying = undefined;
    room.queue.shift();
    if (room.queue.length === 0) {
      io.to(data).emit("set-queue", room.queue);
    } else {
      room.queue.forEach((s, i) => (s.serial = i + 1));

      io.to(data).emit("set-queue", room.queue);
      tryPlayNext(room);
    }
  });

  //Skip-back
  socket.on("play-prev", (roomId) => {
    const room = getRoom(roomId, rooms);
    if (!room) return;

    if (room.playedHistory.length === 0) {
      sendErrorMsg("Play few songs first!");
      return;
    }

    if (room.queue[0].isDownloading) {
      sendErrorMsg("Song still downloading!", room);
      return;
    }
    const prevSong = room.playedHistory.pop();
    room.queue.unshift(prevSong);
    const prevRef = room.queue[0];

    io.to(roomId).emit("stop-song");
    prevRef.downloadProcess = downloadSong(
      prevRef,
      __dirname,
      roomId,
      () => {
        prevRef.isDownloaded = true;
        prevRef.isDownloading = false;
        room.nowPlaying = undefined;
        tryPlayNext(room);
      },
      () => sendErrorMsg("Something went wrong!", room)
    );
    room.queue.forEach((s, i) => (s.serial = i + 1));

    io.to(roomId).emit("set-queue", room.queue);
  });

  //Server public/private state
  socket.on("change-server-status", (roomId) => {
    let room = getRoom(roomId, rooms);
    if (room?.roomState === "public") {
      room.roomState = "private";
    } else if (room?.roomState === "private") room.roomState = "public";
    io.to(roomId).emit("get-server-status", room.roomState);
  });

  //toggle Pause state
  socket.on("toggle-play-state", (data) => {
    const room = getRoom(data.roomId, rooms);
    if (!room) return;

    togglePlayState(room, data.shouldPause, data.currentTime);
    io.to(data.roomId).emit("play-state-changed", {
      shouldPause: data.shouldPause,
      elapsed: room.elapsedBeforePause,
    });
  });

  socket.on("seek-event", ({ roomId, newTime }) => {
    const room = getRoom(roomId, rooms);
    handleseekTime(room, newTime);
    io.to(roomId).emit("handle-seek", newTime);
  });

  //add a new song
  socket.on("add-song", (data) => {
    const room = getRoom(data.roomId, rooms);
    if (!room) return;

    if (room.queue.some((song) => data.videoId === song.videoId)) {
      sendErrorMsg("Track has been already added!");
      return;
    }
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

    if (room.queue.length <= 3) {
      consistentDownload(song, room);
    }

    io.to(data.roomId).emit("set-queue", room.queue);
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
        if (socket.socketSession.rank === "host") {
          const newHost =
            room.members[getRandomInt(0, room.members.length - 1)];
          if (newHost) {
            newHost.rank = "host";
          }
        }
        io.to(roomId).emit("update-join", room.members);

        if (room.members.length === 0) {
          console.log(`Room ${room.roomId} is empty, deleting it.`);
          const roomIndex = rooms.findIndex((obj) => obj.roomId === roomId);
          clearTimeout(room.timeoutId);
          if (roomIndex !== -1) {
            for (const song of room.queue) {
              console.log(song);

              if (song.isDownloading && song.downloadProcess) {
                song.downloadProcess.kill("SIGKILL");
                console.log(`🚫 Canceled download for: ${song.videoId}`);
              }
            }
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

const audioPath = path.join(__dirname, "audio");
function cleanUpUnusedAudioFolders() {
  const activeRoomIds = rooms.map((room) => room.roomId);

  fs.readdir(audioPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Failed to read audio directory:", err);
      return;
    }

    files.forEach((file) => {
      if (file.isDirectory()) {
        const roomId = file.name;
        if (!activeRoomIds.includes(roomId)) {
          const dirPath = path.join(audioPath, roomId);
          fs.rm(dirPath, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error(`Failed to delete folder ${dirPath}:`, err);
            } else {
              console.log(`Deleted unused audio folder for room: ${roomId}`);
            }
          });
        }
      }
    });
  });
}

setInterval(cleanUpUnusedAudioFolders, 5 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
