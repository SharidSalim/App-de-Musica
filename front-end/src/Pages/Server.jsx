import React, { useState, useEffect, useRef } from "react";
import QueueCard from "../components/QueueCard";
import FuncButton from "../components/FuncButton";
import { FaPlay, FaSearch, FaUserFriends, FaVolumeUp } from "react-icons/fa";
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoChatbubbleSharp,
  IoSendSharp,
} from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { useNavigate, useLocation, useParams } from "react-router";
import { GrHelpBook } from "react-icons/gr";
import { io } from "socket.io-client";
import MemberCard from "../components/MemberCard";
import Chat from "../components/Chat";

const Server = () => {
  const { roomId } = useParams();

  const [userData, setUserData] = useState({});
  const [initMember, setInitMember] = useState([]);
  const [chatSection, setChatSection] = useState(false);
  const [chatsInit, setChatsInit] = useState([]);
  const [msg, setMsg] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const name = location.state?.userName || undefined;

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
      setUserData(data);
    });

    socketRef.current.on("set-chat", (chat) => setChatsInit(chat));

    socketRef.current.on("update-join", (a) => setInitMember(a));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("fired disconnect");
      }
      setUserData({});
    };
  }, [socketRef, roomId]);

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
            <p className="mr-[14px] text-sm font-poppins text-white">16</p>
          </div>
          <div
            id="container"
            className="overflow-y-auto scrollbar h-[calc(100%-31.5px)]"
          >
            {[...Array(9)].map((_, i) => (
              <QueueCard
                songName="Naga"
                addedBy={"nigga"}
                QueueNum={i + 1}
                image={
                  "https://i.pinimg.com/736x/e5/88/97/e5889767806916d6047a45a01a81a2e0.jpg"
                }
              />
            ))}
          </div>
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
              placeholder="Enter song URL"
              id="SearchSong"
              className="outline-none  placeholder:text-gray-50 font-poppins text-md text-white"
            />
            <FaSearch size={22} className="text-gray-100  cursor-pointer" />
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
              {userData && userData.name && userData.rank && (
                <MemberCard rank={userData.rank} name={userData.name} />
              )}

              {initMember.map(
                (memberData) =>
                  memberData.id !== userData.id && (
                    <MemberCard rank={memberData.rank} name={memberData.name} />
                  )
              )}
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
            <div className="flex flex-col justify-end  h-[calc(100%-31.5px-35px)]">
              <div className="flex flex-col overflow-y-auto scrollbar gap-y-3">
                {/* <Chat name="Bogged" msg='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed consectetur itaque labore eaque illo consequatur qui possimus ipsum incidunt officiis harum nulla assumenda est omnis, distinctio similique sapiente a placeat.'/>
                <Chat name="Bogged" msg='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed consectetur itaque labore eaque illo consequatur qui possimus ipsum incidunt officiis harum nulla assumenda est omnis, distinctio similique sapiente a placeat.'/>
                <Chat name="Bogged" msg='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed consectetur itaque labore eaque illo consequatur qui possimus ipsum incidunt officiis harum nulla assumenda est omnis, distinctio similique sapiente a placeat.'/>
               <Chat name="Bogged" msg='Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed consectetur itaque la'/> */}
                {chatsInit.map((msg) => (
                  <Chat msg={msg.msg} name={msg.name} />
                ))}
              </div>
            </div>
            <div
              id="ChatBar"
              className="h-[35px] flex justify-between items-center px-2 "
            >
              <input
                onChange={(e) => setMsg(e.target.value)}
                value={msg}
                className="outline-none"
                placeholder="Message..."
                type="text"
                name=""
                id=""
              />
              <IoSendSharp
                onClick={() => {
                  if (
                    userData?.name &&
                    userData?.rank &&
                    msg.trim().length > 0 &&
                    socketRef.current
                  ) {
                    socketRef.current.emit("send-msg", {
                      name: userData.name,
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
        <div className="flex items-center">
          <div
            style={{
              backgroundImage: `url("https://i.pinimg.com/736x/e5/88/97/e5889767806916d6047a45a01a81a2e0.jpg")`,
            }}
            className="w-[67px] background  h-[67px] rounded-lg"
          ></div>
          <p className="leading-4 ml-2">
            <span className="font-semibold font-poppins text-white text-[14px]">
              Levitating (Feat da baby)
            </span>
            <br />
            <span className="text-[12px] font-poppins font-semibold text-gray-200">
              {"Dua Lipa, DaBaby"}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-x-5 my-1.5">
            <IoPlaySkipBack
              size={28}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
            <FuncButton
              className={
                "group border-3 border-gray-100 hover:bg-[#ffffff60] hover:border-white transition duration-300"
              }
              diameter={"40px"}
              onClick={() => console.log(userData)}
            >
              <FaPlay
                size={16}
                className="text-gray-100 group-hover:text-white transition duration-300"
              />
            </FuncButton>
            <IoPlaySkipForward
              size={28}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
          </div>
          <div className="flex items-center">
            <p className="font-poppins font-medium text-[12.5px] text-white">
              1:00
            </p>
            <input className="w-[475px] h-1 mx-3" type="range" name="" id="" />

            <p className="font-poppins font-medium text-[12.5px] text-white">
              1:45
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
          <GrHelpBook
            size={22}
            className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
          />
          {!chatSection ? (
            <IoChatbubbleSharp
              onClick={() => setChatSection(!chatSection)}
              size={22}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
          ) : (
            <FaUserFriends
              onClick={() => setChatSection(!chatSection)}
              size={22}
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
            />
          )}
          <div className="flex items-center">
            <FaVolumeUp
              className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
              size={22}
            />
            <input
              className="w-[120px] h-1 mx-1"
              type="range"
              min={0}
              max={100}
              name=""
              id=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Server;
