import React from "react";

const MemberCard = ({ name, rank, you = false }) => {
  return (
    <div className="w-full my-2 shadow-md h-[56px] border-3 bg-[#ffffff20] border-transparent rounded-md flex justify-between items-center animate-appear">
      <div className="flex items-center">
        <div className="w-[40px] bg-db-primary  flex items-center justify-center ml-2 h-[40px] rounded-lg">
          <h1 className="font-raleway font-bold text-white">
            {name[0].toUpperCase()}
          </h1>
        </div>
        <p className="leading-[16px] ml-2 mr-5">
          <span className="font-semibold text-[14px] font-raleway text-txt-primary truncate w-[100px] overflow-hidden whitespace-nowrap block">
            {name}
          </span>

          <span className="text-[10px] font-raleway font-semibold text-txt-secondary">
            {rank}
          </span>
        </p>
        {you && (
          <p className="font-semibold font-poppins bg-[#C0C0C0] text-db-primary px-1.5 rounded-sm text-[10px]">
            you
          </p>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
