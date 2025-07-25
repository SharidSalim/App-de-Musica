function getVideoId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}



function convertISO8601ToSeconds(isoDurationString) {
    if (!isoDurationString || typeof isoDurationString !== 'string') {
        console.error("Invalid input: isoDurationString must be a non-empty string.");
        return 0;
    }

    // Regular expression to match hours, minutes, and seconds
    // It looks for patterns like '1H', '30M', '5S'
    const regex = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDurationString.match(regex);

    if (!matches) {
        console.error(`Could not parse ISO 8601 duration string: ${isoDurationString}`);
        return 0;
    }

    // Extract matched groups. If a group is not present, it will be undefined.
    // Convert them to numbers, defaulting to 0 if undefined.
    const days = parseInt(matches[1] || '0', 10);
    const hours = parseInt(matches[2] || '0', 10);
    const minutes = parseInt(matches[3] || '0', 10);
    const seconds = parseInt(matches[4] || '0', 10);

    // Calculate total seconds
    let totalSeconds = 0;
    totalSeconds += days * 24 * 60 * 60; // Convert days to seconds
    totalSeconds += hours * 60 * 60;     // Convert hours to seconds
    totalSeconds += minutes * 60;        // Convert minutes to seconds
    totalSeconds += seconds;             // Add remaining seconds

    return totalSeconds;
}



async function getVideoDetails(videoUrl, apiKey) {
  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    console.error("Invalid YouTube URL");
    return;
  }

  const apiURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data.items.length === 0) {
      console.error("Video not found");
      return;
    }

    const snippet = data.items[0].snippet;
    const contentDetails = data.items[0].contentDetails
    console.log(data);
    
    const title = snippet.title;
    const channel = snippet.channelTitle;
    const thumbnail = snippet.thumbnails.high.url;
    const duration = convertISO8601ToSeconds(contentDetails.duration)

    return { title, channel, thumbnail, videoId, duration };
  } catch (err) {
    console.error("Error fetching video details:", err);
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export {getVideoDetails, getVideoId, formatTime}