import React from "react";

const FuncButton = ({ diameter, children, className }) => {
  return (
    <button
      style={{ width: diameter, height: diameter }}
      className={` cursor-pointer rounded-full border-3 border-gray-200 flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
};

export default FuncButton;
