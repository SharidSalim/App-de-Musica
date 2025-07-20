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

const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // npm i uuid

const videoURL = "https://youtu.be/vb8wloc4Xpw?si=7Q9ARhoxmEPeUDS5";

// Relative path from index.js to audio folder
const outputFolder = path.resolve(__dirname, "audio");

// Ensure the folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Generate a unique ID
const uniqueId = uuidv4();

// Construct full output path
const outputPath = path.join(outputFolder, `${uniqueId}.%(ext)s`);

ytdlp(videoURL, {
  output: outputPath,
  extractAudio: true,
  audioFormat: "mp3",
  audioQuality: "0",
  ffmpegLocation: ffmpegPath,
})
  .then((output) => {
    console.log("✅ Download complete!");
    console.log(`Saved as: ${uniqueId}.mp3`);
  })
  .catch((err) => {
    console.error("❌ Download failed:", err);
  });
