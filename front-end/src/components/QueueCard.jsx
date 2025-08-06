import React from "react";

const QueueCard = ({ image, addedBy, songName, QueueNum }) => {
  return (
    <div className="w-full my-2 shadow-md animate-appear h-[56px] border-3 bg-[#ffffff20] border-transparent rounded-md flex justify-between items-center">
      <div className="flex items-center gap-2 ml-2">
        <div
          style={{ backgroundImage: `url("${image}")` }}
          className="w-[40px] background h-[40px] rounded-lg"
        ></div>

        <div className="flex flex-col max-w-[115px] overflow-hidden">
          <h1 className="font-medium text-[12px] font-poppins text-white truncate">
            {songName}
          </h1>
          <p className="text-[10px] font-raleway font-semibold text-gray-100 truncate">
            {"Added by " + addedBy}
          </p>
        </div>
      </div>

      <h1 className="text-gray-100 font-poppins mr-2">{QueueNum}</h1>
    </div>
  );
};

export default QueueCard;
