
class songData{
  serial=0
  constructor(url,addedBy, title, channel, thumbnail){
    this.url =url
    this.addedBy = addedBy
     this.title =  title
  this.channel = thumbnail
  this.thumbnail = thumbnail
  }
}

class memberData {
  constructor(name, id, rank) {
    this.name = name;
    this.id = id;
    this.rank = rank;
  }
}

class chatData {
  constructor(sender, senderId, msg) {
    this.sender = sender;
    this.senderId = senderId;
    this.msg = msg;
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

function getRoom(roomId, rooms){
 let indexRoom = rooms.findIndex((obj) => obj.roomId === roomId);
 return rooms[indexRoom]
}

const rankPriority = {
  host: 1,
  dj:2,
  guest: 3
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

module.exports = {generateRoomCode, getRandomInt, roomData, songData, memberData,chatData, getRoom, rankPriority}