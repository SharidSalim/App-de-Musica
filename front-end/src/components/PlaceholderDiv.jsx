import React from "react";

const PlaceholderDiv = ({ id, children, className, msg }) => {
  return (
    <div
      id={id}
      className={`${
        React.Children.count(children) <= 0
          ? "flex items-center justify-center"
          : ""
      } ${className}`}
    >
      {React.Children.count(children) > 0 ? children : <p className="font-poppins text-gray-400 text-[14px] font-extralight">{msg}</p>}
    </div>
  );
};

export default PlaceholderDiv;
