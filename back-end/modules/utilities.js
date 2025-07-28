const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

class roomData {
  chats = [];
  members = [];
  queue = [];
  nowPlaying = undefined;
  playedHistory = [];
  loadedSongs = 0;
  roomStartTime = Date.now();
  startTime = undefined;
  timeoutId = undefined;
  roomState = "private";
  constructor(roomId) {
    this.roomId = roomId;
  }
  playPrev() {
    if (this.playedHistory.length === 0) return false;

    // Clear current timeout if playing
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // Re-insert current song to queue if exists
    const prevSong = this.playedHistory[this.playedHistory.length - 1];
    if (this.nowPlaying) {
      this.queue.unshift(prevSong);
    }

    // Get previous song from history

    this.nowPlaying = prevSong;
    this.startTime = Date.now();

    // Update queue serial numbers
    this.queue.forEach((s, i) => (s.serial = i + 1));

    return true;
  }
}

class songData {
  serial = 0;

  isDownloaded = false;
  isDownloading = false;

  constructor(url, addedBy, title, channel, thumbnail, videoId, duration) {
    this.url = url;
    this.addedBy = addedBy;
    this.title = title;
    this.channel = channel;
    this.thumbnail = thumbnail;
    this.videoId = videoId;
    this.duration = duration;
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

function downloadSong(url, dir, roomId, videoId, then, Catch) {
  const outputFolder = path.resolve(dir, "audio", roomId);

  // Ensure the folder exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Construct full output path
  const outputPath = path.join(outputFolder, `${videoId}.%(ext)s`);

  if (fs.existsSync(outputPath)) {
    console.log("✅ File already exists!");
    then();
    return;
  }

  ytdlp(url, {
    output: outputPath,
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: "0",
    maxFilesize: "15M",
    ffmpegLocation: ffmpegPath,
  })
    .then((output) => {
      const stats = fs.statSync(path.join(outputFolder,`${videoId}.mp3`));
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > 15) {
        console.warn("❌ File too big, deleting:", videoId);
        fs.unlinkSync(outputPath);
        throw new Error("File size exceeds 15MB");
      }

      console.log("✅ Download complete!");
      console.log(`Saved as: ${videoId}.mp3 (${fileSizeMB.toFixed(2)}MB)`);
      then();
    })
    .catch((err) => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      Catch();
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
