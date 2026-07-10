import { NavLink, useNavigate } from "react-router-dom";
import mobiLogo from "../../assets/mobiLogo.png";


interface SidebarProps {
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const Sidebar = ({
  setSidebarOpen,
}: SidebarProps) => {
  
  const navigate = useNavigate();

  return (
    <div className="w-50 h-screen bg-white shadow-md flex flex-col justify-between p-6">
      {/* TOP SECTION */}
      <div>
        <div className="mt-8 ml-6 mb-4">
            <button
            className="text-3xl"
            onClick={() => setSidebarOpen(false)}
            >
            ☰
            </button>
        </div>
        {/* LOGO + WELCOME */}
        <div className="flex flex-col items-center mb-12">
          <img
            src={mobiLogo}
            alt="MOBI Logo"
            className="w-32 h-32 object-contain "
          />
          <p className="text-lg text-center leading-tight">
            Welcome <br /> back, Therapist!
          </p>
        </div>

        {/* NAVIGATION */}
        <ul className="space-y-4 text-xl ml-2">
          <li>
            <NavLink
              to="/therapist/dashboard"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/therapist/profile"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Center Profile
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/therapist/materials"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Materials
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/therapist/notifications"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Notifications
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/therapist/schedule"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Schedule
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/therapist/collaboration"
              className={({ isActive }) =>
                isActive
                    ? "text-[#965deb] font-semibold"
                    : "hover:text-[#965deb] transition"
              }
            >
              Collaboration
            </NavLink>
          </li>
        </ul>
      </div>

      {/* BOTTOM SECTION */}
      <div>
        <button
          onClick={() => navigate("/login")}
          className="text-xl text-left hover:text-red-500 transition ml-2 mb-2"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;