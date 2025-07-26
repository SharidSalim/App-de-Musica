import React, { useEffect, useState } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router";
import FuncButton from "./components/FuncButton";
import { FaPlay } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { ToastContainer, toast, Slide } from "react-toastify";
import PublicRooms from "./components/PublicRooms";
import { calculateTimePassed } from "./modules/utilities";

const App = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [roomUI, setRoomUI] = useState("");
  const [userName, setUserName] = useState("");
  const [publicRooms, setPublicRooms] = useState([]);

  const URL = "http://localhost:3001";

  // useEffect(() => {
  //   const fetchRooms = async () => {
  //     try {
  //       const { data } = await axios.get(URL + "/rooms");
  //       const Public = data.filter((room) => room.roomState === "public");
  //       setPublicRooms(Public);
  //     } catch (err) {
  //       console.error("Failed to fetch rooms", err);
  //     }
  //   };
  //   fetchRooms();
  // }, []);

  return (
    <div>
      <nav className="w-full px-3.5 absolute z-30  py-[24px]">
        <div className="container flex justify-between">
          <div>
            <Link
              to="/"
              className="font-semiboldbold font-pacifico text-white text-[28px]"
            >
              App de Musica
            </Link>
          </div>
          <ul className="flex font-medium text-lg font-poppins text-white gap-x-[60px]">
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link>About</Link>
            </li>
            <li>
              <Link>Guide</Link>
            </li>
            <li>
              <Link to="https://github.com/SharidSalim/App-de-Musica">
                Github
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <section
        id="background"
        className="w-screen relative bg-[url(./assets/home_bg.jpg)] background h-screen px-3.5"
      >
        <div className="container">
          <div
            id="wrapper"
            className="w-full h-screen flex  items-center justify-between"
          >
            <div>
              <p className="font-bold font-poppins text-7xl text-white">
                LIVE <br />
                STREAM <br />
                MUSIC
              </p>
            </div>
            <div className="flex gap-x-2.5 items-center font-poppins">
              <p className="text-white">Click here to start</p>
              <FuncButton
                className="group bg-gray-100 hover:bg-white hover:translate-x-1.5 transition duration-300"
                diameter={"40px"}
                onClick={() => setOpenModal(!openModal)}
              >
                <FaPlay
                  size={16}
                  className="text-[#CCEBE6] group-hover:text-[#FFC8C5] transition duration-300"
                />
              </FuncButton>
            </div>
          </div>
        </div>
      </section>

      {openModal && (
        <div className="fixed top-0 left-0 w-full h-screen z-40 flex items-center justify-center">
          <div
            id="overlay"
            onClick={() => {
              setOpenModal(!openModal);
              setRoomUI("");
            }}
            className={`fixed top-0 left-0 w-full h-screen bg-[#00000060] animate-appear`}
          ></div>
          <div
            className={`w-[746px] bg-white h-[482px] drop-shadow-2xl flex animate-appear2`}
          >
            <div className="h-full w-[256px] background bg-[url(./assets/side_head.jpg)]"></div>
            <div
              style={{ display: roomUI === "" ? "flex" : "none" }}
              className="w-[calc(746px-256px)] flex flex-col gap-y-14 items-center justify-center "
            >
              <h1 className="font-raleway font-medium text-gray-400 text-3xl">
                Enter the Hangout!
              </h1>
              <div className="flex font-raleway flex-col font-medium text-xl">
                <button
                  onClick={() => setRoomUI("createUI")}
                  className="rounded-lg py-[15px] px-[24.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setRoomUI("joinUI")}
                  className="rounded-lg py-[15px] px-[24.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                >
                  Join Room
                </button>
              </div>
            </div>
            {(() => {
              if (roomUI === "createUI") {
                return (
                  <div className="w-[calc(746px-256px)] flex flex-col gap-y-14 items-center justify-center">
                    <h1 className="font-raleway font-medium text-gray-400 text-3xl">
                      Create a Room
                    </h1>
                    <div className="flex flex-col gap-y-2 items-center">
                      <input
                        type="text"
                        onChange={(e) => setUserName(e.target.value.trim())}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") {
                            try {
                              const res = await axios.post(
                                URL + "/create-room"
                              );
                              navigate(`/room/${res.data.roomId}`, {
                                state: { userName },
                              });
                            } catch (err) {
                              toast("Can't Connect to the Server");
                            }
                          }
                        }}
                        name=""
                        className=" pb-[8px] pt-1.5 outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-[#CCCCCC] transition duration-300"
                        placeholder="Enter your Display Name"
                      />
                      <button
                        className="rounded-lg py-[15px] px-[24.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                        onClick={async () => {
                          try {
                            const res = await axios.post(URL + "/create-room");
                            navigate(`/room/${res.data.roomId}`, {
                              state: { userName },
                            });
                          } catch (err) {
                            toast("Can't Connect to the Server");
                          }
                        }}
                      >
                        Create Room
                      </button>
                    </div>
                  </div>
                );
              } else if (roomUI === "joinUI") {
                return (
                  <div className="w-[calc(746px-256px)] flex flex-col items-center gap-y-4 justify-center">
                    <h1 className="font-raleway font-medium text-gray-400 text-3xl">
                      Join a Room
                    </h1>
                    <div className="flex flex-col">
                      <button
                        onClick={async () => {
                          setRoomUI("publicUI");
                          try {
                            const { data } = await axios.get(URL + "/rooms");
                            const Public = data.filter(
                              (room) => room.roomState === "public"
                            );
                            setPublicRooms(Public);
                          } catch (err) {
                            console.error("Failed to fetch rooms", err);
                          }
                        }}
                        className="rounded-lg py-[15px] px-[54.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                      >
                        Public Servers
                      </button>
                      <button
                        onClick={() => setRoomUI("privateUI")}
                        className="rounded-lg py-[15px] px-[54.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                      >
                        Join with Code
                      </button>
                    </div>
                  </div>
                );
              } else if (roomUI === "privateUI") {
                return (
                  <div className="w-[calc(746px-256px)] flex flex-col gap-y-14 items-center justify-center">
                    <h1 className="font-raleway font-medium text-gray-400 text-3xl">
                      Join a Room
                    </h1>
                    <div className="flex flex-col gap-y-2 items-center">
                      <input
                        type="text"
                        onChange={(e) => setUserName(e.target.value.trim())}
                        name=""
                        className=" pb-[8px] pt-1.5 outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-[#CCCCCC] transition duration-300"
                        placeholder="Enter your Display Name"
                      />
                      <input
                        type="text"
                        onChange={(e) => setCode(e.target.value.trim())}
                        name=""
                        className=" pb-[8px] pt-1.5 outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-[#CCCCCC] transition duration-300"
                        placeholder="Enter Room ID"
                      />
                      <button
                        className="rounded-lg py-[15px] px-[24.5px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
                        onClick={async () => {
                          try {
                            const res = await axios.get(`${URL}/rooms/${code}`);

                            if (res.data !== "") {
                              navigate("/room/" + code, {
                                state: { userName },
                              });
                            } else {
                              toast("Server doesn't Exist");
                            }
                          } catch (err) {
                            toast("Can't connect to server");
                          }
                        }}
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                );
              } else if (roomUI === "publicUI") {
                return (
                  <div className="w-[calc(746px-256px)] p-2.5">
                    <h1 className="font-raleway text-center font-medium text-gray-400 text-xl mt-4">
                      Available Public Rooms
                    </h1>
                    <div className="flex justify-end">
                      <TbReload
                        size={24}
                        className="text-gray-300 mr-2 mb-2 cursor-pointer"
                        onClick={async () => {
                          try {
                            const { data } = await axios.get(URL + "/rooms");
                            const Public = data.filter(
                              (room) => room.roomState === "public"
                            );
                            setPublicRooms(Public);
                          } catch (err) {
                            console.error("Failed to fetch rooms", err);
                          }
                        }}
                      />
                    </div>
                    <div className="w-full px-2.5 h-[402px] overflow-y-auto scrollbar">
                      {publicRooms &&
                        publicRooms.map((room) => (
                          <PublicRooms
                            id={room.roomId}
                            memberNum={room.members.length}
                            passedTime={calculateTimePassed(
                              room.roomStartTime,
                              Date.now()
                            )}
                          />
                        ))}
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
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

export default App;
