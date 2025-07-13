import React from "react";
const QueueCard = ({ image, addedBy, songName, QueueNum }) => {
  return (
    <div className="w-full my-2 h-[56px] border-2 border-transparent rounded-md flex justify-between items-center hover:backdrop-blur-xs  hover:border-gray-200 transition-all duration-300">
      <div className="flex items-center">
        <div
          style={{ backgroundImage: `url("${image}")` }}
          className="w-[40px] background ml-2 h-[40px] rounded-lg"
        ></div>
        <p className="leading-3.5 ml-2">
          <span className="font-medium text-[14px] font-poppins text-white">
            {songName}
          </span>
          <br />
          <span className="text-[9px] font-poppins font-semibold text-gray-300">
            {"Added by " + addedBy}
          </span>
        </p>
      </div>
      <h1 className="text-gray-200 font-poppins font-medium mr-2">
        {QueueNum}
      </h1>
    </div>
  );
};

export default QueueCard;
