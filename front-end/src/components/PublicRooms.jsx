import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast, Slide } from "react-toastify";

const PublicRooms = ({ id, memberNum, passedTime }) => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const idRef = useRef(id);

  async function handleJoin() {
    if (name !== "") {
      try {
        const res = await axios.get(
          `http://localhost:3001/rooms/${idRef.current}`
        );
        if (res) {
          if (res.data.members.length >= 15) {
            toast("This room is currently full");
          } else
            navigate("/room/" + code, {
              state: { userName: name },
            });
        } else {
          toast("Server doesn't Exist", {
            position: "top-center",
            autoClose: 5000,
            theme: "light",
            transition: Slide,
          });
        }
      } catch (err) {
        err.status === 404
          ? toast(err.response.data.message)
          : toast("Cant Connect to server");
      }
    } else {
      toast("Enter your name");
    }
  }

  return (
    <div className="w-full py-1 px-2.5 border-2 border-gray-200 rounded-md shadow-md group focus-within:border-gray-400 transition">
      <div className="flex items-center justify-between cursor-pointer">
        <h1 className="font-poppins font-medium text-sm text-gray-500">{id}</h1>
        <p className="font-poppins font-medium text-sm text-gray-500">
          {passedTime}
        </p>
        <p className="font-poppins font-medium text-sm text-gray-500">
          {memberNum}/15
        </p>
      </div>

      {/* Slide Panel */}
      <div
        id="slide"
        className="flex justify-between gap-2 transition-all duration-300 ease-in-out max-h-0 opacity-0 overflow-hidden group-hover:max-h-16 group-hover:opacity-100 group-focus-within:max-h-16 group-focus-within:opacity-100"
      >
        <input
          type="text"
          onChange={(e) => setName(e.target.value.trim())}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await handleJoin();
            }
          }}
          placeholder="Enter your name"
          className="outline-none font-poppins text-sm bg-transparent text-gray-700 w-full"
        />
        <button
          onClick={handleJoin}
          className="bg-[#CCEBE6] text-white px-4 py-0.5 cursor-pointer rounded-md shrink-0"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default PublicRooms;
