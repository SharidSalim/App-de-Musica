const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

class songData {
  serial = 0;
  constructor(url, addedBy, title, channel, thumbnail, videoId) {
    this.url = url;
    this.addedBy = addedBy;
    this.title = title;
    this.channel = channel;
    this.thumbnail = thumbnail;
    this.videoId = videoId;
  }
  path(PORT, roomId) {
    return `http://localhost:${PORT}/audio/${roomId}/${this.videoId}.mp3`;
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
  nowPlaying = undefined;
  loadedSongs=0

  constructor(roomId) {
    this.roomId = roomId;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRoom(roomId, rooms) {
  let indexRoom = rooms.findIndex((obj) => obj.roomId === roomId);
  return rooms[indexRoom];
}

const rankPriority = {
  host: 1,
  dj: 2,
  guest: 3,
};

function generateRoomCode(n) {
  const x = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const y = x + x.toLowerCase();
  let ret = "";
  for (let i = 0; i < n; i++) {
    ret += y[getRandomInt(0, y.length - 1)];
  }
  return ret;
}

function downloadSong(url, dir, roomId, videoId, then) {
  const outputFolder = path.resolve(dir, "audio", roomId);

  // Ensure the folder exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Construct full output path
  const outputPath = path.join(outputFolder, `${videoId}.%(ext)s`);

  ytdlp(url, {
    output: outputPath,
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: "0",
    ffmpegLocation: ffmpegPath,
  })
    .then((output) => {
      console.log("✅ Download complete!");
      console.log(`Saved as: ${videoId}.mp3`);
      then();
    })
    .catch((err) => {
      console.error("❌ Download failed:", err);
    });
}

module.exports = {
  generateRoomCode,
  getRandomInt,
  roomData,
  songData,
  memberData,
  chatData,
  getRoom,
  downloadSong,
  rankPriority,
};
