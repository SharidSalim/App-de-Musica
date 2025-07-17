// import React from "react";

// const Chat = ({ name, msg }) => {
//   return (
//     <div className="flex">
//       <div className="w-[25px] align-bottom flex items-center justify-center h-[25px] bg-pink-600 rounded-full">
//         <p className="font-raleway text-[14px] font-medium text-white">
//           {name[0].toUpperCase()}
//         </p>
//       </div>
//       <div className="w-fit p-1">
//         <h1>{name}</h1>
//         <p>{msg}</p>
//       </div>
//     </div>
//   );
// };

import React from "react";
const Chat = ({ name='', msg }) => {
  const displayLetter = typeof name === "string" && name.length > 0
    ? name[0].toUpperCase()
    : "?";
  return (
    <div className="flex animate-appear items-end gap-x-1">
      <div className="w-[20px] h-[20px] bg-pink-600 rounded-full flex items-center justify-center">
        <p className="font-raleway text-[10px] font-medium text-white">
          {displayLetter}
        </p>
      </div>
      <div className="max-w-[195px] w-fit pr-1">
        <h1 className="text-xs text-gray-500 font-raleway font-semibold">{name}</h1>
        <p className="text-xs bg-[#ffffff20] font-poppins shadow-md p-2.5 rounded-t-md rounded-br-md">{msg}</p>
      </div>
    </div>
  );
};
export default Chat

