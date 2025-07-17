const express = require("express");

const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { name } = require("ejs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const PORT = 3001

app.use(cors());
app.use(express.json());

const rooms = [];

class memberData {
  constructor(name, id, rank) {
    this.name = name;
    this.id = id;
    this.rank = rank;
  }
}

class chatData{
  constructor(sender, senderId, msg){
    this.sender = sender
    this.senderId = senderId
    this.msg = msg
  }
}

class roomData {
  chats = [];
  members = [];
  queue = [];

  constructor(roomId) {
    this.roomId = roomId;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRoomCode(n) {
  const x = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const y = x + x.toLowerCase();
  let ret = "";
  for (let i = 0; i < n; i++) {
    ret += y[getRandomInt(0, y.length - 1)];
  }
  return ret;
}

app.post("/create-room", (req, res) => {
  const room = new roomData(generateRoomCode(8));
  res.send(room);
  rooms.push(room);
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
      id: socket.id
     });
    socket.emit("set-chat", rooms[indexRoom]?.chats)
     io.to(data.roomId).emit("update-join",  rooms[indexRoom]?.members)

    }
    console.log(`User ${data.name}:${socket.id} joined room ${data.roomId}`);
  });

  socket.on("send-msg",(data)=>{
    const msg = new chatData(data.name,socket.id,data.msg)
     let indexRoom = rooms.findIndex((obj) => obj.roomId === data.roomId);
     rooms[indexRoom].chats.push(msg)
     io.to(data.roomId).emit("set-chat",rooms[indexRoom]?.chats)
    
  })

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
        io.to(roomId).emit("update-join",  room.members)

        if (room.members.length === 0) {
          console.log(`Room ${room.roomId} is empty, deleting it.`);
          const roomIndex = rooms.findIndex((obj) => obj.roomId === roomId);
          if (roomIndex !== -1) {
            rooms.splice(roomIndex, 1);
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
