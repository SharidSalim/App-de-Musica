import React from "react";

const FuncButton = ({ diameter, children, className,onClick }) => {
  return (
    <button
      style={{ width: diameter, height: diameter }}
      className={` cursor-pointer rounded-full flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default FuncButton;
