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



async function getVideoDetails(videoUrl, apiKey) {
  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    console.error("Invalid YouTube URL");
    return;
  }

  const apiURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data.items.length === 0) {
      console.error("Video not found");
      return;
    }

    const snippet = data.items[0].snippet;
    const title = snippet.title;
    const channel = snippet.channelTitle;
    const thumbnail = snippet.thumbnails.high.url;

    return { title, channel, thumbnail, videoId };
  } catch (err) {
    console.error("Error fetching video details:", err);
  }
}

export {getVideoDetails, getVideoId}