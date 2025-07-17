import React from "react";
//hover:backdrop-blur-xs  hover:border-gray-200 transition-all duration-300
const QueueCard = ({ image, addedBy, songName, QueueNum, key }) => {
  return (
    <div key={key} className="w-full my-2 shadow-md h-[56px] border-3 bg-[#ffffff20] border-transparent rounded-md flex justify-between items-center">
      <div className="flex items-center">
        <div
          style={{ backgroundImage: `url("${image}")` }}
          className="w-[40px] background ml-2 h-[40px] rounded-lg"
        ></div>
        <p className="leading-3.5 ml-2">
          <span className="font-semibold text-[14px] font-raleway text-white">
            {songName}
          </span>
          <br />
          <span className="text-[10px] font-raleway font-semibold text-gray-100">
            {"Added by " + addedBy}
          </span>
        </p>
      </div>
      <h1 className="text-white font-poppins font-medium mr-2">
        {QueueNum}
      </h1>
    </div>
  );
};

export default QueueCard;
