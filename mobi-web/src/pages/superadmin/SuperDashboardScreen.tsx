import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Home,
  LogOut,
  Menu,
  Users,
  Stethoscope,
  UserRoundCheck,
  ChevronRight,
  X,
} from "lucide-react";
import mobiLogo from "../../assets/mobiLogo.png";

type Activity = {
  id: number;
  title: string;
  centerName: string;
  rank: number;
  postedAgo: string;
  description: string;
  author: string;
  datePublished: string;
};

const stats = {
  activeParents: 90,
  activeDoctors: 3,
  activeTherapists: 5,
};

const mostUsedActivities: Activity[] = [
  {
    id: 1,
    title: "Learning greetings through fun",
    centerName: "Abled Mind Therapy Center",
    rank: 1,
    postedAgo: "1 yr ago",
    author: "Abled Mind Therapy Center",
    datePublished: "June 15, 2025",
    description:
      "An activity designed to help learners practice basic greetings and friendly social responses.",
  },
  {
    id: 2,
    title: "The story of colors",
    centerName: "Abled Mind Therapy Center",
    rank: 2,
    postedAgo: "1 yr ago",
    author: "Abled Mind Therapy Center",
    datePublished: "June 20, 2025",
    description:
      "A visual learning activity that introduces colors through storytelling and recognition tasks.",
  },
  {
    id: 3,
    title: "Puzzle and Me",
    centerName: "Abled Mind Therapy Center",
    rank: 3,
    postedAgo: "1 yr ago",
    author: "Abled Mind Therapy Center",
    datePublished: "July 2, 2025",
    description:
      "A problem-solving activity that supports attention, matching, and communication practice.",
  },
  {
    id: 4,
    title: "Brushing Teeth",
    centerName: "Abled Mind Therapy Center",
    rank: 4,
    postedAgo: "3 mon ago",
    author: "Abled Mind Therapy Center",
    datePublished: "March 10, 2026",
    description:
      "A daily living skills activity that teaches learners the steps of brushing teeth.",
  },
  {
    id: 5,
    title: "Saying Please and Its Difference",
    centerName: "Abled Mind Therapy Center",
    rank: 5,
    postedAgo: "1 wk ago",
    author: "Abled Mind Therapy Center",
    datePublished: "June 20, 2026",
    description:
      "A social readiness activity focused on polite expressions and appropriate communication.",
  },
  {
    id: 6,
    title: "How to lock the door in public areas and why it is needed",
    centerName: "Abled Mind Therapy Center",
    rank: 6,
    postedAgo: "4 mon ago",
    author: "Abled Mind Therapy Center",
    datePublished: "February 18, 2026",
    description:
      "A safety awareness activity that explains privacy, public spaces, and basic security routines.",
  },
];

export default function SuperDashboardScreen() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showReport, setShowReport] = useState(false);

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
            back, Dev!
          </h2>
        </div>

        <nav className="nav-links">
          <button
            className="nav-item active"
            onClick={() => navigate("/superadmin/SuperDashboardScreen")}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/superadmin/SuperManageScreen")}
          >
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

      <section className="dashboard-card">
        <div className="top-summary">
          <div className="active-center">
            <span className="status-pill" />
            <h1>Abled Mind Therapy Center is active</h1>
          </div>

          <StatCard
            icon={<Users size={23} />}
            label="Active Parents"
            value={stats.activeParents}
            color="purple"
          />

          <StatCard
            icon={<Stethoscope size={23} />}
            label="Active Doctors"
            value={stats.activeDoctors}
            color="green"
          />

          <StatCard
            icon={<UserRoundCheck size={23} />}
            label="Active Therapist"
            value={stats.activeTherapists}
            color="orange"
          />
        </div>

        <div className="section-header">
          <h2>Most Used Activities</h2>
          <button className="view-report" onClick={() => setShowReport(true)}>
            <BarChart3 size={16} />
            View report
          </button>
        </div>

        <div className="activity-list">
          {mostUsedActivities.map((activity) => (
            <div key={activity.id} className="activity-row">
              <div className="activity-logo">
                <img src={mobiLogo} alt="" />
              </div>

              <div className="activity-info">
                <h3>{activity.title}</h3>
                <p>By {activity.centerName}</p>
              </div>

              <div className="activity-rank">
                <strong>Top {activity.rank}</strong>
                <span>Posted {activity.postedAgo}</span>
              </div>

              <button
                className="arrow-btn"
                onClick={() => setSelectedActivity(activity)}
                aria-label={`View ${activity.title}`}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedActivity && (
        <Modal
          title="Activity Details"
          onClose={() => setSelectedActivity(null)}
        >
          <h3>{selectedActivity.title}</h3>
          <p>
            <strong>Description:</strong> {selectedActivity.description}
          </p>
          <p>
            <strong>Author:</strong> {selectedActivity.author}
          </p>
          <p>
            <strong>Date Published:</strong> {selectedActivity.datePublished}
          </p>
          <p>
            <strong>Ranking:</strong> Top {selectedActivity.rank}
          </p>
        </Modal>
      )}

      {showReport && (
        <Modal title="Activity Usage Report" onClose={() => setShowReport(false)}>
          <p>
            This report shows the most used activities from Abled Mind Therapy
            Center based on learner usage.
          </p>

          <div className="report-list">
            {mostUsedActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="report-item">
                <span>{activity.title}</span>
                <strong>Top {activity.rank}</strong>
              </div>
            ))}
          </div>

          <p className="report-note">
            Backend-ready: this can later connect to activity usage analytics
            from the database.
          </p>
        </Modal>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .super-page {
          min-height: 100vh;
          width: 100%;
          background: #fff;
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
          background: linear-gradient(90deg, #f0e2f3, #fbf4ff);
          color: #8c59c7;
        }

        .dashboard-card {
          min-width: 0;
          border-radius: 22px;
          padding: 32px;
          background: linear-gradient(135deg, #f0dfef, #fbf8fc 55%, #edddf0);
          box-shadow: inset 0 0 0 1px rgba(130, 87, 145, 0.13);
        }

        .top-summary {
          display: grid;
          grid-template-columns: 1.35fr repeat(3, 0.9fr);
          gap: 18px;
          align-items: center;
          margin-bottom: 30px;
        }

        .active-center {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .active-center h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 850;
        }

        .status-pill {
          width: 42px;
          height: 20px;
          border-radius: 999px;
          background: #c7df83;
          border: 1px solid rgba(0, 0, 0, 0.25);
          flex-shrink: 0;
        }

        .stat-card {
          min-height: 72px;
          border-radius: 16px;
          background: rgba(255,255,255,0.92);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          box-shadow: 0 4px 11px rgba(0,0,0,0.12);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .purple .stat-icon {
          color: #9252c6;
          background: #f3e7fb;
        }

        .green .stat-icon {
          color: #39b31d;
          background: #ecfae8;
        }

        .orange .stat-icon {
          color: #ff8717;
          background: #fff1e4;
        }

        .stat-label {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 23px;
          font-weight: 900;
        }

        .purple .stat-value {
          color: #9252c6;
        }

        .green .stat-value {
          color: #39b31d;
        }

        .orange .stat-value {
          color: #ff8717;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
        }

        .view-report {
          border: none;
          background: white;
          border-radius: 999px;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          color: #8750c6;
          cursor: pointer;
          box-shadow: 0 4px 9px rgba(0,0,0,0.09);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-row {
          min-height: 76px;
          border-radius: 19px;
          background: rgba(255,255,255,0.96);
          display: grid;
          grid-template-columns: 54px 1fr auto 34px;
          align-items: center;
          gap: 16px;
          padding: 13px 18px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }

        .activity-logo {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #cfcfcf;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: white;
        }

        .activity-logo img {
          width: 35px;
          height: 35px;
          object-fit: contain;
        }

        .activity-info h3 {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: 900;
        }

        .activity-info p {
          margin: 0;
          font-size: 12px;
          color: #555;
        }

        .activity-rank {
          text-align: right;
          min-width: 105px;
        }

        .activity-rank strong {
          display: block;
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .activity-rank span {
          font-size: 12px;
          color: #555;
        }

        .arrow-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
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
          width: min(480px, 100%);
          background: white;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .close-btn {
          border: none;
          background: #f5eef7;
          border-radius: 999px;
          width: 34px;
          height: 34px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body h3 {
          margin: 0 0 14px;
          font-size: 18px;
        }

        .modal-body p {
          font-size: 14px;
          line-height: 1.55;
          color: #333;
        }

        .report-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 14px 0;
        }

        .report-item {
          background: #f7f0fa;
          border-radius: 12px;
          padding: 11px 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 14px;
        }

        .report-note {
          font-size: 13px !important;
          color: #666 !important;
        }

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 165px 1fr;
            gap: 16px;
          }

          .dashboard-card {
            padding: 24px;
          }

          .top-summary {
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

          .dashboard-card {
            padding: 18px 12px;
            border-radius: 18px;
          }

          .top-summary {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 22px;
          }

          .active-center h1 {
            font-size: 15px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .activity-row {
            grid-template-columns: 44px 1fr 28px;
            gap: 10px;
            padding: 12px;
          }

          .activity-rank {
            grid-column: 2;
            text-align: left;
            min-width: 0;
          }

          .arrow-btn {
            grid-column: 3;
            grid-row: 1 / span 2;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "purple" | "green" | "orange";
}) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>
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

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}