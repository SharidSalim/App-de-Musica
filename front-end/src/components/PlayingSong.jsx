import React from "react";
import { Link } from "react-router";

const PlayingSong = ({ url, name, channel }) => {
  return (
    <div className="flex items-center">
      {url ? (
        <div
          style={{
            backgroundImage: `url("${url}")`,
          }}
          className="w-[67px] background  h-[67px] rounded-lg"
        ></div>
      ) : (
        <div className="w-[67px] bg-gray-200 font-poppins text-black font-bold text-2xl flex items-center justify-center  h-[67px] rounded-lg">
          ?
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
        <p className="leading-4 ml-2 w-[190px] truncate text-white">
          <span className="font-semibold font-poppins text-[14px]">
            Not Playing anything
          </span>
          <br />
          <span className="text-[12px] font-poppins font-semibold text-gray-200">
            Unknown
          </span>
        </p>
      )}
    </div>
  );
};

export default PlayingSong;
