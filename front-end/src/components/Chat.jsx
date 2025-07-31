import React from "react";
const Chat = ({ name = "", msg, currentClient = false, key }) => {
  const displayName =
    typeof name === "string" && name.length > 0 ? name[0].toUpperCase() : "?";
  return (
    <div
    key={key}
      className={`flex ${
        currentClient ? "flex-row-reverse" : ""
      } animate-appear items-end gap-x-1`}
    >
      <div className="w-[20px] h-[20px] bg-db-primary rounded-full flex items-center justify-center">
        <p className="font-raleway text-[10px] font-medium text-white">
          {displayName}
        </p>
      </div>
      <div className="max-w-[195px] w-fit pr-1">
        <h1
          className={`text-xs text-txt-secondary ${
            currentClient ? "text-end" : ""
          } font-raleway font-semibold`}
        >
          {name}
        </h1>
        <p
          className={`text-xs text-txt-primary bg-[#ffffff20] break-words whitespace-pre-wrap font-poppins shadow-md p-2.5 rounded-t-md ${
            currentClient ? "rounded-bl-md" : "rounded-br-md"
          }`}
        >
          {msg}
        </p>
      </div>
    </div>
  );
};
export default Chat;
