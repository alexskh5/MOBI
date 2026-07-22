import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Sidebar from "../components/center/sidebar";

interface CenterLayoutProps {
  children: (
    sidebarOpen: boolean,
    setSidebarOpen: Dispatch<SetStateAction<boolean>>,
  ) => ReactNode;
}

const DESKTOP_BREAKPOINT = 1024;

const CenterLayout = ({ children }: CenterLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const handleResize = () => {
      const desktopView =
        window.innerWidth >= DESKTOP_BREAKPOINT;

      setIsDesktop(desktopView);

      /*
        Keep the sidebar visible on desktop.
        Automatically close it when changing to mobile.
      */
      setSidebarOpen(desktopView);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-[100dvh] w-full min-w-0 overflow-hidden bg-white">
      {/* DESKTOP SIDEBAR */}
      {isDesktop && sidebarOpen && (
        <aside className="h-full shrink-0">
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </aside>
      )}

      {/* MOBILE SIDEBAR */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          {/* SIDEBAR PANEL */}
          <aside className="relative z-10 h-full w-fit max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
            <Sidebar setSidebarOpen={setSidebarOpen} />
          </aside>
        </div>
      )}

      {/* SCROLLABLE PAGE CONTENT */}
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-white">
        <div className="min-h-full w-full min-w-0 p-2 sm:p-3 md:p-4">
          {children(sidebarOpen, setSidebarOpen)}
        </div>
      </main>
    </div>
  );
};

export default CenterLayout;