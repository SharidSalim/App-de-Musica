import React from "react";
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router";

const NavBar = () => {
  return (
    <nav className="w-full px-3.5 glass-effect absolute z-30  py-[22px] ">
      <div className="container flex justify-between items-center">
        <div>
          <Link
            to="/"
            className="font-semiboldbold gradient-text font-pacifico text-white text-[28px]"
          >
            App de Musica
          </Link>
        </div>
        <ul className="flex font-medium text-lg font-poppins text-white gap-x-[44px]">
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
      </div>
    </nav>
  );
};

export default NavBar;
