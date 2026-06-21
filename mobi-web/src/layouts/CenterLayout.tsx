import { useState } from "react";
import Sidebar from "../components/center/sidebar";

interface CenterLayoutProps {
  children: (
    sidebarOpen: boolean,
    setSidebarOpen: React.Dispatch<
      React.SetStateAction<boolean>
    >
  ) => React.ReactNode;
}

const CenterLayout = ({
  children,
}: CenterLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <div className="flex-1 bg-white p-4">
        {children(sidebarOpen, setSidebarOpen)}
      </div>
    </div>
  );
};

export default CenterLayout;