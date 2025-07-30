import { useEffect, useRef, useState, useCallback } from "react";

const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [progress, setProgress] = useState(0);
  const syncIntervalRef = useRef(null);
  const onEndedRef = useRef(null);
  const startTimestampRef = useRef(0);
  const volumeRef = useRef(1); // Use ref instead of state

  const play = useCallback((src, offset = 0, onEnded) => {
    if (!src) return;

    // Clear previous interval and event listeners
    clearInterval(syncIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(src);
    audio.volume = volumeRef.current;
    audioRef.current = audio;
    onEndedRef.current = onEnded;

    const handleEnded = () => {
      setIsPlaying(false);
      clearInterval(syncIntervalRef.current);
      onEndedRef.current?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);

      if (offset > 0) {
        audio.currentTime = offset;
        startTimestampRef.current = Date.now() - offset * 1000;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setCurrentSrc(src);

          if (offset > 0) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = setInterval(() => {
              const expected = (Date.now() - startTimestampRef.current) / 1000;
              const actual = audio.currentTime;
              const drift = Math.abs(actual - expected);
              console.log("ran interval", drift);

              if (drift > 0.75) {
                console.log("Correcting drift", drift.toFixed(2));
                audio.currentTime = expected;
              }
            }, 3000);
          }
        })
        .catch(console.error);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Cleanup function for this audio instance
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearInterval(syncIntervalRef.current);
    }
  }, []);

  const load = useCallback((src, offset = 0) => {
    if (!src) return;

    clearInterval(syncIntervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(src);
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (offset > 0) {
        audio.currentTime = offset;
        startTimestampRef.current = Date.now() - offset * 1000;
      }
      setCurrentSrc(src);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      clearInterval(syncIntervalRef.current);
      onEndedRef.current?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.load();

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          // Update timestamp when resuming
          startTimestampRef.current =
            Date.now() - audioRef.current.currentTime * 1000;
        })
        .catch(console.error);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      clearInterval(syncIntervalRef.current);
    }
  }, []);

  // const seekUsingPercent = useCallback((percent) => {
  //   if (audioRef.current && audioRef.current.duration) {
  //     audioRef.current.currentTime = percent * audioRef.current.duration;
  //     // Update timestamp after seeking
  //     startTimestampRef.current =
  //       Date.now() - audioRef.current.currentTime * 1000;
  //   }
  // }, []);

  const seek = useCallback((timeInSeconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      startTimestampRef.current = Date.now() - timeInSeconds * 1000;
    }
  }, []);

  // Add this new function to handle synchronized seeking
const seekWithSync = useCallback((timeInSeconds, serverTime) => {
  if (audioRef.current) {
    // Calculate drift compensation
    const clientTime = Date.now();
    const serverOffset = serverTime - clientTime;
    
    audioRef.current.currentTime = timeInSeconds;
    startTimestampRef.current = clientTime - timeInSeconds * 1000 - serverOffset;
  }
}, []);

  const setVolume = useCallback((value) => {
    volumeRef.current = value;
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(syncIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    audio: {
      play,
      pause,
      resume,
      stop,
      seek,
      setVolume,
      load,
     seekWithSync,

      get isPlaying() {
        return isPlaying;
      },
      get progress() {
        return progress;
      },
      get currentSrc() {
        return currentSrc;
      },
      get currentTime() {
        return currentTime;
      },
      get duration() {
        return duration;
      },
    },
  };
};

export default useAudioPlayer;
