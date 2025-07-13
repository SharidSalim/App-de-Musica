import React from "react";
import QueueCard from "../components/QueueCard";
import FuncButton from "../components/FuncButton";
import { FaPlay } from "react-icons/fa";
import { IoPlaySkipBack } from "react-icons/io5";
import { IoPlaySkipForward } from "react-icons/io5";
import { IoChatbubbleSharp } from "react-icons/io5";
import { FaVolumeUp } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { useNavigate } from "react-router";
import { GrHelpBook } from "react-icons/gr";
import { FaSearch } from "react-icons/fa";
import { useParams } from "react-router";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useRef } from "react";

const Server = () => {
  const { roomId } = useParams();
  console.log(roomId);

  const navigate = useNavigate();
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      reconnectionAttempts: 5,
      timeout: 10000
    });
    socketRef.current.emit("join-room", { roomId });

    return () => {
      if (socketRef.current) {
        //socketRef.current.emit("user-leaving", roomId);
        
          socketRef.current.disconnect();
          socketRef.current = null;
          console.log("fired disconnect");
        
      }
    };
  }, [socketRef, roomId]);

  return (
    <div className="p-2.5 h-screen overflow-hidden w-full bg-[url(./assets/background.jpg)] background">
      <div
        id="UpperSection"
        className="flex justify-between h-[calc(100%-86px-12px)]"
      >
        <div
          id="Queue"
          className="bg-[#ffffff40] h-full w-[241px] rounded-xl p-1.5"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-[21px] font-poppins text-white font-semibold ml-[14px]">
              Queue
            </h1>
            <p className="mr-[14px] text-sm font-poppins text-white">16</p>
          </div>
          <div id="container">
            <QueueCard
              songName="Naga"
              addedBy={"nigga"}
              QueueNum={1}
              image={
                "https://i.pinimg.com/736x/e5/88/97/e5889767806916d6047a45a01a81a2e0.jpg"
              }
            />
            <QueueCard image={""} songName={"Sia - Felto"} />
            <QueueCard />
          </div>
        </div>
        <div
          id="Spinner"
          className="w-[calc(100%-(241px*2))] relative bg-[#ffffff40]  mx-3 rounded-xl"
        >
          <div className="absolute p-2">
            <h1 className="font-poppins">Room ID: {roomId}</h1>
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
              className="outline-none  placeholder:text-gray-300 font-poppins text-md text-white"
            />
            <FaSearch size={22} className="text-gray-200  cursor-pointer" />
          </div>
        </div>
        <div
          id="Friends"
          className="bg-[#ffffff40]  filter h-full w-[241px] rounded-xl "
        ></div>
      </div>
      <div
        id="PlayBar"
        className="h-[86px] p-2 flex justify-between items-center bg-[#ffffff40] rounded-xl mt-3"
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
            <span className="text-[12px] font-poppins font-semibold text-gray-300">
              {"Dua Lipa, DaBaby"}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-x-5 my-1.5">
            <IoPlaySkipBack
              size={28}
              className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
            />
            <FuncButton
              className={
                "group hover:bg-[#ffffff60] hover:border-white transition duration-300"
              }
              diameter={"40px"}
            >
              <FaPlay
                size={16}
                className="text-gray-200 group-hover:text-white transition duration-300"
              />
            </FuncButton>
            <IoPlaySkipForward
              size={28}
              className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
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
            className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
            size={22}
          />
          <GrHelpBook
            size={22}
            className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
          />
          <IoChatbubbleSharp
            size={22}
            className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
          />
          <div className="flex items-center">
            <FaVolumeUp
              className="cursor-pointer text-gray-200 hover:text-white transition duration-300"
              size={22}
            />
            <input className="w-[120px] h-1 mx-1" type="range" name="" id="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Server;
