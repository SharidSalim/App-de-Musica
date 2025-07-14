// server.js or index.js
const express = require("express");
//const { v4: uuidv4 } = require('uuid');
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

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

function generateRoomCode() {
  const x = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const y = x + x.toLowerCase();
  let ret = "";
  for (let i = 0; i < 6; i++) {
    ret += y[getRandomInt(0, y.length - 1)];
  }
  return ret;
}

app.post("/create-room", (req, res) => {
  const room = new roomData(generateRoomCode());
  res.send(room);
  rooms.push(room);
});
app.get("/rooms", (req, res) => {
  res.send(rooms);
});

app.get('/rooms/:id',(req,res)=>{
  const roomInfo = rooms.find((obj)=>obj.roomId === req.params.id)

  res.send(roomInfo)
})

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (data) => {
    socket.join(data.roomId);
    let indexRoom = rooms.findIndex((obj) => obj.roomId === data.roomId);
    let rank = rooms[indexRoom].members.length === 0 ?"host":"guest"
    if (indexRoom !== -1) {
      const newMember = new memberData(data.name, socket.id, rank);
      rooms[indexRoom].members.push(newMember);
    }
    console.log(`User ${data.name}:${socket.id} joined room ${data.roomId}`);
  });

  // socket.on("user-leaving",(roomId)=>{
  //   console.log("fired user leaving");

  //   let roomIndex = rooms.findIndex((obj)=>obj.roomId === roomId)
  //   let memberIndex = rooms[roomIndex].members.findIndex((obj)=> obj.id === socket.id)
  //   if (memberIndex !==-1){
  //     rooms[roomIndex].members.splice(memberIndex,1)
  //   }
  // })
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    let roomId = null;
    for (const room of rooms) {
      const index = room.members.findIndex((m) => m.id === socket.id);
      if (index !== -1) {
        roomId = room.roomId;
        room.members.splice(index, 1);

        if (room.members.length === 0) {
          console.log(`Room ${room.roomId} is empty, deleting it.`);
          const roomIndex = rooms.findIndex((obj) => obj.roomId === roomId);
          if (roomIndex !== -1) {
            rooms.splice(roomIndex, 1); // ← this actually removes the room
          }
        }
        break;
      }
    }
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
