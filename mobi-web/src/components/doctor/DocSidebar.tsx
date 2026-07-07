import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import mobiLogo from "../../assets/mobiLogo.png";
import "../../styles/doctor-fonts.css";

interface DocSidebarProps {
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  relatedPaths?: string[];
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function CollaborationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="7" r="2.5" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 13.8h1.5a4 4 0 0 1 4 4V20"
      />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 21h4"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21a8 8 0 0 1 16 0"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 17l5-5-5-5M15 12H3"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

const sidebarItems: SidebarItem[] = [
  {
    label: "My Patients",
    path: "/doctor/DocDashboardScreen",
    icon: <DashboardIcon />,
    relatedPaths: ["/doctor/patients"],
  },
  {
    label: "Collaboration",
    path: "/doctor/DocCollabScreen",
    icon: <CollaborationIcon />,
  },
  {
    label: "Notifications",
    path: "/doctor/DocNotificationScreen",
    icon: <NotificationIcon />,
  },
  {
    label: "My Profile",
    path: "/doctor/DocProfileScreen",
    icon: <ProfileIcon />,
  },
];

function DocSidebar({
  setSidebarOpen,
}: DocSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const closeSidebarOnSmallScreen = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isItemActive = (item: SidebarItem) => {
    if (location.pathname === item.path) {
      return true;
    }

    return (
      item.relatedPaths?.some((path) =>
        location.pathname.startsWith(path),
      ) ?? false
    );
  };

  const handleLogout = () => {
    closeSidebar();

    // Later:
    // await supabase.auth.signOut();
    // Clear other stored doctor information here.

    navigate("/login");
  };

  return (
    <aside className="font-professional fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] max-w-[88vw] flex-col overflow-hidden border-r border-[#ebe6f1] bg-white shadow-[8px_0_30px_rgba(47,34,68,0.08)]">
      {/* Header */}
      <div className="relative flex h-[92px] shrink-0 items-center border-b border-[#f1edf4] px-5 pr-16">
        <NavLink
          to="/doctor/DocDashboardScreen"
          onClick={closeSidebarOnSmallScreen}
          className="flex min-w-0 items-center gap-3"
        >
          <img
            src={mobiLogo}
            alt="MOBI"
            className="h-14 w-14 shrink-0 object-contain"
          />

          <div className="min-w-0">
            <p className="font-accent truncate text-lg font-bold tracking-tight text-[#342b3f]">
              MOBI
            </p>

            <p className="truncate text-xs font-medium text-slate-400">
              Doctor Portal
            </p>
          </div>
        </NavLink>

        {/* Always-visible close button */}
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-[#e5dced] hover:bg-[#f3eef9] hover:text-[#8257bd] focus:outline-none focus:ring-4 focus:ring-[#8257bd]/10"
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Doctor workspace
        </p>

        <nav
          className="space-y-1.5"
          aria-label="Doctor workspace navigation"
        >
          {sidebarItems.map((item) => {
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebarOnSmallScreen}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#efe8f9] text-[#7549ad]"
                    : "text-slate-600 hover:bg-[#f8f5fb] hover:text-[#7549ad]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-white text-[#8257bd] shadow-sm"
                      : "bg-[#f8f6fa] text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                </span>

                {item.label === "Notifications" && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#865ac2] px-1.5 text-[10px] font-bold text-white">
                    3
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sign out */}
      <div className="shrink-0 border-t border-[#f1edf4] bg-white p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
            <LogoutIcon />
          </span>

          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default DocSidebar;