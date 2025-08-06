import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router";
import FuncButton from "./components/FuncButton";
import { FaMusic, FaPlay } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { ToastContainer, toast, Slide } from "react-toastify";
import PublicRooms from "./components/PublicRooms";
import { calculateTimePassed } from "./modules/utilities";
import PlaceholderDiv from "./components/PlaceholderDiv";
import NavBar from "./components/NavBar";

const App = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [roomUI, setRoomUI] = useState("");
  const [userName, setUserName] = useState("");
  const [publicRooms, setPublicRooms] = useState([]);

  const URL = "http://localhost:3001";

  return (
    <div className="overflow-hidden">
      <NavBar />
      <section
        id="background"
        className="w-screen relative bg-db-primary text-txt-primary background h-screen px-3.5"
      >
        <div className="container">
          <div
            id="wrapper"
            className="w-full h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between"
          >
            <div className="flex flex-col gap-12 lg:gap-8">
              <h1 className="font-bold text-txt-primary lg:pt-15 font-poppins text-7xl text-center lg:text-left">
                <span className="gradient-text">LIVE </span>
                <br />
                STREAM <br />
                <span className="gradient-text">MUSIC</span>
              </h1>
              <p className="text-lg  text-center lg:text-left text-txt-secondary font-poppins max-w-md">
                Stream your favorite music in real-time with friends. Create or
                join a room and enjoy the experience together.
              </p>

              <button
                onClick={() => setOpenModal(!openModal)}
                className="bg-db-tertiary w-[185px] font-poppins hover:bg-db-secondary text-accent py-3 px-8 rounded-full
                 flex items-center justify-center gap-2 mx-auto lg:mx-0 transition-all duration-300 btn-hover-effect"
              >
                <FaPlay size={16} />
                <span className="font-medium">Get Started</span>
              </button>
            </div>

            <div className="flex absolute lg:static  justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-[-47px] bg-[#5eead455] opacity-20 rounded-full blur-3xl animate-pulsate"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <FaMusic size={120} className="text-white opacity-80 hidden lg:block" />
                </div>
              </div>
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
            className={`fixed top-0 backdrop-blur-sm left-0 w-full h-screen bg-[#00000060] animate-appear`}
          ></div>
          <div
            className={`max-w-[746px]  bg-white glass-effect h-[482px] drop-shadow-2xl flex animate-appear2`}
          >
            <div className="hidden lg:block h-full w-[256px] background bg-[url(./assets/bg.jpg)]"></div>
            <div
              style={{ display: roomUI === "" ? "flex" : "none" }}
              className="lg:w-[calc(746px-256px)] w-[330px]  flex flex-col gap-y-14 items-center justify-center "
            >
              <h1 className="font-raleway font-medium gradient-text text-3xl">
                Enter the Hangout!
              </h1>
              <div className="flex font-raleway flex-col gap-y-3.5 font-medium text-xl">
                <button
                  onClick={() => setRoomUI("createUI")}
                  className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setRoomUI("joinUI")}
                  className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
                >
                  Join Room
                </button>
              </div>
            </div>
            {(() => {
              if (roomUI === "createUI") {
                return (
                  <div className="lg:w-[calc(746px-256px)] w-[330px] flex flex-col gap-y-14 items-center justify-center">
                    <h1 className="font-raleway gradient-text font-medium text-gray-400 text-3xl">
                      Create a Room
                    </h1>
                    <div className="flex flex-col gap-y-10 items-center">
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
                        className="pb-[8px] pt-1.5 placeholder:text-txt-secondary text-txt-primary outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-accent transition duration-300"
                        placeholder="Enter your Display Name"
                      />
                      <button
                        className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
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
                  <div className="lg:w-[calc(746px-256px)] w-[330px] flex flex-col items-center gap-y-4 justify-center">
                    <h1 className="font-raleway gradient-text  font-medium text-gray-400 text-3xl">
                      Join a Room
                    </h1>
                    <div className="flex flex-col gap-y-3.5">
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
                        className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
                      >
                        Public Servers
                      </button>
                      <button
                        onClick={() => setRoomUI("privateUI")}
                        className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
                      >
                        Join with Code
                      </button>
                    </div>
                  </div>
                );
              } else if (roomUI === "privateUI") {
                return (
                  <div className="lg:w-[calc(746px-256px)] w-[330px] flex flex-col gap-y-14 items-center justify-center">
                    <h1 className="font-raleway font-medium gradient-text text-3xl">
                      Join a Room
                    </h1>
                    <div className="flex flex-col gap-y-2 items-center">
                      <input
                        type="text"
                        onChange={(e) => setUserName(e.target.value.trim())}
                        name=""
                        className="pb-[8px] pt-1.5 placeholder:text-txt-secondary text-txt-primary outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-accent transition duration-300"
                        placeholder="Enter your Display Name"
                      />
                      <input
                        type="text"
                        onChange={(e) => setCode(e.target.value.trim())}
                        name=""
                        className="pb-[8px] mb-5 pt-1.5 placeholder:text-txt-secondary text-txt-primary outline-none w-2xs border-b-2 border-b-transparent placeholder:text-center hover:border-b-[#CCCCCC] focus:border-b-accent transition duration-300"
                        placeholder="Enter Room ID"
                      />
                      <button
                        className="rounded-lg bg-db-tertiary text-txt-primary py-[15px] px-[68.5px] hover:bg-accent hover:text-db-primary transition duration-300"
                        onClick={async () => {
                          try {
                            const res = await axios.get(`${URL}/rooms/${code}`);

                            if (res) {
                              if (res.data.members.length >= 15) {
                                toast("This room is currently full");
                              } else
                                navigate("/room/" + code, {
                                  state: { userName },
                                });
                            } else {
                              toast("Server doesn't Exist");
                            }
                          } catch (err) {
                            err.status === 404
                              ? toast(err.response.data.message)
                              : toast("Cant Connect to server");
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
                  <div className="lg:w-[calc(746px-256px)] w-[330px]  lg:p-2.5">
                    <h1 className="font-raleway gradient-text text-center font-medium text-gray-400 text-xl mt-4">
                      Available Public Rooms
                    </h1>
                    <div className="flex justify-end">
                      <TbReload
                        size={24}
                        className="text-txt-secondary mr-2 mb-2 cursor-pointer hover:text-accent transition duration-300"
                        onClick={async () => {
                          try {
                            const { data } = await axios.get(URL + "/rooms");
                            console.log("Retrieved Data", data);

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
                    <PlaceholderDiv
                      msg={"There are no public servers"}
                      className="w-full px-2.5 h-[385px] overflow-y-auto scrollbar"
                    >
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
                    </PlaceholderDiv>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </div>
  );
};

export default App;
