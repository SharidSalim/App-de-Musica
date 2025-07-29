const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

class roomData {
  chats = [];
  members = [];
  queue = [];
  nowPlaying = undefined;
  paused = false;
  playedHistory = [];
  roomStartTime = Date.now();
  startTime = undefined;
  timeoutId = undefined;
  roomState = "private";
  constructor(roomId) {
    this.roomId = roomId;
  }
  // playPrev() {
  //   if (this.playedHistory.length === 0) return false;

  //   // Clear current timeout if playing
  //   if (this.timeoutId) clearTimeout(this.timeoutId);

  //   // Re-insert current song to queue if exists
  //   const prevSong = this.playedHistory.pop();
  //   if (this.nowPlaying) {
  //     this.queue.unshift(prevSong);
  //     this.queue[0].isDownloaded = false
  //   }

  //   // Get previous song from history

  //   this.nowPlaying = prevSong;
  //   this.startTime = Date.now();

  //   // Update queue serial numbers
  //   this.queue.forEach((s, i) => (s.serial = i + 1));

  //   return true;
  // }
  playPrev() {
    if (this.playedHistory.length === 0) return false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Get last played song
    const prevSong = this.playedHistory.pop();

    // If currently playing, move it back to queue
    if (this.nowPlaying) {
      this.queue.unshift(this.nowPlaying);
      this.queue[0].isDownloaded = false;
    }

    this.nowPlaying = prevSong;
    this.startTime = Date.now(); // Reset start time

    this.queue.forEach((s, i) => (s.serial = i + 1));
    return true;
  }
}

class songData {
  serial = 0;

  isDownloaded = false;
  isDownloading = false;
  downloadProcess = null;

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

function downloadSong(song, dir, roomId, then, Catch) {
  const outputFolder = path.resolve(dir, "audio", roomId);

  // Ensure the folder exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Construct full output path
  const outputPath = path.join(outputFolder, `${song.videoId}.%(ext)s`);

  if (fs.existsSync(outputPath)) {
    console.log("✅ File already exists!");
    then();
    return;
  }

  const process = ytdlp.exec(song.url, {
    output: outputPath,
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: "0",
    maxFilesize: "15M",
    ffmpegLocation: ffmpegPath,
  });

  song.downloadProcess = process;
  console.log(song);

  song.downloadProcess
    .then((output) => {
      const stats = fs.statSync(path.join(outputFolder, `${song.videoId}.mp3`));
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > 15) {
        console.warn("❌ File too big, deleting:", song.videoId);
        fs.unlinkSync(outputPath);
        throw new Error("File size exceeds 15MB");
      }

      console.log("✅ Download complete!");
      console.log(`Saved as: ${song.videoId}.mp3 (${fileSizeMB.toFixed(2)}MB)`);
      then();
      song.downloadProcess = undefined
    })
    .catch((err) => {
      if (err.isCanceled) {
        console.log(`Download canceled: ${song.videoId}`);
      } else {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }
      Catch();
      song.downloadProcess = undefined
      console.error("❌ Download failed:", err);
    });

  return process;
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
