import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import mobiLogo from "../../assets/mobiLogo.png";
import { getSuperAdminCenter, getSuperAdminParents } from "../../services/super_admin/superAdminApi";

type ViewMode = "menu" | "users" | "subscription";
type UserTab = "center" | "parents";

type CenterAccount = {
  id: string;
  centerName: string;
  contactPerson: string;
  centerOwner: string;
  email: string;
  planDetail: string;
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
  planDetail: string;
  childNumber: number;
  status: "Active" | "Suspended";
};

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

type PlanForm = Omit<SubscriptionPlan, "id" | "isActive">;

const centerAccount: CenterAccount = {
  id: "C-001",
  centerName: "Abled Mind Therapy Center",
  contactPerson: "Maria Garcia",
  centerOwner: "Ruby Jane",
  email: "abledmind@example.com",
  planDetail: "Center Standard",
  status: "Active",
};

const initialParents: ParentAccount[] = [
  {
    id: "P-001",
    firstName: "Maria Curry",
    lastName: "Deguzman",
    email: "maria@example.com",
    planDetail: "Free Trial",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-002",
    firstName: "Habibi",
    lastName: "Deloz Reyes",
    email: "habibi@example.com",
    planDetail: "Free Trial",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-003",
    firstName: "Maria Curry",
    lastName: "Kwanza",
    email: "kwanza@example.com",
    planDetail: "Free Trial",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-004",
    firstName: "Gwen",
    lastName: "Garcia",
    email: "gwen@example.com",
    planDetail: "Free Trial",
    childNumber: 2,
    status: "Active",
  },
  {
    id: "P-005",
    firstName: "Say",
    lastName: "Dela Peña",
    email: "say@example.com",
    planDetail: "Free Trial",
    childNumber: 2,
    status: "Active",
  },
];

const initialPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Center Standard",
    description:
      "Limited number of learners, progress monitoring features, and limited AI generator access.",
    price: 549,
    duration: "Month",
    learnerLimit: "Limited learners",
    aiAccess: "Limited AI access",
    isActive: true,
  },
  {
    id: 2,
    name: "Center Advanced",
    description:
      "Unlimited number of learners, unlimited progress monitoring features, and unlimited AI generator access.",
    price: 949,
    duration: "Month",
    learnerLimit: "Unlimited learners",
    aiAccess: "Unlimited AI access",
    isActive: true,
  },
];

const emptyPlanForm: PlanForm = {
  name: "",
  description: "",
  price: 0,
  duration: "Month",
  learnerLimit: "",
  aiAccess: "",
};

export default function SuperManageScreen() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [activeTab, setActiveTab] = useState<UserTab>("center");
  const [searchQuery, setSearchQuery] = useState("");

  const [center, setCenter] = useState<CenterAccount>(centerAccount);
  const [centerLoading, setCenterLoading] = useState(false);
  const [centerError, setCenterError] = useState("");

  const [parents, setParents] = useState<ParentAccount[]>(initialParents);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsError, setParentsError] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);

  const [selectedUser, setSelectedUser] = useState<ParentAccount | null>(null);
  const [planModalMode, setPlanModalMode] = useState<"add" | "edit" | null>(
    null
  );
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlanForm);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) =>
      `${parent.id} ${parent.firstName} ${parent.lastName} ${parent.email} ${parent.planDetail} ${parent.status}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [parents, searchQuery]);

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

    if (viewMode === "menu") {
      navigate("/superadmin/SuperDashboardScreen");
      return;
    }

    setViewMode("menu");
  };

  const openAddPlan = () => {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanModalMode("add");
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      learnerLimit: plan.learnerLimit,
      aiAccess: plan.aiAccess,
    });
    setPlanModalMode("edit");
  };

  const closePlanModal = () => {
    setPlanModalMode(null);
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
  };

  const savePlan = () => {
    if (!planForm.name.trim() || !planForm.description.trim()) {
      alert("Please complete the plan name and description.");
      return;
    }

    if (planModalMode === "add") {
      const newPlan: SubscriptionPlan = {
        id: Date.now(),
        ...planForm,
        isActive: true,
      };

      setPlans((prev) => [newPlan, ...prev]);
    }

    if (planModalMode === "edit" && editingPlanId !== null) {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === editingPlanId ? { ...plan, ...planForm } : plan
        )
      );
    }

    closePlanModal();
  };

  const removePlan = (id: number) => {
    const confirmed = confirm("Remove this subscription plan?");
    if (!confirmed) return;

    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const suspendParent = (id: string) => {
    setParents((prev) =>
      prev.map((parent) =>
        parent.id === id
          ? {
              ...parent,
              status: parent.status === "Active" ? "Suspended" : "Active",
            }
          : parent
      )
    );
  };

  return (
    <main className="super-page">
      <aside className="sidebar">
        <button className="burger-btn" aria-label="Menu">
          <Menu size={22} />
        </button>

        <div className="brand">
          <img src={mobiLogo} alt="MOBI Logo" />
        </div>

        <div className="welcome">
          <h2>
            Welcome
            <br />
            back, Admin!
          </h2>
        </div>

        <nav className="nav-links">
          <button
            className="nav-item"
            onClick={() => navigate("/superadmin/SuperDashboardScreen")}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <button className="nav-item active" onClick={() => setViewMode("menu")}>
            <Building2 size={20} />
            <span>Manage</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/superadmin/SuperProcessScreen")}
          >
            <ClipboardCheck size={20} />
            <span>Process</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/")}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </nav>
      </aside>

      <section className="manage-card">
        {viewMode !== "menu" && (
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
          </button>
        )}

        {viewMode === "menu" && (
          <div className="menu-options">
            <button className="manage-option" onClick={() => setViewMode("users")}>
              <div>
                <h2>MANAGE USERS</h2>
                <p>Manage the partnered center and free-trial parent accounts.</p>
              </div>
              <ArrowRight size={26} />
            </button>

            <button
              className="manage-option"
              onClick={() => setViewMode("subscription")}
            >
              <div>
                <h2>MANAGE APP SUBSCRIPTION</h2>
                <p>Add, edit, save, and remove subscription plans.</p>
              </div>
              <ArrowRight size={26} />
            </button>
          </div>
        )}

        {viewMode === "users" && (
          <div className="content-panel">
            <div className="panel-header">
              <div>
                <h1>Manage Users</h1>
                <p>One partnered center and free-trial parent accounts.</p>
              </div>

              <div className="search-box">
                <Search size={15} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parents..."
                />
              </div>
            </div>

            <div className="tabs">
              <button
                className={activeTab === "center" ? "tab active" : "tab"}
                onClick={() => setActiveTab("center")}
              >
                Partnered Center
              </button>

              <button
                className={activeTab === "parents" ? "tab active" : "tab"}
                onClick={() => setActiveTab("parents")}
              >
                Free-Trial Parents
              </button>
            </div>

            {activeTab === "center" && (
              <>
                {centerLoading && (
                  <div className="center-card">
                    <p>Loading center account...</p>
                  </div>
                )}

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
            )}

            {activeTab === "parents" && (
              <div className="parent-section">
                <div className="parent-summary">
                  <div>
                    <strong>{parents.length}</strong>
                    <span>Total free-trial parents</span>
                  </div>
                  <div>
                    <strong>
                      {parents.filter((p) => p.status === "Active").length}
                    </strong>
                    <span>Active accounts</span>
                  </div>
                  <div>
                    <strong>
                      {parents.filter((p) => p.status === "Suspended").length}
                    </strong>
                    <span>Suspended accounts</span>
                  </div>
                </div>

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

                        <div>
                          <h3>
                            {parent.firstName} {parent.lastName}
                          </h3>
                          <p>{parent.email}</p>
                        </div>
                      </div>

                      <span
                        className={
                          parent.status === "Active"
                            ? "status active"
                            : "status suspended"
                        }
                      >
                        {parent.status}
                      </span>

                      <button
                        className="secondary-btn"
                        onClick={() => setSelectedUser(parent)}
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "subscription" && (
          <div className="content-panel subscription-panel">
            <div className="subscription-header">
              <div>
                <h1>Manage Subscription Plan</h1>
                <p>Create and update center subscription packages.</p>
              </div>

              <button className="add-plan-btn" onClick={openAddPlan}>
                <Plus size={17} />
                Add subscription
              </button>
            </div>

            <div className="plans-list">
              {plans.map((plan) => (
                <article key={plan.id} className="plan-card">
                  <div>
                    <div className="plan-title-row">
                      <h2>{plan.name}</h2>
                      <span className="status active">Active</span>
                    </div>

                    <p>{plan.description}</p>

                    <div className="plan-features">
                      <span>{plan.learnerLimit}</span>
                      <span>{plan.aiAccess}</span>
                    </div>
                  </div>

                  <div className="plan-side">
                    <strong>₱{plan.price}</strong>
                    <span>/{plan.duration}</span>

                    <div className="plan-actions">
                      <button onClick={() => openEditPlan(plan)}>
                        <Edit3 size={18} />
                      </button>

                      <button onClick={() => removePlan(plan.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedUser && (
        <Modal title="Parent Account Details" onClose={() => setSelectedUser(null)}>
          <div className="modal-info">
            <InfoItem
              label="Name"
              value={`${selectedUser.firstName} ${selectedUser.lastName}`}
            />
            <InfoItem label="Email" value={selectedUser.email} />
            <InfoItem label="Parent ID" value={selectedUser.id} />
            <InfoItem label="Plan" value={selectedUser.planDetail} />
            <InfoItem label="Children" value={String(selectedUser.childNumber)} />
            <InfoItem label="Status" value={selectedUser.status} />
          </div>

          <div className="modal-actions">
            <button
              className="danger-btn"
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

      {planModalMode && (
        <Modal
          title={planModalMode === "add" ? "Add Subscription" : "Edit Subscription"}
          onClose={closePlanModal}
        >
          <div className="form-grid">
            <label>
              Plan Name
              <input
                value={planForm.name}
                onChange={(e) =>
                  setPlanForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Center Premium"
              />
            </label>

            <label>
              Price
              <input
                type="number"
                value={planForm.price}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                placeholder="549"
              />
            </label>

            <label>
              Duration
              <select
                value={planForm.duration}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    duration: e.target.value as "Month" | "Year",
                  }))
                }
              >
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </label>

            <label>
              Learner Limit
              <input
                value={planForm.learnerLimit}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    learnerLimit: e.target.value,
                  }))
                }
                placeholder="Limited learners"
              />
            </label>

            <label>
              AI Access
              <input
                value={planForm.aiAccess}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    aiAccess: e.target.value,
                  }))
                }
                placeholder="Limited AI access"
              />
            </label>

            <label className="full">
              Description
              <textarea
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this plan includes..."
              />
            </label>
          </div>

          <button className="save-btn" onClick={savePlan}>
            <CheckCircle2 size={18} />
            Save subscription
          </button>
        </Modal>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .super-page {
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 22px;
          padding: 18px;
          font-family: Inter, Poppins, Arial, sans-serif;
          color: #111;
        }

        .sidebar {
          position: sticky;
          top: 18px;
          height: calc(100vh - 36px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .burger-btn {
          border: none;
          background: transparent;
          padding: 6px;
          margin-bottom: 18px;
          cursor: pointer;
        }

        .brand {
          width: 100%;
          text-align: center;
          margin-bottom: 18px;
        }

        .brand img {
          width: 92px;
          height: auto;
          object-fit: contain;
        }

        .welcome {
          padding-left: 8px;
          margin-bottom: 22px;
        }

        .welcome h2 {
          margin: 0;
          font-size: 18px;
          line-height: 1.1;
          font-weight: 800;
        }

        .nav-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
          color: #111;
          text-align: left;
        }

        .nav-item.active {
          color: #9a9fd3;
        }

        .manage-card {
          position: relative;
          min-height: calc(100vh - 36px);
          min-width: 0;
          border-radius: 22px;
          padding: 34px 44px;
          background: #ead9eb;
          box-shadow: inset 0 0 0 1px rgba(130, 87, 145, 0.18);
          overflow-y: auto;
        }

        .back-btn {
          border: none;
          background: white;
          cursor: pointer;
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.12);
        }

        .menu-options {
          width: min(860px, 100%);
          margin: 18px auto 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .manage-option {
          min-height: 88px;
          border: none;
          border-radius: 26px 6px 26px 6px;
          background: rgba(255,255,255,0.96);
          padding: 22px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .manage-option h2 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 900;
        }

        .manage-option p {
          margin: 0;
          font-size: 14px;
          color: #333;
        }

        .content-panel {
          width: min(980px, 100%);
          margin: 0 auto;
          background: rgba(255,255,255,0.96);
          border-radius: 12px;
          padding: 26px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .panel-header,
        .subscription-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .panel-header h1,
        .subscription-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
        }

        .panel-header p,
        .subscription-header p {
          margin: 5px 0 0;
          color: #555;
          font-size: 14px;
        }

        .search-box {
          width: min(320px, 100%);
          height: 38px;
          background: #f1d9f1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 14px;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab {
          border: none;
          border-radius: 999px;
          background: #f3edf5;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 800;
          color: #333;
        }

        .tab.active {
          background: #dfb7e7;
          color: #7d3eb0;
        }

        .center-card,
        .parent-summary div,
        .parent-row {
          background: #f8f3f9;
          border: 1px solid #ead4ee;
        }

        .center-card {
          border-radius: 18px;
          padding: 22px;
        }

        .center-top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .center-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8d5ac4;
        }

        .center-top h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
        }

        .center-top p,
        .parent-main p {
          margin: 4px 0 0;
          color: #666;
          font-size: 13px;
          word-break: break-word;
        }

        .status {
          border-radius: 999px;
          padding: 6px 11px;
          font-size: 12px;
          font-weight: 900;
          width: fit-content;
        }

        .status.active {
          background: #e8f8e5;
          color: #2f8c24;
        }

        .status.suspended {
          background: #ffe8e8;
          color: #b73232;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .info-item {
          background: white;
          border-radius: 13px;
          padding: 13px;
          border: 1px solid #eee;
        }

        .info-item span {
          display: block;
          font-size: 12px;
          color: #777;
          margin-bottom: 5px;
        }

        .info-item strong {
          font-size: 14px;
        }

        .parent-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .parent-summary div {
          border-radius: 15px;
          padding: 15px;
        }

        .parent-summary strong {
          display: block;
          font-size: 22px;
          font-weight: 900;
        }

        .parent-summary span {
          color: #666;
          font-size: 13px;
        }

        .parent-list.compact {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .parent-row {
          border-radius: 16px;
          padding: 14px 16px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 14px;
          align-items: center;
        }

        .parent-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #dfb7e7;
          color: #6f2f9d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          flex-shrink: 0;
        }

        .parent-main h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
        }

        .secondary-btn,
        .danger-btn,
        .save-btn,
        .add-plan-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .secondary-btn {
          background: white;
          color: #7d3eb0;
          font-size: 10px; 
        }

        .danger-btn {
          background: #fff0f0;
          color: #b73232;
        }

        .add-plan-btn {
          background: #ef4b22;
          color: white;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .subscription-panel {
          margin-top: 30px;
        }

        .plans-list {
          display: grid;
          gap: 16px;
        }

        .plan-card {
          background: #ead9eb;
          border-radius: 15px;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .plan-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 7px;
        }

        .plan-card h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }

        .plan-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }

        .plan-features {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .plan-features span {
          background: white;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
          color: #6f2f9d;
        }

        .plan-side {
          text-align: right;
          min-width: 120px;
        }

        .plan-side strong {
          display: block;
          font-size: 24px;
          font-weight: 900;
        }

        .plan-side span {
          color: #555;
          font-size: 13px;
        }

        .plan-actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
        }

        .plan-actions button {
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          color: #555;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 50;
        }

        .modal-card {
          width: min(560px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .close-btn {
          border: none;
          width: 34px;
          height: 34px;
          cursor: pointer;
        }

        .modal-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .modal-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-grid label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
          font-weight: 900;
        }

        .form-grid input,
        .form-grid select,
        .form-grid textarea {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 11px 12px;
          font-family: inherit;
          outline: none;
        }

        .form-grid textarea {
          min-height: 90px;
          resize: vertical;
        }

        .form-grid .full {
          grid-column: 1 / -1;
        }

        .save-btn {
          width: 100%;
          margin-top: 18px;
          background: #8d5ac4;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 165px 1fr;
            gap: 16px;
          }

          .manage-card {
            padding: 28px 24px;
          }

          .info-grid,
          .parent-summary {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .super-page {
            grid-template-columns: 70px 1fr;
            padding: 10px;
            gap: 10px;
          }

          .sidebar {
            top: 10px;
            height: calc(100vh - 20px);
            align-items: center;
          }

          .brand img {
            width: 48px;
          }

          .welcome {
            display: none;
          }

          .nav-item {
            width: 48px;
            height: 48px;
            justify-content: center;
            padding: 0;
          }

          .nav-item span {
            display: none;
          }

          .manage-card {
            min-height: calc(100vh - 20px);
            padding: 22px 12px;
            border-radius: 18px;
          }

          .content-panel {
            padding: 18px;
          }

          .panel-header,
          .subscription-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-box {
            width: 100%;
          }

          .info-grid,
          .parent-summary,
          .form-grid,
          .modal-info {
            grid-template-columns: 1fr;
          }

          .parent-row {
            grid-template-columns: 1fr;
            align-items: flex-start;
          }

          .parent-row .secondary-btn {
            width: fit-content;
          }

          .plan-card {
            grid-template-columns: 1fr;
          }

          .plan-side {
            text-align: left;
          }

          .plan-actions {
            justify-content: flex-start;
          }

          .menu-options {
            gap: 16px;
          }

          .manage-option {
            padding: 18px;
            border-radius: 18px;
          }

          .manage-option h2 {
            font-size: 15px;
          }

          .manage-option p {
            font-size: 12px;
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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}