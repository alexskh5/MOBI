import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import mobiLogo from "../assets/mobiLogo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? "text-[#965deb] font-semibold"
      : "hover:text-[#965deb] transition";

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
<<<<<<< HEAD
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
=======
    <>
      <nav
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          bg-white
          font-itim
          shadow-md
        "
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
      >
        <div
          className="
            mx-auto
            flex
            h-[72px]
            w-full
            max-w-[1800px]
            items-center
            justify-between
            px-4
            sm:h-20
            sm:px-6
            md:px-10
            lg:h-24
            lg:px-16
            xl:h-28
            xl:px-20
          "
        >
          {/* Logo and title */}
          <NavLink
            to="/home"
            onClick={closeMenu}
            className="
              flex
              min-w-0
              items-center
              gap-2
              sm:gap-3
              lg:gap-4
            "
          >
            <img
              src={mobiLogo}
              alt="MOBI Logo"
              className="
                h-14
                w-14
                shrink-0
                object-contain
                sm:h-16
                sm:w-16
                lg:h-20
                lg:w-20
                xl:h-24
                xl:w-24
              "
            />

            <h1
              className="
                truncate
                text-base
                sm:text-lg
                md:text-xl
                lg:text-2xl
                xl:text-[26px]
              "
            >
              MOBI - Children&apos;s App
            </h1>
          </NavLink>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={
              isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isOpen}
            onClick={() =>
              setIsOpen((previous) => !previous)
            }
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition
              hover:bg-gray-100
              lg:hidden
            "
          >
            {isOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

          {/* Desktop navigation */}
          <ul
            className="
              hidden
              items-center
              font-itim
              lg:flex
              lg:gap-12
              lg:text-[22px]
              xl:gap-16
              xl:text-2xl
              2xl:gap-20
            "
          >
            <li>
              <NavLink
                to="/home"
                end
                className={navLinkClass}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                className={navLinkClass}
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/login"
                className={navLinkClass}
              >
                Log In
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              className="
                fixed
                inset-x-0
                bottom-0
                top-[72px]
                z-40
                bg-black/20
                sm:top-20
                lg:hidden
              "
            />

            <ul
              className="
                absolute
                left-0
                top-full
                z-50
                flex
                w-full
                flex-col
                items-center
                gap-6
                border-t
                border-gray-200
                bg-white
                px-5
                py-7
                text-xl
                shadow-lg
                sm:text-2xl
                lg:hidden
              "
            >
              <li>
                <NavLink
                  to="/home"
                  end
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  About
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  Log In
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* Space reserved for the fixed navbar */}
      <div
        className="
          h-[72px]
          sm:h-20
          lg:h-24
          xl:h-28
        "
      />
    </>
  );
}

export default Navbar;