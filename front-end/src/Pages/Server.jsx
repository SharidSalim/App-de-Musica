import React, { useState, useEffect, useRef } from "react";
import QueueCard from "../components/QueueCard";
import FuncButton from "../components/FuncButton";
import {
  FaArrowDown,
  FaPause,
  FaPlay,
  FaSearch,
  FaUserFriends,
  FaVolumeUp,
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

    // socketRef.current.on("play-song", ({ path, startTime }) => {
    //   const offset = (Date.now() - startTime) / 1000;
    //   console.log(path, offset);

    //   audio.play(path, offset); // start playback from offset
    // });
    // Update the play-song event handler
    socketRef.current.on(
      "play-song",
      ({ path, startTime, paused, elapsed }) => {
        if (paused) {
          // Load paused song at specific position
          console.log("Played paused one");
          
          audio.load(path, elapsed / 1000);
          audio.pause();
          setServerPaused(true);
        } else {
          // Normal playback
          console.log("Played normal playback");
          
          const offset = (Date.now() - startTime) / 1000;
          audio.play(path, offset);
          setServerPaused(false);
        }
      }
    );

    socketRef.current.on("stop-song", () => audio.stop());

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

  useEffect(() => {
    if (isAtBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowJumpButton(true);
    }
  }, [chatsInit]);

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
    <div className="p-2.5 h-screen overflow-hidden w-full bg-[url(./assets/home_bg.jpg)] background">
      <div
        id="UpperSection"
        className="flex justify-between h-[calc(100%-86px-12px)]"
      >
        <div
          id="Queue"
          className="bg-[#ffffff15] shadow-md h-full w-[241px] rounded-xl p-1.5"
        >
          <div className="flex h-[31.5px] items-center justify-between">
            <h1 className="text-[21px] font-poppins text-white font-semibold ml-[14px]">
              Queue
            </h1>
            <p className="mr-[14px] text-sm font-poppins text-white">
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
          className="w-[calc(100%-(241px*2))] shadow-md relative bg-[#ffffff05]  mx-3 rounded-xl"
        >
          <div
            onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}
            className="absolute cursor-pointer  bg-[#e9e5e5e1] m-2 rounded-md py-1 px-10"
          >
            <h1 className="font-poppins text-sm font-semibold text-gray-600">
              {roomId}
            </h1>
          </div>
          <div
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
              className="outline-none text-[12px] placeholder:text-[16px] placeholder:font-raleway  placeholder:text-gray-50 font-raleway text-md "
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
              className="text-gray-100  cursor-pointer hover:text-white transition duration-300"
            />
          </div>
        </div>

        {!chatSection ? (
          <div
            id="Friends"
            className="bg-[#ffffff15] shadow-md p-1.5  filter h-full w-[241px] rounded-xl "
          >
            <div className="flex h-[31.5px] items-center justify-between">
              <h1 className="text-[21px] font-poppins text-white font-semibold ml-[14px]">
                Friends
              </h1>
              <p className="mr-[14px] text-sm font-poppins text-white">
                {initMember.length}/15
              </p>
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
            className="bg-[#ffffff15] shadow-md p-1.5  filter h-full w-[241px] rounded-xl "
          >
            <h1 className="text-[21px] h-[31.5px] font-poppins text-white font-semibold ml-[14px]">
              Chats
            </h1>
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
                className="outline-none"
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
                className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
              />
            </div>
          </div>
        )}
      </div>

      <div
        id="PlayBar"
        className="h-[86px] p-2 flex shadow-lg justify-between items-center bg-[#ffffff15] rounded-xl mt-3"
      >
        <PlayingSong
          name={queueInit[0]?.title}
          url={queueInit[0]?.thumbnail}
          channel={queueInit[0]?.channel}
        />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-x-5 my-1.5">
            <IoPlaySkipBack
              size={28}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
              onClick={() => socketRef.current.emit("play-prev", roomId)}
            />
            {/* {!pauseState ? (
              <FuncButton
                onClick={(e) => {
                  setPauseState(!pauseState);
                  pauseState ? audio.pause() : audio.resume();
                }}
                className={
                  "group border-3 border-gray-100 hover:bg-[#ffffff60] hover:border-white transition duration-300"
                }
                diameter={"40px"}
              >
                <FaPlay
                  size={16}
                  className="text-gray-100 group-hover:text-white transition duration-300"
                />
              </FuncButton>
            ) : (
              <FuncButton
                onClick={(e) => {
                  setPauseState(!pauseState);
                  pauseState ? audio.pause() : audio.resume();
                }}
                className={
                  "group border-3 border-gray-100 hover:bg-[#ffffff60] hover:border-white transition duration-300"
                }
                diameter={"40px"}
              >
                <FaPause
                  size={16}
                  className="text-gray-100 group-hover:text-white transition duration-300"
                />
              </FuncButton>
            )} */}

            {serverPaused ? (
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
            )}

            <IoPlaySkipForward
              size={28}
              onClick={() => socketRef.current.emit("skip-song", roomId)}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
          </div>
          <div className="flex items-center">
            <p
              id="timer"
              className="font-poppins font-medium w-6 text-[12.5px] text-white"
            >
              {formatTime(audio.currentTime)}
            </p>
            <input
              className="w-[475px] h-1 mx-3"
              value={audio.progress * 100}
              type="range"
              name=""
              id=""
            />

            <p
              id="duration"
              className="font-poppins w-6 font-medium text-[12.5px] text-white"
            >
              {formatTime(audio.duration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-x-3">
          <ImExit
            onClick={() => {
              navigate("/");
            }}
            className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                </span>
              )}

              <IoChatbubbleSharp
                size={22}
                className="text-gray-100 hover:text-white transition duration-300"
              />
            </div>
          ) : (
            <FaUserFriends
              onClick={() => {
                setChatSection(!chatSection);
                setChatNotify(false);
              }}
              size={22}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
          )}
          <div className="flex items-center">
            {volume > 0 ? (
              <FaVolumeHigh
                className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
                size={22}
                onClick={() => {
                  setVolume(0);
                  audio.setVolume(0);
                }}
              />
            ) : (
              <FaVolumeXmark
                className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
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
