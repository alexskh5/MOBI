import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type {
  ReactNode,
} from "react";

import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";

// auth
import FreeTrial from "../pages/auth/FreeTrial";
import FreeTrialRegister from "../pages/auth/FreeTrialRegister";
import AcceptInvitation from "../pages/auth/AcceptInvitation";
import VerifyAccount from "../pages/auth/VerifyAccount";
import CreatePassword from "../pages/auth/CreatePassword";
import AccountCreated from "../pages/auth/AccountCreated";

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
import RegulatoryActivities from "../pages/center/materials/RegulatoryActivities";
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
import TherapistNotification from "../pages/therapist/notifications/TherapistNotification";
import TherapistSchedule from "../pages/therapist/schedule/TherapistSchedule";
import TherapistCollaboration from "../pages/therapist/collaboration/TherapistCollaboration";

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
import {
  getStoredAuthUser,
  isAllowedRole,
  type AuthRole,
} from "../services/auth";

function ProtectedRoute({
  roles,
  children,
}: {
  roles: AuthRole[];
  children: ReactNode;
}) {
  const user = getStoredAuthUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!isAllowedRole(user, roles)) {
    return (
      <Navigate
        to={user.defaultWebRoute}
        replace
      />
    );
  }

  return children;
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route
          path="/"
          element={
            <Navigate to="/login" />
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

        <Route
          path="/free-trial"
          element={<FreeTrial />}
        />

        <Route
          path="/free-trial/register"
          element={<FreeTrialRegister />}
        />

        <Route
          path="/invitation"
          element={<AcceptInvitation />}
        />

        <Route
          path="/verify"
          element={<VerifyAccount />}
        />

        <Route
          path="/create-password"
          element={<CreatePassword />}
        />

        <Route
          path="/account-created"
          element={<AccountCreated />}
        />

        {/* Center Admin */}
        <Route
          path="/center/dashboard"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <Learner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/dashboard/AddLearner"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <AddLearner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/dashboard/:id/EditLearner"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <EditLearner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/dashboard/:id/progress"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <Progress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <CenterProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/doctors"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <ViewDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/staff"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <ViewStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/AddDoctor"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <AddDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/AddStaff"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <AddStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/:id/EditDoctor"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <EditDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/profile/:id/EditStaff"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <EditStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/materials"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <ActivityLibrary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/materials/CreateActivity"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <CreateActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/materials/regulatory"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <RegulatoryActivities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/materials/:id"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <ActivityPreview />
            </ProtectedRoute>
          }
        />

        <Route
            path="/center/materials/DraftMaterials"
            element={
              <ProtectedRoute roles={["center_admin"]}>
                <DraftMaterials />
              </ProtectedRoute>
            }
        />

        <Route
          path="/center/materials/ArchivedMaterials"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <ArchivedMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/center/notifications"
          element={
            <ProtectedRoute roles={["center_admin"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
            path="/center/schedule"
            element={
              <ProtectedRoute roles={["center_admin"]}>
                <Schedule />
              </ProtectedRoute>
            }
        />

        <Route
            path="/center/collaboration"
            element={
              <ProtectedRoute roles={["center_admin"]}>
                <Collaboration />
              </ProtectedRoute>
            }
        />

        {/* Therapist */}
        <Route
          path="/therapist/dashboard"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistLearner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/dashboard/:id/progress"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <Progress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/dashboard/:id/progress"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/profile"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/materials"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/materials/DraftMaterials"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistDraftMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/materials/ArchivedMaterials"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistArchivedMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/materials/:id"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistActivityPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/materials/CreateActivity"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistCreateActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/notifications"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistNotification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/schedule"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapist/collaboration"
          element={
            <ProtectedRoute roles={["therapist"]}>
              <TherapistCollaboration />
            </ProtectedRoute>
          }
        />


        {/* Super Admin */}
        <Route
          path="/superadmin/SuperDashboardScreen"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperDashboardScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/SuperManageScreen"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperManageScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/SuperProcessScreen"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SuperProcessScreen />
            </ProtectedRoute>
          }
        />
        
      {/* Doctor */}
        <Route
          path="/doctor/DocDashboardScreen"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DocDashboardScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/patients/:patientId"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DocPatientProgressScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/DocCollabScreen"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DocCollabScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/DocNotificationScreen"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DocNotificationScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/DocProfileScreen"
          element={
            <ProtectedRoute roles={["doctor"]}>
              <DocProfileScreen />
            </ProtectedRoute>
          }
        />




      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
