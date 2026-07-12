import { useState } from "react";
import Sidebar from "../components/therapist/sidebar";

interface TherapistLayoutProps {
  children: (
    sidebarOpen: boolean,
    setSidebarOpen: React.Dispatch<
      React.SetStateAction<boolean>
    >
  ) => React.ReactNode;
}

const TherapistLayout = ({
  children,
}: TherapistLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar setSidebarOpen={setSidebarOpen} />
      )}

      <div className="flex-1 bg-white p-4">
        {children(sidebarOpen, setSidebarOpen)}
      </div>
    </div>
  );
};

export default TherapistLayout;