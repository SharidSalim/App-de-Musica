import React, { useState, useEffect, useRef } from "react";
import QueueCard from "../components/QueueCard";
import FuncButton from "../components/FuncButton";
import {
  FaArrowDown,
  FaPause,
  FaPlay,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoChatbubbleSharp,
  IoSendSharp,
} from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { useNavigate, useLocation, useParams } from "react-router";

import { io } from "socket.io-client";
import MemberCard from "../components/MemberCard";
import Chat from "../components/Chat";
import { getVideoDetails, formatTime } from "../modules/utilities";
import useAudioPlayer from "../modules/useAudioPlayer";
import PlayingSong from "../components/PlayingSong";
import PlaceholderDiv from "../components/PlaceholderDiv";
import { toast, ToastContainer, Slide } from "react-toastify";
import GearDropdown from "../components/GearDropDown";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

const Server = () => {
  const { roomId } = useParams();

  const { audio } = useAudioPlayer();

  const [initMember, setInitMember] = useState([]);
  const [chatSection, setChatSection] = useState(false);
  const [chatsInit, setChatsInit] = useState([]);
  const [queueInit, setQueueInit] = useState([]);
  const [msg, setMsg] = useState("");
  const [userData, setUserData] = useState("");
  const [songURL, setSongURL] = useState("");
  const [serverStatus, setServerStatus] = useState("");
  const [onPage, setOnPage] = useState("player");
  const [volume, setVolume] = useState(50);
  const [chatNotify, setChatNotify] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const name = location.state?.userName || undefined;

  const handleScroll = () => {
    const el = messageContainerRef.current;
    const threshold = 50;
    const isUserAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(isUserAtBottom);
    if (isUserAtBottom) setShowJumpButton(false);
  };

  //Socket events
  useEffect(() => {
    if ("") {
      navigate("/");
    } else {
      socketRef.current = io("http://localhost:3001", {
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      socketRef.current.emit("join-room", { roomId, name: name });
    }
    socketRef.current.on("userData-retrieve", (data) => {
      sessionStorage.setItem("userData", JSON.stringify(data));
      setUserData(sessionStorage.getItem("userData"));
    });

    socketRef.current.on("get-server-status", (status) =>
      setServerStatus(status)
    );
    socketRef.current.on("set-chat", (chat) => {
      if (chat.length > 0) {
        setChatsInit(chat);
        setChatNotify(true);
      } else {
        setChatsInit(chat);
      }
    });
    socketRef.current.on("set-queue", (e) => setQueueInit(e));

    socketRef.current.on("update-join", (a) => setInitMember(a));

    socketRef.current.on(
      "play-song",
      ({ path, startTime, paused, elapsed, serverTime }) => {
        if (paused) {
          // Load paused song at specific position
          console.log("Played paused one");

          audio.load(path, elapsed / 1000);
          audio.pause();
          setServerPaused(true);
        } else {
          // Normal playback
          // console.log("Played normal playback");

          // const offset = (Date.now() - startTime) / 1000;
          // audio.play(path, offset);
          // setServerPaused(false);
          const clientTime = Date.now();
          const timeDrift = clientTime - serverTime;
          const adjustedStartTime = startTime + timeDrift;
          const offset = (clientTime - adjustedStartTime) / 1000;

          audio.play(path, offset);
          setServerPaused(false);
        }
      }
    );

    socketRef.current.on("stop-song", () => audio.stop());

    socketRef.current.on("handle-seek", ({ newTime, serverTime }) => {
      audio.seekWithSync(newTime, serverTime);
    });

    socketRef.current.on("server-err", (errMsg) => {
      toast(errMsg);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("fired disconnect");
      }
      audio.stop();
    };
  }, [socketRef, roomId]);

  //Jump to recent chats
  useEffect(() => {
    if (isAtBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowJumpButton(true);
    }
  }, [chatsInit]);

  //track progress update
  const [seekValue, setSeekValue] = useState(audio.progress * 100);
  const [isDragging, setIsDragging] = useState(false);
  const handleChange = (e) => {
    setSeekValue(e.target.value);
  };

  // const handleSeekCommit = () => {
  //   const newTime = (seekValue / 100) * audio.duration;
  //   setIsDragging(false);
  //   socketRef.current.emit("seek-event",{roomId, newTime})
  // };
  const handleSeekCommit = () => {
    const newTime = (seekValue / 100) * audio.duration;
    setIsDragging(false);
    socketRef.current.emit("seek-event", {
      roomId,
      newTime,
      clientTime: Date.now(),
    });
  };

  const [serverPaused, setServerPaused] = useState(false);
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("play-state-changed", ({ shouldPause, elapsed }) => {
      if (shouldPause) {
        audio.pause();
        // If we have accurate elapsed time, set it
        if (elapsed) audio.seek(elapsed / 1000);
      } else {
        audio.resume();
      }
      setServerPaused(shouldPause);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("play-state-changed");
      }
    };
  }, [audio]);

  return (
    <div className="p-2.5 h-screen overflow-hidden w-full bg-db-primary background">
      <div className="w-full lg:hidden">
        <ul className="flex items-center justify-between px-2 py-3">
          <li>
            <button
              onClick={() => setOnPage("queue")}
              className={`font-poppins ${
                onPage === "queue"
                  ? "text-accent animate-appear"
                  : "text-txt-secondary"
              } font-[200] text-[24px]`}
            >
              Queue
            </button>
          </li>
          <li>
            <button
              onClick={() => setOnPage("player")}
              className={`font-poppins ${
                onPage === "player"
                  ? "text-accent animate-appear"
                  : "text-txt-secondary"
              } font-[200] text-[24px]`}
            >
              Player
            </button>
          </li>
          <li>
            <div className="relative">
              {chatNotify && onPage !== "lounge" && (
                <span className="absolute -top-1.5 -left-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
              )}
              <button
                onClick={() => setOnPage("lounge")}
                className={`font-poppins ${
                  onPage === "lounge"
                    ? "text-accent animate-appear"
                    : "text-txt-secondary"
                } font-[200] text-[24px]`}
              >
                Lounge
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div
        id="UpperSection"
        className="flex justify-between lg:h-[calc(100%-86px-12px)] h-[calc(100%-86px-12px-60px)]"
      >
        <div
          id="Queue"
          className={`glass-effect w-full lg:block shadow-md h-full lg:w-[241px] rounded-xl p-1.5 ${
            onPage === "queue" ? "block animate-appear" : "hidden"
          }`}
        >
          <div className="flex h-[31.5px] items-center justify-between">
            <h1 className="text-[21px] font-poppins text-txt-primary font-semibold ml-[14px]">
              Tracks
            </h1>
            <p className="mr-[14px] text-sm font-poppins text-accent">
              {queueInit.length}
            </p>
          </div>
          <PlaceholderDiv
            id="container"
            className="overflow-y-auto scrollbar h-[calc(100%-31.5px)]"
            msg="Add a track"
          >
            {queueInit.map((data) => (
              <QueueCard
                addedBy={data.addedBy}
                image={data.thumbnail}
                songName={data.title}
                QueueNum={data.serial}
              />
            ))}
          </PlaceholderDiv>
        </div>

        <div
          id="Spinner"
          className={`lg:w-[calc(100%-(241px*2))] w-full shadow-md relative bg-[#ffffff02] lg:mx-3 lg:block rounded-xl 
            ${onPage === "player" ? "block animate-appear" : "hidden"}`}
        >
          <div
            onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}
            className="absolute cursor-pointer  bg-db-tertiary m-2 rounded-md py-1 px-10"
          >
            <h1 className="font-poppins text-sm font-semibold text-accent">
              {roomId}
            </h1>
          </div>
          {/* <div
            id="Search"
            className="absolute p-2 bottom-0 right-1/2 translate-x-1/2 mb-5  gap-2.5 border-b-2 border-b-transparent  flex items-center"
          >
            <input
              type="url"
              name=""
              onChange={(e) => setSongURL(e.target.value.trim())}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  if (songURL !== "") {
                    try {
                      const { title, channel, thumbnail, videoId, duration } =
                        await getVideoDetails(
                          songURL,
                          import.meta.env.VITE_REACT_YT_API_KEY
                        );

                      socketRef.current.emit("add-song", {
                        url: songURL,
                        addedBy: JSON.parse(userData).name,
                        roomId,
                        title,
                        channel,
                        thumbnail,
                        videoId,
                        duration,
                      });
                    } catch (err) {
                      toast("Something went wrong");
                    }
                  } else {
                    toast("Enter Song URL");
                  }
                  setSongURL("");
                }
              }}
              placeholder="Enter song URL"
              value={songURL}
              autoComplete="off"
              id="SearchSong"
              className="outline-none text-txt-primary font-poppins text-sm bg-transparent placeholder:text-txt-secondary"
            />
            <FaSearch
              onClick={async () => {
                if (songURL !== "") {
                  try {
                    const { title, channel, thumbnail } = await getVideoDetails(
                      songURL,
                      "AIzaSyALIBF3-m4dY75SMX8cRHtPvhrKdreGxjg"
                    );

                    socketRef.current.emit("add-song", {
                      songURL,
                      addedBy: JSON.parse(userData).name,
                      roomId,
                      title,
                      channel,
                      thumbnail,
                    });
                  } catch (err) {
                    alert("Something went wrong");
                  }
                } else {
                  alert("Enter Song URL");
                }
                setSongURL("");
              }}
              size={22}
              className="text-txt-secondary  cursor-pointer hover:text-white transition duration-300"
            />
          </div> */}
          <div
            id="Search"
            className="group absolute p-2 bottom-0 right-1/2 translate-x-1/2 mb-5 gap-2.5 flex items-center"
          >
            <input
              type="url"
              placeholder="Enter song URL"
              value={songURL}
              onChange={(e) => setSongURL(e.target.value.trim())}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  if (songURL !== "") {
                    try {
                      const { title, channel, thumbnail, videoId, duration } =
                        await getVideoDetails(
                          songURL,
                          import.meta.env.VITE_REACT_YT_API_KEY
                        );

                      socketRef.current.emit("add-song", {
                        url: songURL,
                        addedBy: JSON.parse(userData).name,
                        roomId,
                        title,
                        channel,
                        thumbnail,
                        videoId,
                        duration,
                      });
                    } catch (err) {
                      toast("Something went wrong");
                    }
                  } else {
                    toast("Enter Song URL");
                  }
                  setSongURL("");
                }
              }}
              id="SearchSong"
              autoComplete="off"
              className={`
      w-0 
      group-hover:w-[276px] 
      focus:w-[276px]
      bg-transparent 
      outline-none 
      text-sm 
      placeholder:text-txt-secondary 
      text-txt-primary 
      border-b-2 
      border-transparent 
      focus:border-teal-300 
      transition-all 
      duration-300 
      font-poppins
    `}
            />

            <FaSearch
              onClick={async () => {
                if (songURL !== "") {
                  try {
                    const { title, channel, thumbnail, videoId, duration } =
                      await getVideoDetails(
                        songURL,
                        import.meta.env.VITE_REACT_YT_API_KEY
                      );

                    socketRef.current.emit("add-song", {
                      url: songURL,
                      addedBy: JSON.parse(userData).name,
                      roomId,
                      title,
                      channel,
                      thumbnail,
                      videoId,
                      duration,
                    });
                  } catch (err) {
                    toast("Something went wrong");
                  }
                } else {
                  toast("Enter Song URL");
                }
                setSongURL("");
              }}
              size={22}
              className="text-txt-secondary cursor-pointer hover:text-accent transition duration-300"
            />
          </div>

          <div
            id="Blur"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[323px] h-[323px]"
          >
            <div className="w-full h-full rounded-full bg-accent opacity-20 blur-3xl animate-pulsate"></div>
          </div>
        </div>

        {!chatSection ? (
          <div
            id="Friends"
            className={`glass-effect lg:block shadow-md p-1.5 w-full filter h-full lg:w-[241px] rounded-xl ${
              onPage === "lounge" ? "block animate-appear" : "hidden"
            } `}
          >
            <div className="flex h-[31.5px] items-center justify-between mx-3.5">
              <h1 className="text-[21px] font-poppins text-txt-primary font-semibold ">
                Friends
              </h1>
              <p className="text-sm font-poppins text-accent">
                {initMember.length}/15
              </p>
              {!chatSection ? (
                <div
                  className="relative w-[77.97px] flex justify-end lg:hidden cursor-pointer"
                  onClick={() => {
                    setChatSection(!chatSection);
                    setChatNotify(false);
                  }}
                >
                  {chatNotify && (
                    <span className="absolute top-0 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                  )}

                  <IoChatbubbleSharp
                    size={22}
                    className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                  />
                </div>
              ) : (
                <FaUserFriends
                  onClick={() => {
                    setChatSection(!chatSection);
                    setChatNotify(false);
                  }}
                  size={22}
                  className="cursor-pointer lg:hidden text-txt-secondary hover:text-accent transition duration-300"
                />
              )}
            </div>
            <div className="overflow-y-auto scrollbar h-[calc(100%-31.5px)]">
              {initMember.map((memberData) => (
                <MemberCard
                  rank={memberData.rank}
                  name={memberData.name}
                  you={JSON.parse(userData).id === memberData.id ? true : false}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            id="Chats"
            className={`glass-effect lg:block shadow-md p-1.5  filter h-full w-full lg:w-[241px] rounded-xl ${
              onPage === "lounge" ? "block animate-appear" : "hidden"
            } `}
          >
            <div className="flex items-center justify-between mx-3.5">
              <h1 className="text-[21px] h-[31.5px] font-poppins text-txt-primary font-semibold">
                Chats
              </h1>
              {!chatSection ? (
                <div
                  className="relative lg:hidden cursor-pointer"
                  onClick={() => {
                    setChatSection(!chatSection);
                    setChatNotify(false);
                  }}
                >
                  {chatNotify && (
                    <span className="absolute top-0 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                  )}

                  <IoChatbubbleSharp
                    size={26}
                    className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                  />
                </div>
              ) : (
                <FaUserFriends
                  onClick={() => {
                    setChatSection(!chatSection);
                    setChatNotify(false);
                  }}
                  size={26}
                  className="cursor-pointer lg:hidden text-txt-secondary hover:text-accent transition duration-300"
                />
              )}
            </div>
            <div className="flex relative flex-col justify-end h-[calc(100%-31.5px-35px)]">
              <div
                ref={messageContainerRef}
                onScroll={handleScroll}
                className="flex flex-col pb-1 overflow-y-auto scrollbar gap-y-3"
              >
                {chatsInit.map((msg, i) =>
                  msg.senderId ===
                  JSON.parse(sessionStorage.getItem("userData")).id ? (
                    <Chat
                      msg={msg.msg}
                      name={msg.sender}
                      currentClient={true}
                      key={i}
                    />
                  ) : (
                    <Chat msg={msg.msg} name={msg.sender} key={i} />
                  )
                )}
                <div ref={messageEndRef} />
              </div>
              {showJumpButton && (
                <FuncButton
                  onClick={() => {
                    messageEndRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                    setShowJumpButton(false);
                  }}
                  className="absolute group animate-appear z-10 left-[50%] translate-x-[-50%] bottom-[8px] bg-[#ffffff60]"
                  diameter={"35px"}
                >
                  <FaArrowDown
                    size={14}
                    className="text-gray-400 group-hover:text-gray-800"
                  />
                </FuncButton>
              )}
            </div>
            <div
              id="ChatBar"
              className="h-[35px] flex justify-between items-center px-2 "
            >
              <input
                onChange={(e) => setMsg(e.target.value)}
                value={msg}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (msg !== "") {
                      const b = JSON.parse(
                        sessionStorage.getItem("userData")
                      )?.name;

                      socketRef.current.emit("send-msg", {
                        name: b,
                        roomId,
                        msg,
                      });
                      setMsg("");
                    } else {
                      console.warn("UserData not ready or message empty.");
                    }
                  }
                }}
                className="text-txt-primary placeholder:text-txt-secondary outline-none flex-grow"
                placeholder="Message..."
                type="text"
                name=""
                id=""
              />
              <IoSendSharp
                onClick={() => {
                  if (msg !== "") {
                    const b = JSON.parse(
                      sessionStorage.getItem("userData")
                    )?.name;

                    socketRef.current.emit("send-msg", {
                      name: b,
                      roomId,
                      msg,
                    });
                    setMsg("");
                  } else {
                    console.warn("UserData not ready or message empty.");
                  }
                }}
                size={20}
                className="cursor-pointer ml-3.5 text-txt-secondary hover:text-accent transition duration-300"
              />
            </div>
          </div>
        )}
      </div>

      <div
        id="PlayBar"
        className="h-[86px] p-2 flex shadow-lg  items-center glass-effect rounded-xl mt-3"
      >
        <PlayingSong
          name={queueInit[0]?.title}
          url={queueInit[0]?.thumbnail}
          channel={queueInit[0]?.channel}
        />
        <div className="flex flex-col items-center flex-grow max-w-lg mx-auto w-full">
          <div className="flex items-center w-full lg:w-auto justify-between mx-2">
            <div className="lg:hidden w-[56px]">
              <ImExit
                onClick={() => {
                  navigate("/");
                }}
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                size={22}
              />
            </div>
            <div className="flex items-center gap-x-3.5 my-1.5">
              <IoPlaySkipBack
                size={20}
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                onClick={() => socketRef.current.emit("play-prev", roomId)}
              />
              {/* {serverPaused ? (
                <FuncButton
                  onClick={() => {
                    socketRef.current.emit("toggle-play-state", {
                      roomId,
                      shouldPause: false,
                    });
                  }}
                  className="group border-3 border-gray-100 hover:bg-[#ffffff60] hover:border-white transition duration-300"
                  diameter={"40px"}
                >
                  <FaPlay
                    size={16}
                    className="text-gray-100 group-hover:text-white transition duration-300"
                  />
                </FuncButton>
              ) : (
                <FuncButton
                  onClick={() => {
                    socketRef.current.emit("toggle-play-state", {
                      roomId,
                      shouldPause: true,
                      currentTime: audio.currentTime * 1000,
                    });
                  }}
                  className="group border-3 border-gray-100 hover:bg-[#ffffff60] hover:border-white transition duration-300"
                  diameter={"40px"}
                >
                  <FaPause
                    size={16}
                    className="text-gray-100 group-hover:text-white transition duration-300"
                  />
                </FuncButton>
              )} */}
              {serverPaused ? (
                <button
                  onClick={() => {
                    socketRef.current.emit("toggle-play-state", {
                      roomId,
                      shouldPause: false,
                    });
                  }}
                  className="w-10 h-10 rounded-full bg-db-tertiary flex items-center justify-center hover:bg-accent group transition-all duration-300"
                >
                  <FaPlay
                    size={14}
                    className="text-txt-secondary group-hover:text-db-primary transition duration-300 ml-1"
                  />
                </button>
              ) : (
                <button
                  onClick={() => {
                    socketRef.current.emit("toggle-play-state", {
                      roomId,
                      shouldPause: true,
                      currentTime: audio.currentTime * 1000,
                    });
                  }}
                  className="w-10 h-10 rounded-full bg-db-tertiary flex items-center justify-center hover:bg-accent group transition-all duration-300"
                >
                  <FaPause
                    size={14}
                    className="text-txt-secondary group-hover:text-db-primary transition duration-300"
                  />
                </button>
              )}
              <IoPlaySkipForward
                size={20}
                onClick={() => socketRef.current.emit("skip-song", roomId)}
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
              />
            </div>
            <div className="flex gap-x-2 lg:hidden">
              <GearDropdown
                status={serverStatus}
                setServerStatus={() => {
                  socketRef.current.emit("change-server-status", roomId);
                }}
              />
              {volume > 0 ? (
                <FaVolumeHigh
                  className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                  size={22}
                  onClick={() => {
                    setVolume(0);
                    audio.setVolume(0);
                  }}
                />
              ) : (
                <FaVolumeXmark
                  className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                  size={22}
                  onClick={() => {
                    setVolume(50);
                    audio.setVolume(0.5);
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center w-full gap-2 mt-2 mx-5">
            <p
              id="timer"
              className="font-poppins font-medium w-6 text-[12.5px] text-txt-secondary"
            >
              {formatTime(audio.currentTime)}
            </p>

            <input
              className="flex-grow h-1"
              value={audio.progress * 100}
              type="range"
              min={0}
              max={100}
              name=""
              id=""
              onChange={handleChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={handleSeekCommit}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={handleSeekCommit}
            />

            <p
              id="duration"
              className="font-poppins w-6 font-medium text-[12.5px] text-txt-secondary"
            >
              {formatTime(audio.duration)}
            </p>
          </div>
        </div>
        <div className="items-center gap-x-3 hidden lg:flex">
          <ImExit
            onClick={() => {
              navigate("/");
            }}
            className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
            size={22}
          />

          <GearDropdown
            status={serverStatus}
            setServerStatus={() => {
              socketRef.current.emit("change-server-status", roomId);
            }}
          />
          {!chatSection ? (
            <div
              className="relative cursor-pointer"
              onClick={() => {
                setChatSection(!chatSection);
                setChatNotify(false);
              }}
            >
              {chatNotify && (
                <span className="absolute top-0 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
              )}

              <IoChatbubbleSharp
                size={22}
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
              />
            </div>
          ) : (
            <FaUserFriends
              onClick={() => {
                setChatSection(!chatSection);
                setChatNotify(false);
              }}
              size={22}
              className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
            />
          )}
          <div className="flex items-center">
            {volume > 0 ? (
              <FaVolumeHigh
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                size={22}
                onClick={() => {
                  setVolume(0);
                  audio.setVolume(0);
                }}
              />
            ) : (
              <FaVolumeXmark
                className="cursor-pointer text-txt-secondary hover:text-accent transition duration-300"
                size={22}
                onClick={() => {
                  setVolume(50);
                  audio.setVolume(0.5);
                }}
              />
            )}
            <input
              className="w-[120px] h-1 mx-1"
              type="range"
              min={0}
              max={100}
              onChange={(e) => {
                const vol = parseInt(e.target.value);
                setVolume(vol);
                audio.setVolume(vol / 100);
              }}
              value={volume}
              name=""
              id=""
            />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1568}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </div>
  );
};

export default Server;
