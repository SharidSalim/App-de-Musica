import React from "react";
import { FaMusic } from "react-icons/fa";
import { Link } from "react-router";

const PlayingSong = ({ url, name, channel }) => {
  return (
    <div className="flex items-center">
      {url ? (
        <div
          style={{
            backgroundImage: `url("${url}")`,
          }}
          className="w-12 background  h-12 rounded-lg"
        ></div>
      ) : (
        <div className="w-12 bg-db-tertiary font-poppins text-black font-bold text-2xl flex items-center justify-center  h-12 rounded-lg">
          <FaMusic size={20} className="text-txt-secondary" />
        </div>
      )}

      {name && channel ? (
        <p className="leading-4 w-[190px] ml-2">
          <span className="font-semibold font-poppins text-white text-[14px] block truncate">
            {name}
          </span>
          <span className="text-[12px] font-poppins font-semibold text-gray-200 block truncate">
            {channel}
          </span>
        </p>
      ) : (
        <p className="leading-4 ml-2 w-[190px] truncate">
          <span className="font-semibold font-poppins text-txt-primary text-[14px]">
            No Tracks Loaded
          </span>
          <br />
          <span className="text-[12px] font-poppins font-semibold text-txt-secondary">
            Unknown
          </span>
        </p>
      )}
    </div>
  );
};

export default PlayingSong;
