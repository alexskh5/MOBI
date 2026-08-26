import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Home,
  LogOut,
  Stethoscope,
  UserRoundCheck,
  Users,
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

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [showReport, setShowReport] = useState(false);

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
              className="nav-item active"
              onClick={() => navigate("/superadmin/SuperDashboardScreen")}
            >
              <span className="nav-active-line" />

              <span className="nav-icon">
                <Home size={19} />
              </span>

              <span>Dashboard</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/superadmin/SuperManageScreen")}
            >
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
      <section className="dashboard-content">
        {/* PAGE HEADER */}
        <header className="page-header">
          <div>
            <span className="page-eyebrow">SUPER ADMIN</span>

            <h1>Dashboard</h1>

            <p>
              Monitor center activity and get a quick overview of the MOBI
              platform.
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

        {/* CENTER STATUS */}
        <section className="center-card">
          <div className="center-card-left">
            <div className="center-icon">
              <Building2 size={21} />
            </div>

            <div>
              <span className="center-label">ACTIVE CENTER</span>
              <h2>Abled Mind Therapy Center</h2>
              <p>Connected to the MOBI platform</p>
            </div>
          </div>

          <div className="active-status">
            <span className="active-dot" />
            Active
          </div>
        </section>

        {/* STATS */}
        <section className="stats-grid">
          <StatCard
            icon={<Users size={21} />}
            label="Active Parents"
            value={stats.activeParents}
            description="Registered parent accounts"
            tone="purple"
          />

          <StatCard
            icon={<Stethoscope size={21} />}
            label="Active Doctors"
            value={stats.activeDoctors}
            description="Assigned medical professionals"
            tone="green"
          />

          <StatCard
            icon={<UserRoundCheck size={21} />}
            label="Active Therapists"
            value={stats.activeTherapists}
            description="Currently active therapists"
            tone="orange"
          />
        </section>

        {/* ACTIVITIES */}
        <section className="activity-panel">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">ACTIVITY INSIGHTS</span>
              <h2>Most Used Activities</h2>
              <p>
                Activities with the highest learner usage from Abled Mind
                Therapy Center.
              </p>
            </div>

            <button
              className="report-button"
              onClick={() => setShowReport(true)}
            >
              <BarChart3 size={17} />
              <span>View report</span>
            </button>
          </div>

          <div className="activity-table-header">
            <span>Rank</span>
            <span>Activity</span>
            <span>Usage</span>
            <span>Published</span>
            <span />
          </div>

          <div className="activity-list">
            {mostUsedActivities.map((activity) => (
              <button
                key={activity.id}
                className="activity-row"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="rank-number">
                  {String(activity.rank).padStart(2, "0")}
                </div>

                <div className="activity-info">
                  <h3>{activity.title}</h3>
                  <p>{activity.centerName}</p>
                </div>

                <div className="rank-badge">
                  Top {activity.rank}
                </div>

                <div className="posted-time">
                  {activity.postedAgo}
                </div>

                <span className="row-arrow">
                  <ChevronRight size={19} />
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>

      {/* ACTIVITY DETAILS MODAL */}
      {selectedActivity && (
        <Modal
          title="Activity Details"
          onClose={() => setSelectedActivity(null)}
        >
          <div className="modal-activity-heading">
            <div className="modal-rank">
              {String(selectedActivity.rank).padStart(2, "0")}
            </div>

            <div>
              <span>TOP {selectedActivity.rank} ACTIVITY</span>
              <h3>{selectedActivity.title}</h3>
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">Description</span>
            <p>{selectedActivity.description}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-box">
              <span className="detail-label">Published by</span>
              <strong>{selectedActivity.author}</strong>
            </div>

            <div className="detail-box">
              <span className="detail-label">Date published</span>
              <strong>{selectedActivity.datePublished}</strong>
            </div>
          </div>
        </Modal>
      )}

      {/* REPORT MODAL */}
      {showReport && (
        <Modal
          title="Activity Usage Report"
          onClose={() => setShowReport(false)}
        >
          <div className="report-intro">
            <div className="report-icon">
              <BarChart3 size={21} />
            </div>

            <div>
              <h3>Top Performing Activities</h3>
              <p>
                Based on learner usage from Abled Mind Therapy Center.
              </p>
            </div>
          </div>

          <div className="report-list">
            {mostUsedActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="report-item">
                <div className="report-rank">
                  {activity.rank}
                </div>

                <div className="report-details">
                  <strong>{activity.title}</strong>
                  <span>{activity.centerName}</span>
                </div>

                <div className="report-position">
                  Top {activity.rank}
                </div>
              </div>
            ))}
          </div>

          <div className="report-note">
            <CheckCircle2 size={17} />

            <p>
              Activity usage analytics can later be connected directly to
              backend data.
            </p>
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
          --border-soft: #eeeeF2;

          --success: #4f9467;
          --success-light: #edf7f0;

          --orange: #bd7a38;
          --orange-light: #fff5eb;
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
           MAIN DASHBOARD
        ============================== */

        .dashboard-content {
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
           CENTER STATUS
        ============================== */

        .center-card {
          min-height: 96px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 21px 24px;
          margin-bottom: 18px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--card-bg);
        }

        .center-card-left {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
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

        .center-label {
          display: block;
          margin-bottom: 3px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .center-card h2 {
          margin: 0;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 650;
          color: var(--text-primary);
        }

        .center-card p {
          margin: 4px 0 0;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .active-status {
          flex-shrink: 0;
          min-height: 30px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 12px;
          border-radius: 999px;
          background: var(--success-light);
          color: var(--success);
          font-size: 11px;
          font-weight: 650;
        }

        .active-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--success);
        }

        /* ==============================
           STATS
        ============================== */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 25px;
        }

        .stat-card {
          min-height: 136px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--card-bg);
          transition:
            border-color 0.16s ease,
            transform 0.16s ease;
        }

        .stat-card:hover {
          transform: translateY(-1px);
          border-color: #dedce4;
        }

        .stat-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .stat-card.purple .stat-icon {
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .stat-card.green .stat-icon {
          background: var(--success-light);
          color: var(--success);
        }

        .stat-card.orange .stat-icon {
          background: var(--orange-light);
          color: var(--orange);
        }

        .stat-label {
          font-size: 12px;
          font-weight: 550;
          color: var(--text-secondary);
        }

        .stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-top: 14px;
        }

        .stat-value {
          display: block;
          font-size: 28px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .stat-description {
          max-width: 140px;
          margin: 0;
          text-align: right;
          font-size: 10px;
          line-height: 1.45;
          color: var(--text-muted);
        }

        /* ==============================
           ACTIVITY PANEL
        ============================== */

        .activity-panel {
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
          margin: 6px 0 0;
          max-width: 600px;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .report-button {
          min-height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid #ded8e8;
          border-radius: 9px;
          background: #ffffff;
          color: var(--mobi-purple);
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
          transition:
            background 0.16s ease,
            border-color 0.16s ease;
        }

        .report-button:hover {
          background: var(--mobi-purple-light);
          border-color: #cfc4df;
        }

        .activity-table-header {
          display: grid;
          grid-template-columns:
            65px
            minmax(260px, 1fr)
            100px
            100px
            34px;
          align-items: center;
          gap: 15px;
          padding: 11px 20px;
          border-bottom: 1px solid var(--border-soft);
          background: #fafafd;
          color: var(--text-muted);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .activity-list {
          width: 100%;
        }

        .activity-row {
          width: 100%;
          min-height: 74px;
          display: grid;
          grid-template-columns:
            65px
            minmax(260px, 1fr)
            100px
            100px
            34px;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          border: none;
          border-bottom: 1px solid var(--border-soft);
          background: #ffffff;
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: background 0.14s ease;
        }

        .activity-row:last-child {
          border-bottom: none;
        }

        .activity-row:hover {
          background: #faf9fc;
        }

        .rank-number {
          font-size: 12px;
          font-weight: 650;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }

        .activity-info {
          min-width: 0;
        }

        .activity-info h3 {
          overflow: hidden;
          margin: 0;
          color: var(--text-primary);
          font-size: 12px;
          line-height: 1.45;
          font-weight: 620;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-info p {
          overflow: hidden;
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rank-badge {
          justify-self: start;
          padding: 5px 8px;
          border-radius: 6px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-size: 9px;
          font-weight: 650;
        }

        .posted-time {
          color: var(--text-secondary);
          font-size: 10px;
          white-space: nowrap;
        }

        .row-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b0afb8;
          transition:
            color 0.15s ease,
            transform 0.15s ease;
        }

        .activity-row:hover .row-arrow {
          color: var(--mobi-purple);
          transform: translateX(2px);
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

        .modal-activity-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-soft);
        }

        .modal-rank {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-size: 13px;
          font-weight: 700;
        }

        .modal-activity-heading span {
          display: block;
          margin-bottom: 4px;
          color: var(--mobi-purple);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .modal-activity-heading h3 {
          margin: 0;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 650;
          color: var(--text-primary);
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-label {
          display: block;
          margin-bottom: 7px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .detail-section p {
          margin: 0;
          font-size: 12px;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
        }

        .detail-box {
          padding: 14px;
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          background: #fafafd;
        }

        .detail-box strong {
          display: block;
          font-size: 11px;
          line-height: 1.5;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* ==============================
           REPORT MODAL
        ============================== */

        .report-intro {
          display: flex;
          align-items: center;
          gap: 13px;
          padding-bottom: 18px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-soft);
        }

        .report-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .report-intro h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .report-intro p {
          margin: 4px 0 0;
          font-size: 10px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .report-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .report-item {
          min-height: 61px;
          display: grid;
          grid-template-columns: 34px 1fr auto;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border: 1px solid var(--border-soft);
          border-radius: 10px;
        }

        .report-rank {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
          font-size: 10px;
          font-weight: 700;
        }

        .report-details {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .report-details strong {
          overflow: hidden;
          color: var(--text-primary);
          font-size: 10px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .report-details span {
          overflow: hidden;
          margin-top: 4px;
          color: var(--text-muted);
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .report-position {
          padding: 5px 8px;
          border-radius: 6px;
          background: #f6f5f8;
          color: var(--text-secondary);
          font-size: 9px;
          font-weight: 650;
        }

        .report-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 17px;
          padding: 12px 13px;
          border-radius: 9px;
          background: var(--success-light);
          color: var(--success);
        }

        .report-note svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .report-note p {
          margin: 0;
          font-size: 10px;
          line-height: 1.55;
          color: #52755e;
        }

        /* ==============================
           RESPONSIVE
        ============================== */

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 205px minmax(0, 1fr);
          }

          .dashboard-content {
            padding: 30px 25px 45px;
          }

          .activity-table-header,
          .activity-row {
            grid-template-columns:
              50px
              minmax(180px, 1fr)
              80px
              80px
              25px;
            gap: 10px;
          }

          .stat-description {
            display: none;
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

          .dashboard-content {
            padding: 26px 18px 40px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            min-height: 105px;
          }

          .activity-table-header {
            display: none;
          }

          .activity-row {
            grid-template-columns: 40px minmax(0, 1fr) auto 26px;
          }

          .posted-time {
            display: none;
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

          .dashboard-content {
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

          .center-card {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .active-status {
            margin-left: 61px;
          }

          .panel-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
            padding: 19px 17px;
          }

          .report-button {
            width: 100%;
          }

          .activity-row {
            grid-template-columns: 31px minmax(0, 1fr) auto 20px;
            padding: 12px 13px;
          }

          .rank-badge {
            display: none;
          }

          .activity-row {
            grid-template-columns: 31px minmax(0, 1fr) 20px;
          }

          .activity-info h3 {
            white-space: normal;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          .row-arrow {
            grid-column: 3;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-backdrop {
            padding: 12px;
          }

          .modal-body {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  tone: "purple" | "green" | "orange";
};

function StatCard({
  icon,
  label,
  value,
  description,
  tone,
}: StatCardProps) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>

        <span className="stat-label">{label}</span>
      </div>

      <div className="stat-bottom">
        <strong className="stat-value">{value}</strong>

        <p className="stat-description">{description}</p>
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