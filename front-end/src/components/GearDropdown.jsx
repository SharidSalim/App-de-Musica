import { useState, useRef, useEffect } from "react";
import { FaGear } from "react-icons/fa6";

const GearDropdown = ({setServerStatus, status}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="group relative"
      onMouseLeave={() => setDropdownOpen(false)}
    >
      {/* Dropdown */}
      <div
        className={`
          absolute flex flex-col overflow-hidden
          top-[-75px] left-[-100px] w-[120px] rounded-br-none rounded-md bg-white
          transition duration-300 z-50
          ${dropdownOpen ? "visible opacity-100" : "invisible opacity-0"}
          group-hover:visible group-hover:opacity-100
        `}
      >
        <button
        onClick={()=>console.log(status)
        }
          className="py-2 w-full text-left pl-2.5 font-poppins text-[12px] hover:bg-[#F6BBB9] hover:text-white transition duration-300"
        >
          Shut Down
        </button>
        <button onClick={setServerStatus}
          className="py-2 w-full text-left pl-2.5 font-poppins text-[12px] hover:bg-[#CCEBE6] hover:text-white transition duration-300"
        >
          Server: {status}
        </button>
      </div>

      {/* Gear Icon */}
      <FaGear
        size={22}
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="cursor-pointer text-gray-100 hover:text-white transition duration-300"
      />
    </div>
  );
};

export default GearDropdown;
