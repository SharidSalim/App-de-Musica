import React from 'react'

const MemberCard = ({name, rank}) => {
  return (
   <div  className="w-full my-2 shadow-md h-[56px] border-3 bg-[#ffffff20] border-transparent rounded-md flex justify-between items-center hover:backdrop-blur-xs  hover:border-gray-200 transition-all duration-300 animate-appear">
      <div className="flex items-center">
        <div
          className="w-[40px] bg-blue-300  flex items-center justify-center ml-2 h-[40px] rounded-lg"
        >
            <h1 className='font-raleway font-bold text-white'>{name[0].toUpperCase()}</h1>
        </div>
        <p className="leading-3.5 ml-2">
          <span className="font-semibold text-[14px] font-raleway text-white">
            {name}
          </span>
          <br />
          <span className="text-[10px] font-raleway font-semibold text-gray-100">
            {rank}
          </span>
        </p>
      </div>
    </div>
  )
}

export default MemberCard
