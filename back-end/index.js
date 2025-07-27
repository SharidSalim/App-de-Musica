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

  console.log("Now Playing: ", room.nowPlaying);

  if (next.isDownloaded && room.nowPlaying === undefined) {
    room.nowPlaying = next;
    room.startTime = Date.now();
    io.to(room.roomId).emit("play-song", {
      path: next.path(PORT, room.roomId),
      startTime: room.startTime,
    });
    console.log("Ran play-song");

    room.timeoutId = setTimeout(() => {
      room.queue.shift();
      room.queue.forEach((s, i) => (s.serial = i + 1));
      room.nowPlaying = undefined;
      io.to(room.roomId).emit("set-queue", room.queue);
      tryPlayNext(room); // Play next track
    }, next.duration * 1000);
  }
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
      socket.emit("get-server-status", rooms[indexRoom]?.roomState)

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

  socket.on("send-msg", (data) => {
    const msg = new chatData(data.name, socket.id, data.msg);
    const room = getRoom(data.roomId, rooms);

    getRoom(data.roomId, rooms).chats.push(msg);
    if (getRoom(data.roomId, rooms).chats.length > 50) {
      getRoom(data.roomId, rooms).chats.shift();
    }
    io.to(data.roomId).emit("set-chat", room.chats);
  });

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


  socket.on("change-server-status",(roomId)=>{
    let room = getRoom(roomId,rooms)
    if(room?.roomState==="public"){
      room.roomState = "private"
    } else if (room?.roomState==="private") room.roomState = "public"
    io.to(roomId).emit("get-server-status",room.roomState)
  })

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

    // Start downloading immediately
    downloadSong(
      song.url,
      __dirname,
      data.roomId,
      song.videoId,
      () => {
        song.isDownloaded = true;
        room.loadedSongs += 1;
        io.to(data.roomId).emit("set-queue", room.queue);
        tryPlayNext(room);
      },
      () => {
        io.to(data.roomId).emit("set-queue", room.queue);
      }
    );

    console.log(room.nowPlaying);

    io.to(data.roomId).emit("set-queue", room.queue);
  });

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
