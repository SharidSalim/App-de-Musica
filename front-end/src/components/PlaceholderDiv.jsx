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
      {React.Children.count(children) > 0 ? children : <p className="font-poppins text-txt-secondary text-[14px] font-light">{msg}</p>}
    </div>
  );
};

export default PlaceholderDiv;
