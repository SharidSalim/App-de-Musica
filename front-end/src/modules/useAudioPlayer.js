// // hooks/useAudioPlayer.js
// import { useEffect, useRef, useState, useCallback } from "react";

// const useAudioPlayer = () => {
//   const audioRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentSrc, setCurrentSrc] = useState(null);
//   const [progress, setProgress] = useState(0);

//   const play = useCallback((src) => {
//     if (!src) return;
//     if (audioRef.current) {
//       audioRef.current.pause();
//     }

//     const audio = new Audio(src);
//     audioRef.current = audio;

//     audio.addEventListener("ended", () => setIsPlaying(false));
//     audio.addEventListener("timeupdate", () => {
//       setProgress(audio.currentTime / audio.duration);
//     });

//     audio.play()
//       .then(() => {
//         setIsPlaying(true);
//         setCurrentSrc(src);
//       })
//       .catch(console.error);
//   }, []);

//   const pause = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
//   }, []);

//   const resume = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   }, []);

//   const stop = useCallback(() => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       setIsPlaying(false);
//     }
//   }, []);

//   const seek = useCallback((percent) => {
//     if (audioRef.current && audioRef.current.duration) {
//       audioRef.current.currentTime = percent * audioRef.current.duration;
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//     };
//   }, []);

//   return {
//     audio: {
//       play,
//       pause,
//       resume,
//       stop,
//       seek,
//       get isPlaying() {
//         return isPlaying;
//       },
//       get progress() {
//         return progress;
//       },
//       get currentSrc() {
//         return currentSrc;
//       },
//     },
//   };
// };

// export default useAudioPlayer;

// hooks/useAudioPlayer.js
import { useEffect, useRef, useState, useCallback } from "react";

const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [progress, setProgress] = useState(0);
  const onEndedRef = useRef(null); // to persist the callback

  const play = useCallback((src, onEnded) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(src);
    audioRef.current = audio;
    onEndedRef.current = onEnded;

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      if (onEndedRef.current) onEndedRef.current(); // Call the callback
    });

    audio.addEventListener("timeupdate", () => {
      setProgress(audio.currentTime / audio.duration);
    });

    audio.play()
      .then(() => {
        setIsPlaying(true);
        setCurrentSrc(src);
      })
      .catch(console.error);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((percent) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  }, []);

  useEffect(() => {
    return () => {
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
      get isPlaying() {
        return isPlaying;
      },
      get progress() {
        return progress;
      },
      get currentSrc() {
        return currentSrc;
      },
    },
  };
};

export default useAudioPlayer;

