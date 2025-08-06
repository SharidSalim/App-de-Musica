// import React, { useEffect, useRef, useState } from "react";
// import { FaBars, FaGithub } from "react-icons/fa";
// import { Link } from "react-router";

// const NavBar = () => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null)
//   useEffect(() => {
//       const handleClickOutside = (event) => {
//         if (
//           dropdownRef.current &&
//           !dropdownRef.current.contains(event.target)
//         ) {
//           setDropdownOpen(false);
//         }
//       };
  
//       document.addEventListener("mousedown", handleClickOutside);
//       document.addEventListener("touchstart", handleClickOutside);
  
//       return () => {
//         document.removeEventListener("mousedown", handleClickOutside);
//         document.removeEventListener("touchstart", handleClickOutside);
//       };
//     }, []);
//   return (
//     <nav ref={dropdownRef} className="w-full px-3.5 glass-effect absolute z-30  py-[16px] ">
//       <div className="relative w-full">
//         <div className="container flex justify-between items-center">
//           <div>
//             <Link
//               to="/"
//               className="font-semiboldbold gradient-text font-pacifico text-white lg:text-[28px] text-lg"
//             >
//               App de Musica
//             </Link>
//           </div>
//           <ul className="hidden lg:flex font-medium text-lg font-poppins text-white gap-x-[44px]">
//             <li>
//               <Link
//                 className="text-txt-primary hover:text-accent transition duration-300"
//                 to={"/"}
//               >
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link className="text-txt-primary hover:text-accent transition duration-300">
//                 About
//               </Link>
//             </li>
//             <li>
//               <Link className="text-txt-primary hover:text-accent transition duration-300">
//                 Guide
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="https://github.com/SharidSalim/App-de-Musica"
//                 className="text-txt-primary hover:text-accent transition duration-300 flex items-center gap-2"
//               >
//                 <FaGithub /> Github
//               </Link>
//             </li>
//           </ul>
//           <FaBars onClick={()=>setDropdownOpen(!dropdownOpen)} size={20} className="text-txt-primary lg:hidden cursor-pointer"/>
//         </div>
//         {dropdownOpen && (
//           <div className="absolute bottom-0 left-0 w-full">
//             <ul className="flex flex-col w-full">
//                 <li>
//               <Link
//                 className="text-txt-primary"
//                 to={"/"}
//               >
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link className="text-txt-primary ">
//                 About
//               </Link>
//             </li>
//             <li>
//               <Link className="text-txt-primary ">
//                 Guide
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="https://github.com/SharidSalim/App-de-Musica"
//                 className="text-txt-primary"
//               >
//                 <FaGithub /> Github
//               </Link>
//             </li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default NavBar; 
import React, { useEffect, useRef, useState } from "react";
import { FaBars, FaGithub } from "react-icons/fa";
import { Link } from "react-router";

const NavBar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <nav
      ref={dropdownRef}
      className="w-full px-4 py-4 absolute z-30 glass-effect"
    >
      <div className="relative w-full">
        <div className="container flex justify-between items-center">
          <div>
            <Link
              to="/"
              className="font-semiboldbold gradient-text font-pacifico text-white lg:text-[28px] text-lg"
            >
              App de Musica
            </Link>
          </div>

          <ul className="hidden lg:flex font-medium text-lg font-poppins text-white gap-x-[44px]">
            <li>
              <Link
                className="text-txt-primary hover:text-accent transition duration-300"
                to={"/"}
              >
                Home
              </Link>
            </li>
            <li>
              <Link className="text-txt-primary hover:text-accent transition duration-300">
                About
              </Link>
            </li>
            <li>
              <Link className="text-txt-primary hover:text-accent transition duration-300">
                Guide
              </Link>
            </li>
            <li>
              <Link
                to="https://github.com/SharidSalim/App-de-Musica"
                className="text-txt-primary hover:text-accent transition duration-300 flex items-center gap-2"
              >
                <FaGithub /> Github
              </Link>
            </li>
          </ul>

          <FaBars
            onClick={() => setDropdownOpen((prev) => !prev)}
            size={22}
            className="text-txt-primary lg:hidden cursor-pointer"
          />
        </div>

        {dropdownOpen && (
          <div className="absolute top-[55px] left-0 w-full bg-db-primary py-4 px-4 rounded-md shadow-md lg:hidden">
            <ul className="flex flex-col rounded-md p-4 font-poppins space-y-3 animate-slide-down">
              <li>
                <Link
                  className="text-txt-primary hover:text-accent transition"
                  to={"/"}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-txt-primary hover:text-accent transition">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-txt-primary hover:text-accent transition">
                  Guide
                </Link>
              </li>
              <li>
                <Link
                  to="https://github.com/SharidSalim/App-de-Musica"
                  className="text-txt-primary hover:text-accent transition flex items-center gap-2"
                >
                  <FaGithub /> Github
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

