import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast, Slide } from "react-toastify";

const PublicRooms = ({ id, memberNum, passedTime }) => {
  const [clicked, setClicked] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const idRef = useRef(id);

  async function handleJoin() {
    try {
      const res = await axios.get(
        `http://localhost:3001/rooms/${idRef.current}`
      );

      if (res.data !== "") {
        navigate("/room/" + idRef.current, {
          state: { userName: name },
        });
      } else {
        toast("Server doesn't Exist", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }
    } catch (err) {
      toast("Can't connect to server");
    }
  }
  return (
    <div className="w-full py-1  px-2.5 border-2 border-gray-200 rounded-md shadow-md">
      <div
        onClick={() => setClicked(!clicked)}
        className="flex cursor-pointer items-center justify-between"
      >
        <h1 className="font-poppins font-medium text-sm text-gray-500">{id}</h1>
        <p className="font-poppins font-medium text-sm text-gray-500">
          {passedTime}
        </p>
        <p className="font-poppins font-medium text-sm text-gray-500">
          {memberNum}/15
        </p>
      </div>
      <div className="flex py-1.5 justify-between">
        <input
          type="text"
          onChange={(e) => setName(e.target.value.trim())}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await handleJoin();
            }
          }}
          placeholder="Enter your name"
          className="outline-0 font-poppins"
          name=""
          id=""
        />
        <button
          onClick={handleJoin}
          className="bg-[#CCEBE6] text-white px-4 py-0.5 cursor-pointer rounded-md"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default PublicRooms;
