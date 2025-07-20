// const ytdlp = require("yt-dlp-exec");
// const ffmpegPath = require("ffmpeg-static");
// const fs = require("fs");
// const path = require("path");

// const videoURL = "https://youtu.be/vb8wloc4Xpw?si=7Q9ARhoxmEPeUDS5";

// // Relative path from index.js to audio folder
// const outputFolder = path.resolve(__dirname, "audio");

// // Ensure the folder exists
// if (!fs.existsSync(outputFolder)) {
//   fs.mkdirSync(outputFolder, { recursive: true });
// }

// ytdlp(videoURL, {
//   output: path.join(outputFolder, "%(title)s.%(ext)s"),
//   extractAudio: true,
//   audioFormat: "mp3",
//   audioQuality: "0",
//   ffmpegLocation: ffmpegPath,
// })
//   .then((output) => {
//     console.log("✅ Download complete!");
//     console.log(output);
//   })
//   .catch((err) => {
//     console.error("❌ Download failed:", err);
//   });


const { v4: uuidv4 } = require("uuid"); // npm i uuid

const videoURL = "https://youtu.be/vb8wloc4Xpw?si=7Q9ARhoxmEPeUDS5";

