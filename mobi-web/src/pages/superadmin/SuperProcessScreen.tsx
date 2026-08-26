import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Home,
  LogOut,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import mobiLogo from "../../assets/mobiLogo.png";

type ReceiverType = "Center" | "Parents" | "Doctor" | "Therapist" | "All";
type DateFilter = "Today" | "This Week" | "This Month";

type NotificationItem = {
  id: number;
  receiver: ReceiverType;
  message: string;
  dateLabel: string;
  createdAt: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    receiver: "Parents",
    message:
      "Hello, parents! Catch up where you left. Continue learning or monitor child's progress today.",
    dateLabel: "Just now",
    createdAt: "2026-06-28",
  },
  {
    id: 2,
    receiver: "Parents",
    message:
      "Hello, parents! Catch up where you left. Continue learning or monitor child's progress today.",
    dateLabel: "Friday",
    createdAt: "2026-06-27",
  },
  {
    id: 3,
    receiver: "Parents",
    message:
      "Hello, parents! Catch up where you left. Continue learning or monitor child's progress today.",
    dateLabel: "Wednesday",
    createdAt: "2026-06-25",
  },
  {
    id: 4,
    receiver: "Parents",
    message:
      "Hello, parents! Catch up where you left. Continue learning or monitor child's progress today.",
    dateLabel: "Monday",
    createdAt: "2026-06-23",
  },
];

const receiverOptions: ReceiverType[] = [
  "Center",
  "Parents",
  "Doctor",
  "Therapist",
  "All",
];

const dateOptions: DateFilter[] = ["Today", "This Week", "This Month"];

export default function SuperProcessScreen() {
  const navigate = useNavigate();

  // Process now opens directly to the notification workspace.
  const [receiverType, setReceiverType] = useState<ReceiverType>("Parents");
  const [dateFilter, setDateFilter] = useState<DateFilter>("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [editingNotification, setEditingNotification] =
    useState<NotificationItem | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<NotificationItem | null>(null);

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesReceiver =
        receiverType === "All" || notification.receiver === receiverType;

      const matchesSearch =
        !normalizedQuery ||
        `${notification.receiver} ${notification.message} ${notification.dateLabel}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesReceiver && matchesSearch;
    });
  }, [notifications, receiverType, searchQuery]);

  const sendNotification = () => {
    if (!message.trim()) {
      alert("Please write a notification first.");
      return;
    }

    const newNotification: NotificationItem = {
      id: Date.now(),
      receiver: receiverType,
      message: message.trim(),
      dateLabel: "Just now",
      createdAt: new Date().toISOString(),
    };

    setNotifications((previousNotifications) => [
      newNotification,
      ...previousNotifications,
    ]);

    setMessage("");

    // BACKEND LATER:
    // await api.post("/super-admin/system-notifications", newNotification);
  };

  const deleteNotification = (id: number) => {
    setNotifications((previousNotifications) =>
      previousNotifications.filter(
        (notification) => notification.id !== id,
      ),
    );

    setDeleteTarget(null);

    // BACKEND LATER:
    // await api.delete(`/super-admin/system-notifications/${id}`);
  };

  const saveEditedNotification = () => {
    if (!editingNotification?.message.trim()) {
      alert("Notification message cannot be empty.");
      return;
    }

    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === editingNotification.id
          ? {
              ...editingNotification,
              message: editingNotification.message.trim(),
            }
          : notification,
      ),
    );

    setEditingNotification(null);

    // BACKEND LATER:
    // await api.patch(
    //   `/super-admin/system-notifications/${editingNotification.id}`,
    //   editingNotification
    // );
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

            <button
              className="nav-item"
              onClick={() => navigate("/superadmin/SuperManageScreen")}
            >
              <span className="nav-icon">
                <Building2 size={19} />
              </span>

              <span>Manage</span>
            </button>

            <button className="nav-item active">
              <span className="nav-active-line" />

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
      <section className="process-content">
        {/* PAGE HEADER */}
        <header className="page-header">
          <div>
            <span className="page-eyebrow">SUPER ADMIN</span>
            <h1>Process</h1>
            <p>
              Create, review, and manage system notifications sent across the
              MOBI platform.
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

        {/* NOTIFICATION PANEL */}
        <section className="notification-panel">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">SYSTEM COMMUNICATION</span>
              <h2>System Notifications</h2>
              <p>
                Send notifications to a specific user group and manage
                previously created messages.
              </p>
            </div>

            <div className="search-box">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notifications..."
                aria-label="Search notifications"
              />
            </div>
          </div>

          {/* RECEIVER + DATE FILTERS */}
          <div className="notification-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">Receiver</span>

              <div className="receiver-tabs">
                {receiverOptions.map((receiver) => (
                  <button
                    key={receiver}
                    className={
                      receiverType === receiver
                        ? "receiver-tab active"
                        : "receiver-tab"
                    }
                    onClick={() => setReceiverType(receiver)}
                  >
                    {receiver}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-group date-group">
              <span className="toolbar-label">Period</span>

              <div className="date-tabs">
                {dateOptions.map((filter) => (
                  <button
                    key={filter}
                    className={
                      dateFilter === filter
                        ? "date-tab active"
                        : "date-tab"
                    }
                    onClick={() => setDateFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COMPOSE */}
          <div className="compose-section">
            <div className="compose-heading">
              <div className="compose-icon">
                <Bell size={18} />
              </div>

              <div>
                <span className="compose-eyebrow">
                  NEW NOTIFICATION
                </span>
                <h3>Send to {receiverType}</h3>
              </div>
            </div>

            <div className="compose-box">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your notification here..."
                rows={3}
              />

              <div className="compose-footer">
                <span>
                  This message will be sent to{" "}
                  <strong>{receiverType}</strong>.
                </span>

                <button
                  className="send-button"
                  onClick={sendNotification}
                >
                  <span>Send notification</span>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="history-section">
            <div className="history-header">
              <div>
                <span className="history-eyebrow">
                  NOTIFICATION HISTORY
                </span>
                <h3>Recent Notifications</h3>
              </div>

              <div className="history-meta">
                <CalendarDays size={14} />
                <span>{dateFilter}</span>
              </div>
            </div>

            <div className="notification-table-header">
              <span>Receiver</span>
              <span>Message</span>
              <span>Published</span>
              <span>Actions</span>
            </div>

            <div className="notification-list">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <article
                    key={notification.id}
                    className="notification-row"
                  >
                    <div className="receiver-cell">
                      <div className="receiver-icon">
                        <Bell size={15} />
                      </div>

                      <div>
                        <strong>{notification.receiver}</strong>
                        <span>System notification</span>
                      </div>
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="date-cell">
                      <span>{notification.dateLabel}</span>
                    </div>

                    <div className="row-actions">
                      <button
                        className="action-button edit"
                        onClick={() =>
                          setEditingNotification(notification)
                        }
                        aria-label="Edit notification"
                        title="Edit"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        className="action-button delete"
                        onClick={() =>
                          setDeleteTarget(notification)
                        }
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <Search size={20} />
                  <strong>No notifications found</strong>
                  <span>
                    Try another receiver or search term.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      {/* EDIT MODAL */}
      {editingNotification && (
        <Modal
          title="Edit Notification"
          onClose={() => setEditingNotification(null)}
        >
          <div className="modal-intro">
            <div className="modal-intro-icon">
              <Edit3 size={18} />
            </div>

            <div>
              <span>NOTIFICATION</span>
              <h3>Update notification details</h3>
              <p>
                Change the receiver or message, then save your changes.
              </p>
            </div>
          </div>

          <div className="modal-form">
            <label className="modal-label">
              <span>Receiver</span>

              <select
                value={editingNotification.receiver}
                onChange={(event) =>
                  setEditingNotification((previousNotification) =>
                    previousNotification
                      ? {
                          ...previousNotification,
                          receiver:
                            event.target.value as ReceiverType,
                        }
                      : previousNotification,
                  )
                }
              >
                {receiverOptions.map((receiver) => (
                  <option key={receiver} value={receiver}>
                    {receiver}
                  </option>
                ))}
              </select>
            </label>

            <label className="modal-label">
              <span>Message</span>

              <textarea
                value={editingNotification.message}
                onChange={(event) =>
                  setEditingNotification((previousNotification) =>
                    previousNotification
                      ? {
                          ...previousNotification,
                          message: event.target.value,
                        }
                      : previousNotification,
                  )
                }
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              className="modal-secondary-button"
              onClick={() => setEditingNotification(null)}
            >
              Cancel
            </button>

            <button
              className="save-button"
              onClick={saveEditedNotification}
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <Modal
          title="Delete Notification"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="delete-intro">
            <div className="delete-icon">
              <Trash2 size={18} />
            </div>

            <div>
              <h3>Delete this notification?</h3>
              <p>
                This will remove the notification from the current list.
              </p>
            </div>
          </div>

          <div className="confirm-preview">
            <div className="preview-top">
              <span>{deleteTarget.receiver}</span>
              <small>{deleteTarget.dateLabel}</small>
            </div>

            <p>{deleteTarget.message}</p>
          </div>

          <div className="modal-actions">
            <button
              className="modal-secondary-button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>

            <button
              className="delete-confirm-button"
              onClick={() => deleteNotification(deleteTarget.id)}
            >
              Delete Notification
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

        .process-content {
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
           NOTIFICATION PANEL
        ============================== */

        .notification-panel {
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

        /* ==============================
           TOOLBAR
        ============================== */

        .notification-toolbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-soft);
          background: #fafafd;
        }

        .toolbar-group {
          min-width: 0;
        }

        .date-group {
          flex-shrink: 0;
        }

        .toolbar-label {
          display: block;
          margin-bottom: 7px;
          color: var(--text-muted);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .receiver-tabs,
        .date-tabs {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .receiver-tab,
        .date-tab {
          min-height: 32px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 620;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .receiver-tab {
          padding: 0 11px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
        }

        .receiver-tab:hover {
          background: #f1edf6;
          color: var(--mobi-purple);
        }

        .receiver-tab.active {
          border-color: #ded8e8;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .date-tabs {
          padding: 3px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #ffffff;
        }

        .date-tab {
          padding: 0 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
        }

        .date-tab:hover {
          color: var(--text-primary);
        }

        .date-tab.active {
          background: #f1f1f5;
          color: var(--text-primary);
        }

        /* ==============================
           COMPOSE
        ============================== */

        .compose-section {
          padding: 21px 22px;
          border-bottom: 1px solid var(--border-soft);
        }

        .compose-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 13px;
        }

        .compose-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .compose-eyebrow,
        .history-eyebrow {
          display: block;
          margin-bottom: 3px;
          color: var(--mobi-purple);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.09em;
        }

        .compose-heading h3,
        .history-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 650;
        }

        .compose-box {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: #fafafd;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .compose-box:focus-within {
          border-color: #cfc4df;
          background: #ffffff;
        }

        .compose-box textarea {
          width: 100%;
          min-height: 76px;
          display: block;
          padding: 13px 14px 10px;
          border: none;
          outline: none;
          resize: vertical;
          background: transparent;
          color: var(--text-primary);
          font-size: 11px;
          line-height: 1.55;
        }

        .compose-box textarea::placeholder {
          color: #aaa9b3;
        }

        .compose-footer {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 9px 8px 14px;
          border-top: 1px solid var(--border-soft);
          background: #ffffff;
        }

        .compose-footer > span {
          color: var(--text-muted);
          font-size: 9px;
        }

        .compose-footer strong {
          color: var(--text-secondary);
          font-weight: 650;
        }

        .send-button {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: none;
          border-radius: 8px;
          background: var(--mobi-purple);
          color: #ffffff;
          cursor: pointer;
          font-size: 9px;
          font-weight: 650;
          transition:
            background 0.15s ease,
            transform 0.15s ease;
        }

        .send-button:hover {
          background: var(--mobi-purple-dark);
        }

        .send-button:active {
          transform: translateY(1px);
        }

        /* ==============================
           HISTORY
        ============================== */

        .history-section {
          padding: 21px 22px 23px;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 13px;
        }

        .history-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 9px;
        }

        .notification-table-header {
          display: grid;
          grid-template-columns:
            150px
            minmax(280px, 1fr)
            90px
            72px;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-bottom: none;
          border-radius: 10px 10px 0 0;
          background: #fafafd;
          color: var(--text-muted);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .notification-list {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 0 0 10px 10px;
          background: #ffffff;
        }

        .notification-row {
          min-height: 68px;
          display: grid;
          grid-template-columns:
            150px
            minmax(280px, 1fr)
            90px
            72px;
          align-items: center;
          gap: 14px;
          padding: 11px 14px;
          border-bottom: 1px solid var(--border-soft);
          transition: background 0.14s ease;
        }

        .notification-row:last-child {
          border-bottom: none;
        }

        .notification-row:hover {
          background: #faf9fc;
        }

        .receiver-cell {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .receiver-icon {
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .receiver-cell > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .receiver-cell strong {
          overflow: hidden;
          color: var(--text-primary);
          font-size: 10px;
          font-weight: 620;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .receiver-cell span {
          margin-top: 3px;
          color: var(--text-muted);
          font-size: 8px;
        }

        .notification-message {
          display: -webkit-box;
          overflow: hidden;
          margin: 0;
          color: var(--text-secondary);
          font-size: 10px;
          line-height: 1.5;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .date-cell {
          color: var(--text-muted);
          font-size: 9px;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
        }

        .action-button {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 7px;
          background: #ffffff;
          cursor: pointer;
          transition:
            background 0.14s ease,
            border-color 0.14s ease,
            color 0.14s ease;
        }

        .action-button.edit {
          color: var(--mobi-purple);
        }

        .action-button.edit:hover {
          border-color: #d8cfe5;
          background: var(--mobi-purple-light);
        }

        .action-button.delete {
          color: var(--danger);
        }

        .action-button.delete:hover {
          border-color: #edcece;
          background: var(--danger-light);
        }

        .empty-state {
          min-height: 170px;
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

        .modal-intro,
        .delete-intro {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 17px;
          margin-bottom: 17px;
          border-bottom: 1px solid var(--border-soft);
        }

        .modal-intro-icon,
        .delete-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .modal-intro-icon {
          background: var(--mobi-purple-light);
          color: var(--mobi-purple);
        }

        .delete-icon {
          background: var(--danger-light);
          color: var(--danger);
        }

        .modal-intro span {
          display: block;
          margin-bottom: 3px;
          color: var(--mobi-purple);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.09em;
        }

        .modal-intro h3,
        .delete-intro h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 650;
        }

        .modal-intro p,
        .delete-intro p {
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 9px;
          line-height: 1.5;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .modal-label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .modal-label > span {
          color: var(--text-secondary);
          font-size: 9px;
          font-weight: 650;
        }

        .modal-label select,
        .modal-label textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 9px;
          outline: none;
          background: #fafafd;
          color: var(--text-primary);
          font-size: 10px;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .modal-label select {
          height: 39px;
          padding: 0 11px;
        }

        .modal-label textarea {
          min-height: 110px;
          padding: 11px;
          resize: vertical;
          line-height: 1.55;
        }

        .modal-label select:focus,
        .modal-label textarea:focus {
          border-color: #cfc4df;
          background: #ffffff;
        }

        .confirm-preview {
          padding: 13px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: #fafafd;
        }

        .preview-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .preview-top span {
          color: var(--mobi-purple);
          font-size: 9px;
          font-weight: 700;
        }

        .preview-top small {
          color: var(--text-muted);
          font-size: 8px;
        }

        .confirm-preview p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 10px;
          line-height: 1.55;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 17px;
          border-top: 1px solid var(--border-soft);
        }

        .modal-secondary-button,
        .save-button,
        .delete-confirm-button {
          min-height: 36px;
          padding: 0 13px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 650;
        }

        .modal-secondary-button {
          border: 1px solid var(--border);
          background: #ffffff;
          color: var(--text-secondary);
        }

        .modal-secondary-button:hover {
          background: #f7f7f9;
        }

        .save-button {
          border: 1px solid var(--mobi-purple);
          background: var(--mobi-purple);
          color: #ffffff;
        }

        .save-button:hover {
          background: var(--mobi-purple-dark);
        }

        .delete-confirm-button {
          border: 1px solid #edcece;
          background: var(--danger-light);
          color: var(--danger);
        }

        .delete-confirm-button:hover {
          border-color: #ddb8b8;
          background: #f7e7e7;
        }

        /* ==============================
           RESPONSIVE
        ============================== */

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 205px minmax(0, 1fr);
          }

          .process-content {
            padding: 30px 25px 45px;
          }

          .notification-table-header,
          .notification-row {
            grid-template-columns:
              125px
              minmax(200px, 1fr)
              78px
              68px;
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

          .process-content {
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

          .notification-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .date-group {
            width: 100%;
          }

          .receiver-tabs,
          .date-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .receiver-tab,
          .date-tab {
            flex-shrink: 0;
          }

          .notification-table-header {
            display: none;
          }

          .notification-row {
            grid-template-columns: 120px minmax(0, 1fr) auto;
          }

          .date-cell {
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

          .process-content {
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

          .notification-panel {
            border-radius: 12px;
          }

          .panel-header {
            padding: 19px 17px;
          }

          .notification-toolbar {
            padding: 14px 13px;
          }

          .receiver-tabs {
            gap: 3px;
          }

          .compose-section,
          .history-section {
            padding: 17px 13px;
          }

          .compose-footer {
            align-items: stretch;
            flex-direction: column;
            padding: 10px;
          }

          .send-button {
            width: 100%;
          }

          .history-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .notification-row {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px 12px;
            padding: 12px;
          }

          .receiver-cell {
            grid-column: 1;
          }

          .notification-message {
            grid-column: 1 / -1;
            grid-row: 2;
            -webkit-line-clamp: 3;
          }

          .row-actions {
            grid-column: 2;
            grid-row: 1;
          }

          .modal-backdrop {
            padding: 12px;
          }

          .modal-body {
            padding: 18px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-secondary-button,
          .save-button,
          .delete-confirm-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
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
