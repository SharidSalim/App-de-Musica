const express = require("express");

const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const {
  generateRoomCode,
  getRoom,
  roomData,
  songData,
  memberData,
  chatData,
  rankPriority
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
  res.send(rooms);
});

app.get("/rooms/:id", (req, res) => {
  const roomInfo = rooms.find((obj) => obj.roomId === req.params.id);

  res.send(roomInfo);
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
      

      const members = rooms[indexRoom]?.members
      members.sort((a,b)=>{
         return rankPriority[a.rank] - rankPriority[b.rank];
      })
      io.to(data.roomId).emit("update-join", members);
    }
    console.log(`User ${data.name}:${socket.id} joined room ${data.roomId}`);
  });

  socket.on("send-msg", (data) => {
    const msg = new chatData(data.name, socket.id, data.msg);

    getRoom(data.roomId, rooms).chats.push(msg);
    io.to(data.roomId).emit("set-chat", rooms[indexRoom]?.chats);
  });

  socket.on("skip-song", (data) => {
    let room = getRoom(data, rooms);

    if (room.queue.length > 0) {
      room.queue.shift();
      room.queue.forEach((song, index) => {
        song.serial = index + 1;
      });
      io.to(data).emit("set-queue", room?.queue);
    }
  });

  socket.on("add-song", (data) => {
    let room = getRoom(data.roomId, rooms);
    const song = new songData(
      data.songURL,
      data.addedBy,
      data.title,
      data.channel,
      data.thumbnail
    );

    song.serial = room?.queue.length + 1;
    room.queue.push(song);
    io.to(data.roomId).emit("set-queue", room?.queue);
    console.log(song);
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
