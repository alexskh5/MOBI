import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateActivity from "../pages/CreateActivity";
import ActivityLibrary from "../pages/ActivityLibrary";
import ActivityPreview from "../pages/ActivityPreview";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-activity" element={<CreateActivity />} />
        <Route path="activities" element={<ActivityLibrary/>} />
        <Route path="/activities/:id" element={<ActivityPreview />} />
      </Routes>
    </BrowserRouter>
  );
}