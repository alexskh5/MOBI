import { useState } from "react";
import { Link } from "react-router-dom";

import mobiLogo from "../assets/mobiLogo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="font-itim flex justify-between items-center px-4 md:px-10 lg:px-20 py-2 lg:py-1 bg-white shadow-md sticky top-0 z-50">
      
      {/* LEFT: LOGO + TITLE */}
      <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
        <img
          src={mobiLogo}
          alt="MOBI Logo"
          className="w-12 h-12 md:w-20 md:h-20 lg:w-28 lg:h-28"
        />

        <h1 className="text-lg md:text-xl lg:text-2xl">
          MOBI - Children's App
        </h1>
      </div>

      {/* MOBILE MENU BUTTON */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <ul
        className={`${
          isOpen ? "flex" : "hidden"
        } absolute top-full left-0 w-full bg-white flex-col items-center gap-4 md:gap-6 py-6 text-base md:text-lg lg:text-xl lg:flex lg:flex-row lg:static lg:w-auto lg:bg-transparent lg:gap-20`}
      >
        <li onClick={() => setIsOpen(false)}>
        <Link
            to="/home"
            className="cursor-pointer hover:text-blue-500 transition"
        >
            Home
        </Link>
        </li>

        <li onClick={() => setIsOpen(false)}>
        <Link
            to="/about"
            className="cursor-pointer hover:text-blue-500 transition"
        >
            About
        </Link>
        </li>

        <li onClick={() => setIsOpen(false)}>
        <Link
            to="/login"
            className="cursor-pointer hover:text-blue-500 transition"
        >
            Log In
        </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;