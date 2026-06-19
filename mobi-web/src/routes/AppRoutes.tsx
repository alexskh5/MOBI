// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import CreateActivity from "../pages/CreateActivity";
// import ActivityLibrary from "../pages/ActivityLibrary";
// import ActivityPreview from "../pages/ActivityPreview";

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/create-activity" element={<CreateActivity />} />
//         <Route path="activities" element={<ActivityLibrary/>} />
//         <Route path="/activities/:id" element={<ActivityPreview />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Learner from "../pages/center/dashboard/learner";
import AddLearner from "../pages/center/dashboard/AddLearner";
import EditLearner from "../pages/center/dashboard/EditLearner";
import CenterProfile from "../pages/center/profile/CenterProfile";
import ViewDoctor from "../pages/center/profile/ViewDoctor";
import ViewStaff from "../pages/center/profile/ViewStaff";
import AddDoctor from "../pages/center/profile/AddDoctor";
import AddStaff from "../pages/center/profile/AddStaff";
import EditDoctor from "../pages/center/profile/EditDoctor";
import EditStaff from "../pages/center/profile/EditStaff";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route
          path="/"
          element={
            <Navigate to="/center/dashboard" />
          }
        />

        <Route
          path="/center/dashboard"
          element={<Learner />}
        />

        <Route
          path="/center/dashboard/AddLearner"
          element={<AddLearner />}
        />

        <Route
          path="/center/dashboard/:id/EditLearner"
          element={<EditLearner />}
        />

        <Route
          path="/center/profile"
          element={<CenterProfile />}
        />

        <Route
          path="/center/profile/doctors"
          element={<ViewDoctor />}
        />

        <Route
          path="/center/profile/staff"
          element={<ViewStaff />}
        />

        <Route
          path="/center/profile/AddDoctor"
          element={<AddDoctor />}
        />

        <Route
          path="/center/profile/AddStaff"
          element={<AddStaff />}
        />

        <Route
          path="/center/profile/:id/EditDoctor"
          element={<EditDoctor />}
        />

        <Route
          path="/center/profile/:id/EditStaff"
          element={<EditStaff />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;