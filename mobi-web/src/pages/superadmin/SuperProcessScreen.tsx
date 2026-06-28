import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardCheck,
  Edit3,
  Home,
  LogOut,
  Menu,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import mobiLogo from "../../assets/mobiLogo.png";

type ViewMode = "menu" | "notifications";
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

export default function SuperProcessScreen() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [receiverType, setReceiverType] = useState<ReceiverType>("Parents");
  const [dateFilter, setDateFilter] = useState<DateFilter>("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [editingNotification, setEditingNotification] =
    useState<NotificationItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(null);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesReceiver =
        receiverType === "All" || notification.receiver === receiverType;

      const matchesSearch = `${notification.receiver} ${notification.message} ${notification.dateLabel}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesReceiver && matchesSearch;
    });
  }, [notifications, receiverType, searchQuery]);

  const handleBack = () => {
    setSearchQuery("");
    setMessage("");
    setEditingNotification(null);

    if (viewMode === "menu") {
      navigate("/superadmin/SuperDashboardScreen");
      return;
    }

    setViewMode("menu");
  };

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

    setNotifications((prev) => [newNotification, ...prev]);
    setMessage("");

    // BACKEND LATER:
    // await api.post("/super-admin/system-notifications", newNotification);
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
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

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === editingNotification.id
          ? editingNotification
          : notification
      )
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

          <button
            className="nav-item"
            onClick={() => navigate("/superadmin/SuperManageScreen")}
          >
            <Building2 size={20} />
            <span>Manage</span>
          </button>

          <button className="nav-item active" onClick={() => setViewMode("menu")}>
            <ClipboardCheck size={20} />
            <span>Process</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/")}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </nav>
      </aside>

      <section className="process-card">
        {viewMode !== "menu" && (
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
          </button>
        )}

        {viewMode === "menu" && (
          <div className="menu-options">
            <button
              className="process-option"
              onClick={() => setViewMode("notifications")}
            >
              <div>
                <h2>PROCESS SYSTEM NOTIFICATION</h2>
                <p>Send system notifications to specific users or general users.</p>
              </div>
              <ArrowRight size={28} />
            </button>
          </div>
        )}

        {viewMode === "notifications" && (
          <div className="notification-panel">
            <div className="notification-header">
              <div>
                <h1>Process System Notifications</h1>
                <p>Who is/are the receiver?</p>
              </div>

              <div className="search-box">
                <Search size={14} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search"
                />
              </div>
            </div>

            <div className="toolbar">
              <div className="receiver-tabs">
                {(["Center", "Parents", "Doctor", "Therapist", "All"] as ReceiverType[]).map(
                  (receiver) => (
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
                  )
                )}
              </div>

              <div className="date-tabs">
                {(["Today", "This Week", "This Month"] as DateFilter[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      className={
                        dateFilter === filter ? "date-tab active" : "date-tab"
                      }
                      onClick={() => setDateFilter(filter)}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="notification-list">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <article key={notification.id} className="notification-row">
                    <div>
                      <div className="notification-title">
                        <strong>{notification.receiver.slice(0, -1) || notification.receiver}</strong>
                        <span>{notification.dateLabel}</span>
                      </div>

                      <p>{notification.message}</p>
                    </div>

                    <div className="row-actions">
                      <button onClick={() => setDeleteTarget(notification)}>
                        <Trash2 size={18} />
                      </button>

                      <button onClick={() => setEditingNotification(notification)}>
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <p>No notifications found.</p>
                </div>
              )}
            </div>

            <div className="compose-area">
              <label>Write notification here</label>

              <div className="compose-box">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type here..."
                />

                <button onClick={sendNotification}>
                  <span>SEND</span>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {editingNotification && (
        <Modal title="Edit Notification" onClose={() => setEditingNotification(null)}>
          <label className="modal-label">
            Receiver
            <select
              value={editingNotification.receiver}
              onChange={(event) =>
                setEditingNotification((prev) =>
                  prev
                    ? {
                        ...prev,
                        receiver: event.target.value as ReceiverType,
                      }
                    : prev
                )
              }
            >
              <option value="Center">Center</option>
              <option value="Parents">Parents</option>
              <option value="Doctor">Doctor</option>
              <option value="Therapist">Therapist</option>
              <option value="All">All</option>
            </select>
          </label>

          <label className="modal-label">
            Message
            <textarea
              value={editingNotification.message}
              onChange={(event) =>
                setEditingNotification((prev) =>
                  prev
                    ? {
                        ...prev,
                        message: event.target.value,
                      }
                    : prev
                )
              }
            />
          </label>

          <button className="save-btn" onClick={saveEditedNotification}>
            Save Changes
          </button>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Notification" onClose={() => setDeleteTarget(null)}>
            <p className="confirm-text">
            Are you sure you want to delete this notification?
            </p>

            <div className="confirm-preview">
            <strong>{deleteTarget.receiver}</strong>
            <p>{deleteTarget.message}</p>
            </div>

            <div className="confirm-actions">
            <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
            </button>

            <button
                className="delete-btn"
                onClick={() => deleteNotification(deleteTarget.id)}
            >
                Delete
            </button>
            </div>
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

        .process-card {
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
        }

        .process-option {
          width: 100%;
          min-height: 92px;
          border: none;
          border-radius: 26px 6px 26px 6px;
          background: rgba(255,255,255,0.96);
          padding: 22px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .process-option h2 {
          margin: 0 0 7px;
          font-size: 20px;
          font-weight: 900;
        }

        .process-option p {
          margin: 0;
          font-size: 15px;
          color: #333;
        }

        .notification-panel {
          width: min(980px, 100%);
          margin: 0 auto;
          background: rgba(255,255,255,0.96);
          border-radius: 10px;
          padding: 30px 34px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 14px;
        }

        .notification-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
        }

        .notification-header p {
          margin: 7px 0 0;
          font-size: 12px;
          color: #333;
        }

        .search-box {
          width: min(300px, 100%);
          height: 30px;
          background: #f1d9f1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 13px;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .receiver-tabs {
          background: #df6433;
          border-radius: 999px;
          padding: 3px;
          display: flex;
          flex-wrap: wrap;
          width: fit-content;
        }

        .receiver-tab {
          border: none;
          border-radius: 999px;
          background: transparent;
          color: white;
          padding: 7px 12px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .receiver-tab.active {
          background: rgba(255,255,255,0.24);
        }

        .date-tabs {
          background: #888;
          border-radius: 6px;
          padding: 2px;
          display: flex;
        }

        .date-tab {
          border: none;
          background: transparent;
          color: white;
          padding: 8px 10px;
          font-size: 11px;
          font-weight: 800;
          border-radius: 5px;
          cursor: pointer;
        }

        .date-tab.active {
          background: rgba(255,255,255,0.22);
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 34px;
        }

        .notification-row {
          min-height: 74px;
          border-radius: 12px;
          background: #ead9eb;
          padding: 15px 18px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          box-shadow: 0 4px 7px rgba(0,0,0,0.18);
        }

        .notification-title {
          display: flex;
          align-items: baseline;
          gap: 9px;
          margin-bottom: 6px;
        }

        .notification-title strong {
          font-size: 16px;
          font-weight: 900;
        }

        .notification-title span {
          font-size: 11px;
          color: #777;
        }

        .notification-row p {
          margin: 0;
          font-size: 12px;
          max-width: 620px;
          line-height: 1.35;
        }

        .row-actions {
          display: flex;
          gap: 7px;
        }

        .row-actions button {
          border: none;
          background: transparent;
          color: #5f535f;
          cursor: pointer;
        }

        .confirm-text {
            margin: 0 0 14px;
            font-size: 14px;
            color: #333;
        }

        .confirm-preview {
            background: #f8f3f9;
            border: 1px solid #ead4ee;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 18px;
        }

        .confirm-preview strong {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .confirm-preview p {
            margin: 0;
            font-size: 13px;
            line-height: 1.45;
            color: #555;
        }

        .confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .cancel-btn,
        .delete-btn {
            border: none;
            border-radius: 999px;
            padding: 10px 16px;
            font-weight: 900;
            cursor: pointer;
        }

        .cancel-btn {
            background: #f5eef7;
            color: #6f2f9d;
        }

        .delete-btn {
            background: #fff0f0;
            color: #b73232;
        }

        .empty-state {
          background: #ead9eb;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          color: #666;
        }

        .compose-area label {
          display: block;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .compose-box {
          min-height: 58px;
          background: #a99fc5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }

        .compose-box input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 13px;
        }

        .compose-box input::placeholder {
          color: rgba(255,255,255,0.8);
        }

        .compose-box button {
          border: none;
          background: transparent;
          color: white;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
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
          width: min(520px, 100%);
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
          background: #f5eef7;
          border-radius: 999px;
          width: 34px;
          height: 34px;
          cursor: pointer;
        }

        .modal-label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 14px;
          font-size: 13px;
          font-weight: 900;
        }

        .modal-label select,
        .modal-label textarea {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 11px 12px;
          font-family: inherit;
          outline: none;
        }

        .modal-label textarea {
          min-height: 110px;
          resize: vertical;
        }

        .save-btn {
          width: 100%;
          border: none;
          border-radius: 999px;
          padding: 12px 16px;
          background: #8d5ac4;
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .super-page {
            grid-template-columns: 165px 1fr;
            gap: 16px;
          }

          .process-card {
            padding: 28px 24px;
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

          .process-card {
            min-height: calc(100vh - 20px);
            padding: 22px 12px;
            border-radius: 18px;
          }

          .process-option {
            padding: 18px;
            border-radius: 18px;
          }

          .process-option h2 {
            font-size: 15px;
          }

          .process-option p {
            font-size: 12px;
          }

          .notification-panel {
            padding: 20px 16px;
          }

          .notification-header {
            flex-direction: column;
          }

          .notification-header h1 {
            font-size: 20px;
          }

          .search-box {
            width: 100%;
          }

          .toolbar {
            align-items: flex-start;
          }

          .date-tabs,
          .receiver-tabs {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .receiver-tab,
          .date-tab {
            white-space: nowrap;
          }

          .notification-row {
            grid-template-columns: 1fr;
          }

          .row-actions {
            justify-content: flex-end;
          }

          .compose-box {
            align-items: stretch;
            flex-direction: column;
            padding: 12px;
          }

          .compose-box input {
            width: 100%;
            min-height: 36px;
          }

          .compose-box button {
            justify-content: flex-end;
          }
        }
      `}</style>
    </main>
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