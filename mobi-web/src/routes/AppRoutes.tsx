import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";

// Center
import Learner from "../pages/center/dashboard/learner";
import AddLearner from "../pages/center/dashboard/AddLearner";
import EditLearner from "../pages/center/dashboard/EditLearner";
import Progress from "../pages/center/dashboard/Progress";
import CenterProfile from "../pages/center/profile/CenterProfile";
import ViewDoctor from "../pages/center/profile/ViewDoctor";
import ViewStaff from "../pages/center/profile/ViewStaff";
import AddDoctor from "../pages/center/profile/AddDoctor";
import AddStaff from "../pages/center/profile/AddStaff";
import EditDoctor from "../pages/center/profile/EditDoctor";
import EditStaff from "../pages/center/profile/EditStaff";
import ActivityLibrary from "../pages/center/materials/ActivityLibrary";
import CreateActivity from "../pages/center/materials/CreateActivity";
import ActivityPreview from "../pages/center/materials/ActivityPreview";
import DraftMaterials from "../pages/center/materials/DraftMaterials";
import ArchivedMaterials from "../pages/center/materials/ArchivedMaterials";
import Notifications from "../pages/center/notifications/Notifications";
import Schedule from "../pages/center/schedule/Schedule";
import Collaboration from "../pages/center/collaboration/Collaboration"

// Therapist
import TherapistLearner from "../pages/therapist/dashboard/Learner";
import TherapistProgress from "../pages/therapist/dashboard/Progress";
import TherapistProfile from "../pages/therapist/profile/TherapistProfile";
import TherapistMaterials from "../pages/therapist/materials/ActivityLibrary";
import TherapistDraftMaterials from "../pages/therapist/materials/DraftMaterials";
import TherapistArchivedMaterials from "../pages/therapist/materials/ArchivedMaterials";
import TherapistActivityPreview from "../pages/therapist/materials/ActivityPreview";
import TherapistCreateActivity from "../pages/therapist/materials/CreateActivity";


// Super-Admin
import SuperDashboardScreen from "../pages/superadmin/SuperDashboardScreen";
import SuperManageScreen from "../pages/superadmin/SuperManageScreen";
import SuperProcessScreen from "../pages/superadmin/SuperProcessScreen";

// Doctor
import DocDashboardScreen from "../pages/doctor/DocDashboardScreen";
import DocCollabScreen from "../pages/doctor/DocCollabScreen";
import DocNotificationScreen from "../pages/doctor/DocNotificationScreen";
import DocProfileScreen from "../pages/doctor/DocProfileScreen";
import DocPatientProgressScreen from "../components/doctor/DocPatientProgressScreen";

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

        {/* ======================================
          LANDING PAGE
          Visit manually:
          http://localhost:5173/home

          If later you want Home to be the
          startup page, replace the route above
          with:

          <Route
            path="/"
            element={<Home />}
          />

        ====================================== */}

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Center Admin */}
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
          path="/center/dashboard/:id/progress"
          element={<Progress />}
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

        <Route
          path="/center/materials"
          element={<ActivityLibrary />}
        />

        <Route
          path="/center/materials/CreateActivity"
          element={<CreateActivity />}
        />

        <Route
          path="/center/materials/:id"
          element={<ActivityPreview />}
        />

        <Route
            path="/center/materials/DraftMaterials"
            element={<DraftMaterials />}
        />

        <Route
          path="/center/materials/ArchivedMaterials"
          element={<ArchivedMaterials />}
        />

        <Route
          path="/center/notifications"
          element={<Notifications />}
        />

        <Route
            path="/center/schedule"
            element={<Schedule />}
        />

        <Route
            path="/center/collaboration"
            element={<Collaboration />}
        />

        {/* Therapist */}
        <Route
          path="/therapist/dashboard"
          element={<TherapistLearner />}
        />

        <Route
          path="/therapist/dashboard/:id/progress"
          element={<Progress />}
        />

        <Route
          path="/therapist/dashboard/:id/progress"
          element={<TherapistProgress />}
        />

        <Route
          path="/therapist/profile"
          element={<TherapistProfile />}
        />

        <Route
          path="/therapist/materials"
          element={<TherapistMaterials />}
        />

        <Route
          path="/therapist/materials/DraftMaterials"
          element={<TherapistDraftMaterials />}
        />

        <Route
          path="/therapist/materials/ArchivedMaterials"
          element={<TherapistArchivedMaterials />}
        />

        <Route
          path="/therapist/materials/:id"
          element={<TherapistActivityPreview />}
        />

        <Route
          path="/therapist/materials/CreateActivity"
          element={<TherapistCreateActivity />}
        />


        {/* Super Admin */}
        <Route
          path="/superadmin/SuperDashboardScreen"
          element={<SuperDashboardScreen />}
        />

        <Route
          path="/superadmin/SuperManageScreen"
          element={<SuperManageScreen />}
        />

        <Route
          path="/superadmin/SuperProcessScreen"
          element={<SuperProcessScreen />}
        />
        
      {/* Doctor */}
        <Route
          path="/doctor/DocDashboardScreen"
          element={<DocDashboardScreen />}
        />

        <Route
          path="/doctor/patients/:patientId"
          element={<DocPatientProgressScreen />}
        />

        <Route
          path="/doctor/DocCollabScreen"
          element={<DocCollabScreen />}
        />

        <Route
          path="/doctor/DocNotificationScreen"
          element={<DocNotificationScreen />}
        />

        <Route
          path="/doctor/DocProfileScreen"
          element={<DocProfileScreen />}
        />




      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;