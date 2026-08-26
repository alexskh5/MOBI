<<<<<<< HEAD
import { useMemo, useState, type ReactNode } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ClipboardCheck,
  Home,
  LogOut,
  Search,
  UserCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";
import mobiLogo from "../../assets/mobiLogo.png";
import { getSuperAdminCenter, getSuperAdminParents } from "../../services/super_admin/superAdminApi";

type UserTab = "center" | "parents";

type CenterAccount = {
  id: string;
  centerName: string;
  contactPerson: string;
  centerOwner: string;
  email: string;
  status: "Active" | "Suspended";
};

type ApiCenterAccount = {
  id: string;
  center_name: string;
  contact_person: string | null;
  center_owner: string | null;
  email: string;
  plan_detail: string | null;
  status: "Active" | "Suspended";
};

type ParentAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  childNumber: number;
  status: "Active" | "Suspended";
};

<<<<<<< HEAD
=======
type ApiParentAccount = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  plan_detail: string;
  child_number: number;
  status: "Active" | "Suspended";
};

type SubscriptionPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: "Month" | "Year";
  learnerLimit: string;
  aiAccess: string;
  isActive: boolean;
};




>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
const centerAccount: CenterAccount = {
  id: "C-001",
  centerName: "Abled Mind Therapy Center",
  contactPerson: "Maria Garcia",
  centerOwner: "Ruby Jane",
  email: "abledmind@example.com",
  status: "Active",
};

const initialParents: ParentAccount[] = [
  {
    id: "P-001",
    firstName: "Maria Curry",
    lastName: "Deguzman",
    email: "maria@example.com",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-002",
    firstName: "Habibi",
    lastName: "Deloz Reyes",
    email: "habibi@example.com",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-003",
    firstName: "Maria Curry",
    lastName: "Kwanza",
    email: "kwanza@example.com",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-004",
    firstName: "Gwen",
    lastName: "Garcia",
    email: "gwen@example.com",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-005",
    firstName: "Say",
    lastName: "Dela Peña",
    email: "say@example.com",
    childNumber: 2,
    status: "Active",
  },
];

export default function SuperManageScreen() {
  const navigate = useNavigate();

  // Manage opens directly to the user-management view.
  const [activeTab, setActiveTab] = useState<UserTab>("center");
  const [searchQuery, setSearchQuery] = useState("");

  const [center, setCenter] = useState<CenterAccount>(centerAccount);
  const [centerLoading, setCenterLoading] = useState(false);
  const [centerError, setCenterError] = useState("");

  const [parents, setParents] = useState<ParentAccount[]>(initialParents);
<<<<<<< HEAD
=======
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsError, setParentsError] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);

>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
  const [selectedUser, setSelectedUser] = useState<ParentAccount | null>(null);

  const activeParents = parents.filter(
    (parent) => parent.status === "Active",
  ).length;

  const suspendedParents = parents.filter(
    (parent) => parent.status === "Suspended",
  ).length;

  const filteredParents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return parents;
    }

    return parents.filter((parent) =>
      `${parent.id} ${parent.firstName} ${parent.lastName} ${parent.email} ${parent.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [parents, searchQuery]);

<<<<<<< HEAD
  const handleTabChange = (tab: UserTab) => {
    setActiveTab(tab);
=======
  useEffect(() => {
    let isMounted = true;

    async function loadParents() {
      try {
        setParentsLoading(true);
        setParentsError("");

        const result = await getSuperAdminParents();

        const mappedParents: ParentAccount[] = result.data.map(
          (parent: ApiParentAccount) => ({
            id: parent.id,
            firstName: parent.first_name,
            lastName: parent.last_name,
            email: parent.email,
            planDetail: parent.plan_detail,
            childNumber: parent.child_number,
            status: parent.status,
          })
        );

        if (isMounted) {
          setParents(mappedParents);
        }
      } catch (error: any) {
        if (isMounted) {
          setParentsError(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load parent accounts."
          );
        }
      } finally {
        if (isMounted) {
          setParentsLoading(false);
        }
      }
    }

    loadParents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCenter() {
      try {
        setCenterLoading(true);
        setCenterError("");

        const result = await getSuperAdminCenter();
        const apiCenter: ApiCenterAccount = result.data;

        const mappedCenter: CenterAccount = {
          id: apiCenter.id,
          centerName: apiCenter.center_name,
          contactPerson: apiCenter.contact_person || "Not set",
          centerOwner: apiCenter.center_owner || "Not set",
          email: apiCenter.email,
          planDetail: apiCenter.plan_detail || "No plan",
          status: apiCenter.status,
        };

        if (isMounted) {
          setCenter(mappedCenter);
        }
      } catch (error: any) {
        if (isMounted) {
          setCenterError(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load center account."
          );
        }
      } finally {
        if (isMounted) {
          setCenterLoading(false);
        }
      }
    }

    loadCenter();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    setSearchQuery("");
    setSelectedUser(null);
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3

    if (tab === "center") {
      setSearchQuery("");
    }
  };

  const suspendParent = (id: string) => {
    setParents((previousParents) =>
      previousParents.map((parent) =>
        parent.id === id
          ? {
              ...parent,
              status: parent.status === "Active" ? "Suspended" : "Active",
            }
          : parent,
      ),
    );
  };

  return (
    <main className="super-page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <img src={mobiLogo} alt="MOBI Logo" />

            <div className="brand-text">
              <span className="brand-name">MOBI</span>
              <span className="brand-role">Super Admin</span>
            </div>
          </div>

          <div className="welcome">
            <span>WELCOME BACK</span>
            <strong>Dev</strong>
          </div>

          <nav className="nav-links">
            <button
              className="nav-item"
              onClick={() => navigate("/superadmin/SuperDashboardScreen")}
            >
              <span className="nav-icon">
                <Home size={19} />
              </span>

              <span>Dashboard</span>
            </button>

            <button className="nav-item active">
              <span className="nav-active-line" />

              <span className="nav-icon">
                <Building2 size={19} />
              </span>

              <span>Manage</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/superadmin/SuperProcessScreen")}
            >
              <span className="nav-icon">
                <ClipboardCheck size={19} />
              </span>

              <span>Process</span>
            </button>
          </nav>
        </div>

        <button className="logout-button" onClick={() => navigate("/")}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="manage-content">
        {/* PAGE HEADER */}
        <header className="page-header">
          <div>
            <span className="page-eyebrow">SUPER ADMIN</span>
            <h1>Manage</h1>
            <p>
              View and manage the partnered therapy center and MOBI parent
              accounts.
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">D</div>

            <div className="admin-info">
              <strong>Dev</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* MANAGEMENT PANEL */}
        <section className="management-panel">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">ACCOUNT MANAGEMENT</span>
              <h2>Manage Users</h2>
              <p>
                Review the partnered center and manage free-trial parent
                accounts from one place.
              </p>
            </div>

            {activeTab === "parents" && (
              <div className="search-box">
                <Search size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search parent accounts..."
                  aria-label="Search parent accounts"
                />
              </div>
            )}
          </div>

          <div className="tabs-row">
            <button
              className={activeTab === "center" ? "tab active" : "tab"}
              onClick={() => handleTabChange("center")}
            >
              <Building2 size={16} />
              Partnered Center
            </button>

            <button
              className={activeTab === "parents" ? "tab active" : "tab"}
              onClick={() => handleTabChange("parents")}
            >
              <Users size={16} />
              Free-Trial Parents
              <span className="tab-count">{parents.length}</span>
            </button>
          </div>

          <div className="panel-body">
            {activeTab === "center" && (
<<<<<<< HEAD
              <div className="center-account-card">
                <div className="center-account-top">
                  <div className="center-account-main">
                    <div className="center-icon">
                      <Building2 size={22} />
                    </div>

                    <div>
                      <span className="account-kicker">PARTNERED CENTER</span>
                      <h3>{centerAccount.centerName}</h3>
                      <p>{centerAccount.email}</p>
                    </div>
=======
              <>
                {centerLoading && (
                  <div className="center-card">
                    <p>Loading center account...</p>
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
                  </div>
                )}

<<<<<<< HEAD
                  <StatusBadge status={centerAccount.status} />
                </div>

                <div className="center-details-grid">
                  <InfoItem label="Center ID" value={centerAccount.id} />
                  <InfoItem
                    label="Contact Person"
                    value={centerAccount.contactPerson}
                  />
                  <InfoItem
                    label="Center Owner"
                    value={centerAccount.centerOwner}
                  />
                </div>
              </div>
=======
                {centerError && (
                  <div className="center-card">
                    <p>{centerError}</p>
                  </div>
                )}

                {!centerLoading && !centerError && (
                  <div className="center-card">
                    <div className="center-top">
                      <div className="center-icon">
                        <Building2 size={28} />
                      </div>

                      <div>
                        <h2>{center.centerName}</h2>
                        <p>{center.email}</p>
                      </div>

                      <span
                        className={
                          center.status === "Active"
                            ? "status active"
                            : "status suspended"
                        }
                      >
                        {center.status}
                      </span>
                    </div>

                    <div className="info-grid">
                      <InfoItem label="Center ID" value={center.id} />
                      <InfoItem label="Contact Person" value={center.contactPerson} />
                      <InfoItem label="Center Owner" value={center.centerOwner} />
                      <InfoItem label="Plan Detail" value={center.planDetail} />
                    </div>
                  </div>
                )}
              </>
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3
            )}

            {activeTab === "parents" && (
              <div className="parents-section">
                <div className="parent-summary">
                  <SummaryCard
                    icon={<Users size={18} />}
                    label="Total Parents"
                    value={parents.length}
                    description="Free-trial accounts"
                    tone="purple"
                  />

                  <SummaryCard
                    icon={<UserCheck size={18} />}
                    label="Active"
                    value={activeParents}
                    description="Currently accessible"
                    tone="green"
                  />

                  <SummaryCard
                    icon={<UserRoundX size={18} />}
                    label="Suspended"
                    value={suspendedParents}
                    description="Access restricted"
                    tone="red"
                  />
                </div>

<<<<<<< HEAD
                <div className="parent-table">
                  <div className="parent-table-header">
                    <span>Parent</span>
                    <span>Parent ID</span>
                    <span>Children</span>
                    <span>Status</span>
                    <span />
                  </div>
=======
                <div className="parent-list compact">
                  {parentsLoading && (
                    <div className="empty-state">
                      <p>Loading parent accounts...</p>
                    </div>
                  )}

                  {parentsError && (
                    <div className="empty-state">
                      <p>{parentsError}</p>
                    </div>
                  )}

                  {!parentsLoading && !parentsError && filteredParents.map((parent) => (
                    <article key={parent.id} className="parent-row">
                      <div className="parent-main">
                        <div className="avatar">
                          {parent.firstName.charAt(0)}
                          {parent.lastName.charAt(0)}
                        </div>
>>>>>>> ab67a1ed037e5f5633be7e3f3ae8832a5e45fbc3

                  <div className="parent-list">
                    {filteredParents.length > 0 ? (
                      filteredParents.map((parent) => (
                        <div key={parent.id} className="parent-row">
                          <div className="parent-main">
                            <div className="avatar">
                              {parent.firstName.charAt(0)}
                              {parent.lastName.charAt(0)}
                            </div>

                            <div className="parent-copy">
                              <h3>
                                {parent.firstName} {parent.lastName}
                              </h3>
                              <p>{parent.email}</p>
                            </div>
                          </div>

                          <span className="parent-id">{parent.id}</span>

                          <span className="children-count">
                            {parent.childNumber}
                          </span>

                          <StatusBadge status={parent.status} />

                          <button
                            className="view-button"
                            onClick={() => setSelectedUser(parent)}
                          >
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <Search size={20} />
                        <strong>No parent accounts found</strong>
                        <span>Try a different name, email, ID, or status.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>

      {/* PARENT DETAILS MODAL */}
      {selectedUser && (
        <Modal
          title="Parent Account Details"
          onClose={() => setSelectedUser(null)}
        >
          <div className="modal-account-heading">
            <div className="modal-avatar">
              {selectedUser.firstName.charAt(0)}
              {selectedUser.lastName.charAt(0)}
            </div>

            <div className="modal-heading-copy">
              <span>PARENT ACCOUNT</span>
              <h3>
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p>{selectedUser.email}</p>
            </div>

            <StatusBadge status={selectedUser.status} />
          </div>

          <div className="modal-info-grid">
            <InfoItem label="Parent ID" value={selectedUser.id} />
            <InfoItem
              label="Children"
              value={String(selectedUser.childNumber)}
            />
          </div>

          <div className="modal-actions">
            <button
              className={
                selectedUser.status === "Active"
                  ? "account-action-button suspend"
                  : "account-action-button activate"
              }
              onClick={() => {
                suspendParent(selectedUser.id);
                setSelectedUser(null);
              }}
            >
              {selectedUser.status === "Active"
                ? "Suspend Account"
                : "Activate Account"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        :root {
          --mobi-purple: #7456a3;
          --mobi-purple-dark: #5f4588;
          --mobi-purple-light: #f3eff8;

          --page-bg: #f7f7f9;
          --card-bg: #ffffff;

          --text-primary: #202027;
          --text-secondary: #757580;
          --text-muted: #9898a3;

          --border: #e8e8ed;
          --border-soft: #eeeef2;

          --success: #4f9467;
          --success-light: #edf7f0;

          --danger: #a75555;
          --danger-light: #faf0f0;
        }

        body {
          margin: 0;
          background: var(--page-bg);
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .super-page {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          background: var(--page-bg);
          color: var(--text-primary);
          font-family:
            Inter,
            Poppins,
            Arial,
            sans-serif;
        }

        /* ==============================
           SIDEBAR
        ============================== */

        .sidebar {
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 18px 22px;
          background: #ffffff;
          border-right: 1px solid var(--border);
        }

        .sidebar-top {
          width: 100%;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 10px;
          margin-bottom: 38px;
        }

        .brand img {
          width: 43px;
          height: 43px;
          object-fit: contain;
        }

        .brand-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--text-primary);
        }

        .brand-role {
          margin-top: 2px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .welcome {
          display: flex;
          flex-direction: column;
          padding: 0 12px;
          margin-bottom: 24px;
        }

        .welcome span {
          margin-bottom: 5px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.13em;
          color: var(--text-muted);
        }

        .welcome strong {
          font-size: 16px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          position: relative;
          width: 100%;
          min-height: 46px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #666672;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 13px;
          font-size: 14px;
          font-weight: 550;
          text-align: left;
          transition:
            background 0.16s ease,
            color 0.16s ease;
        }

        .nav-item:hover {
          background: #f8f6fa;
          color: var(--mobi-purple);
        }

        .nav-item.active {
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-weight: 650;
        }

        .nav-active-line {
          display: none;
        }

        .nav-item.active .nav-active-line {
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          display: block;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: var(--mobi-purple);
        }

        .nav-icon {
          width: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-button {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 13px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #777781;
          cursor: pointer;
          font-size: 14px;
          font-weight: 550;
          transition:
            background 0.16s ease,
            color 0.16s ease;
        }

        .logout-button:hover {
          background: #faf2f2;
          color: #a34e4e;
        }

        /* ==============================
           MAIN CONTENT
        ============================== */

        .manage-content {
          width: 100%;
          min-width: 0;
          max-width: 1500px;
          margin: 0 auto;
          padding: 35px 42px 55px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .page-eyebrow,
        .section-eyebrow {
          display: block;
          margin-bottom: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--mobi-purple);
        }

        .page-header h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--text-primary);
        }

        .page-header > div:first-child > p {
          max-width: 610px;
          margin: 9px 0 0;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 5px 0;
        }

        .admin-avatar {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-size: 14px;
          font-weight: 700;
        }

        .admin-info {
          display: flex;
          flex-direction: column;
          min-width: 85px;
        }

        .admin-info strong {
          font-size: 13px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .admin-info span {
          margin-top: 3px;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* ==============================
           MANAGEMENT PANEL
        ============================== */

        .management-panel {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--card-bg);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 23px 24px 21px;
          border-bottom: 1px solid var(--border-soft);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 650;
          letter-spacing: -0.015em;
          color: var(--text-primary);
        }

        .panel-header p {
          max-width: 600px;
          margin: 6px 0 0;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .search-box {
          width: min(310px, 100%);
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: #fafafd;
          color: var(--text-muted);
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .search-box:focus-within {
          border-color: #cfc4df;
          background: #ffffff;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 11px;
        }

        .search-box input::placeholder {
          color: #aaa9b3;
        }

        .tabs-row {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-soft);
          background: #fafafd;
        }

        .tab {
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 10px;
          font-weight: 620;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .tab:hover {
          background: #f5f2f8;
          color: var(--mobi-purple);
        }

        .tab.active {
          border-color: #ded8e8;
          background: #ffffff;
          color: var(--mobi-purple);
        }

        .tab-count {
          min-width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          border-radius: 999px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-size: 9px;
          font-weight: 700;
        }

        .panel-body {
          padding: 22px;
        }

        /* ==============================
           CENTER ACCOUNT
        ============================== */

        .center-account-card {
          border: 1px solid var(--border);
          border-radius: 13px;
          background: #ffffff;
          overflow: hidden;
        }

        .center-account-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 21px;
          border-bottom: 1px solid var(--border-soft);
        }

        .center-account-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .center-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .account-kicker {
          display: block;
          margin-bottom: 4px;
          color: var(--mobi-purple);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .center-account-main h3 {
          margin: 0;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 650;
          color: var(--text-primary);
        }

        .center-account-main p {
          margin: 4px 0 0;
          font-size: 10px;
          color: var(--text-muted);
          word-break: break-word;
        }

        .center-details-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
          padding: 16px;
          background: #fafafd;
        }

        .info-item {
          min-width: 0;
          padding: 13px 14px;
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          background: #ffffff;
        }

        .info-item span {
          display: block;
          margin-bottom: 6px;
          color: var(--text-muted);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .info-item strong {
          display: block;
          overflow: hidden;
          color: var(--text-primary);
          font-size: 11px;
          line-height: 1.5;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==============================
           PARENT SUMMARY
        ============================== */

        .parents-section {
          width: 100%;
        }

        .parent-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .summary-card {
          min-height: 90px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: #ffffff;
        }

        .summary-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
        }

        .summary-card.purple .summary-icon {
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .summary-card.green .summary-icon {
          background: var(--success-light);
          color: var(--success);
        }

        .summary-card.red .summary-icon {
          background: var(--danger-light);
          color: var(--danger);
        }

        .summary-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .summary-copy span {
          color: var(--text-secondary);
          font-size: 9px;
          font-weight: 600;
        }

        .summary-copy strong {
          margin-top: 3px;
          color: var(--text-primary);
          font-size: 22px;
          line-height: 1;
          font-weight: 700;
        }

        .summary-copy small {
          margin-top: 6px;
          color: var(--text-muted);
          font-size: 8px;
        }

        /* ==============================
           PARENT TABLE
        ============================== */

        .parent-table {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #ffffff;
        }

        .parent-table-header {
          display: grid;
          grid-template-columns:
            minmax(240px, 1fr)
            95px
            80px
            105px
            64px;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-soft);
          background: #fafafd;
          color: var(--text-muted);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .parent-row {
          min-height: 66px;
          display: grid;
          grid-template-columns:
            minmax(240px, 1fr)
            95px
            80px
            105px
            64px;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-soft);
          transition: background 0.14s ease;
        }

        .parent-row:last-child {
          border-bottom: none;
        }

        .parent-row:hover {
          background: #faf9fc;
        }

        .parent-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar,
        .modal-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-weight: 700;
        }

        .avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          font-size: 10px;
        }

        .parent-copy {
          min-width: 0;
        }

        .parent-main h3 {
          overflow: hidden;
          margin: 0;
          color: var(--text-primary);
          font-size: 11px;
          font-weight: 620;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .parent-main p {
          overflow: hidden;
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .parent-id,
        .children-count {
          color: var(--text-secondary);
          font-size: 10px;
        }

        .status {
          justify-self: start;
          min-height: 27px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 650;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status.active {
          background: var(--success-light);
          color: var(--success);
        }

        .status.suspended {
          background: var(--danger-light);
          color: var(--danger);
        }

        .view-button {
          min-height: 31px;
          padding: 0 10px;
          border: 1px solid #ded8e8;
          border-radius: 8px;
          background: #ffffff;
          color: var(--mobi-purple);
          cursor: pointer;
          font-size: 9px;
          font-weight: 650;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .view-button:hover {
          background: var(--mobi-purple-light);
          border-color: #cfc4df;
        }

        .empty-state {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 24px;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-state strong {
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 620;
        }

        .empty-state span {
          font-size: 9px;
        }

        /* ==============================
           MODAL
        ============================== */

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(26, 24, 30, 0.36);
          backdrop-filter: blur(3px);
        }

        .modal-card {
          width: min(520px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 22px 60px rgba(31, 25, 39, 0.16);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 19px 21px;
          border-bottom: 1px solid var(--border-soft);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .close-btn {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: #f6f6f8;
          color: #71717a;
          cursor: pointer;
          transition:
            background 0.14s ease,
            color 0.14s ease;
        }

        .close-btn:hover {
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .modal-body {
          padding: 22px;
        }

        .modal-account-heading {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 13px;
          padding-bottom: 19px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-soft);
        }

        .modal-avatar {
          width: 43px;
          height: 43px;
          font-size: 11px;
        }

        .modal-heading-copy {
          min-width: 0;
        }

        .modal-heading-copy > span {
          display: block;
          margin-bottom: 4px;
          color: var(--mobi-purple);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .modal-heading-copy h3 {
          overflow: hidden;
          margin: 0;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-heading-copy p {
          overflow: hidden;
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
          padding-top: 17px;
          border-top: 1px solid var(--border-soft);
        }

        .account-action-button {
          min-height: 36px;
          padding: 0 13px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 650;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .account-action-button.suspend {
          border: 1px solid #edcece;
          background: var(--danger-light);
          color: var(--danger);
        }

        .account-action-button.suspend:hover {
          border-color: #ddb8b8;
          background: #f7e7e7;
        }

        .account-action-button.activate {
          border: 1px solid #cfe4d6;
          background: var(--success-light);
          color: var(--success);
        }

        .account-action-button.activate:hover {
          border-color: #b8d7c2;
          background: #e5f2e9;
        }

        /* ==============================
           RESPONSIVE
        ============================== */

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 205px minmax(0, 1fr);
          }

          .manage-content {
            padding: 30px 25px 45px;
          }

          .parent-table-header,
          .parent-row {
            grid-template-columns:
              minmax(200px, 1fr)
              80px
              65px
              95px
              58px;
            gap: 10px;
          }
        }

        @media (max-width: 820px) {
          .super-page {
            grid-template-columns: 76px minmax(0, 1fr);
          }

          .sidebar {
            align-items: center;
            padding: 22px 10px;
          }

          .brand {
            justify-content: center;
            padding: 0;
            margin-bottom: 30px;
          }

          .brand img {
            width: 42px;
            height: 42px;
          }

          .brand-text,
          .welcome,
          .nav-item > span:last-child,
          .logout-button span {
            display: none;
          }

          .nav-item,
          .logout-button {
            width: 48px;
            height: 48px;
            min-height: 48px;
            justify-content: center;
            padding: 0;
          }

          .nav-item {
            margin: 0 auto;
          }

          .nav-icon {
            width: auto;
          }

          .nav-item.active .nav-active-line {
            left: -10px;
          }

          .logout-button {
            margin: 0 auto;
          }

          .manage-content {
            padding: 26px 18px 40px;
          }

          .panel-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .search-box {
            width: 100%;
          }

          .parent-summary {
            grid-template-columns: 1fr;
          }

          .summary-card {
            min-height: 74px;
          }

          .parent-table-header {
            display: none;
          }

          .parent-row {
            grid-template-columns: minmax(0, 1fr) auto auto;
          }

          .parent-id,
          .children-count {
            display: none;
          }

          .status {
            justify-self: start;
          }

          .center-details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .super-page {
            display: block;
          }

          .sidebar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            z-index: 50;
            width: 100%;
            height: 67px;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            padding: 8px 13px;
            border-top: 1px solid var(--border);
            border-right: none;
          }

          .sidebar-top {
            display: contents;
          }

          .brand,
          .welcome {
            display: none;
          }

          .nav-links {
            flex-direction: row;
            gap: 6px;
          }

          .nav-item,
          .logout-button {
            width: 46px;
            height: 46px;
          }

          .nav-item.active .nav-active-line {
            left: 12px;
            right: 12px;
            bottom: -8px;
            top: auto;
            width: auto;
            height: 3px;
            border-radius: 3px 3px 0 0;
          }

          .manage-content {
            padding: 22px 13px 95px;
          }

          .page-header {
            margin-bottom: 22px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .admin-profile {
            display: none;
          }

          .management-panel {
            border-radius: 12px;
          }

          .panel-header {
            padding: 19px 17px;
          }

          .tabs-row {
            align-items: stretch;
            padding: 10px 12px;
          }

          .tab {
            flex: 1;
            min-width: 0;
            padding: 0 8px;
          }

          .tab-count {
            display: none;
          }

          .panel-body {
            padding: 13px;
          }

          .center-account-top {
            align-items: flex-start;
            flex-direction: column;
            padding: 16px;
          }

          .center-details-grid {
            padding: 12px;
          }

          .parent-row {
            grid-template-columns: minmax(0, 1fr) auto;
            padding: 11px 12px;
          }

          .parent-row > .status {
            grid-column: 1;
            margin-left: 47px;
          }

          .view-button {
            grid-column: 2;
            grid-row: 1 / span 2;
          }

          .parent-main h3 {
            white-space: normal;
          }

          .modal-backdrop {
            padding: 12px;
          }

          .modal-body {
            padding: 18px;
          }

          .modal-account-heading {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .modal-account-heading > .status {
            grid-column: 2;
          }

          .modal-info-grid {
            grid-template-columns: 1fr;
          }

          .account-action-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "Active" | "Suspended";
}) {
  return (
    <span
      className={status === "Active" ? "status active" : "status suspended"}
    >
      <span className="status-dot" />
      {status}
    </span>
  );
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  tone: "purple" | "green" | "red";
};

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone,
}: SummaryCardProps) {
  return (
    <div className={`summary-card ${tone}`}>
      <div className="summary-icon">{icon}</div>

      <div className="summary-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
