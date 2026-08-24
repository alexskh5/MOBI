import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import {
  createSuperAdminNotification,
  deleteSuperAdminNotification,
  getSuperAdminNotifications,
  updateSuperAdminNotification,
} from "../../services/super_admin/superAdminApi";

type ViewMode = "menu" | "notifications";
type ReceiverType = "Center" | "Parents" | "Doctor" | "Therapist" | "All";
type DateFilter = "Today" | "This Week" | "This Month";

type ApiNotification = {
  id: string;
  receiver?: ReceiverType;
  receivers?: ReceiverType[];
  message: string;
  created_at: string;
  updated_at?: string;
};

type NotificationItem = {
  id: string;
  receivers: ReceiverType[];
  message: string;
  dateLabel: string;
  createdAt: string;
};

type Notice = {
  title: string;
  message: string;
};

function getDateLabel(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isWithinDateFilter(dateValue: string, filter: DateFilter) {
  const date = new Date(dateValue);
  const now = new Date();

  if (filter === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (filter === "This Week") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return date >= sevenDaysAgo && date <= now;
  }

  if (filter === "This Month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

function mapNotification(notification: ApiNotification): NotificationItem {
  return {
    id: notification.id,
    receivers:
      notification.receivers && notification.receivers.length > 0
        ? notification.receivers
        : notification.receiver
        ? [notification.receiver]
        : [],
    message: notification.message,
    dateLabel: getDateLabel(notification.created_at),
    createdAt: notification.created_at,
  };
}

function formatReceivers(receivers: ReceiverType[]) {
  if (receivers.includes("All")) return "All";
  if (receivers.length === 0) return "No receiver";
  return receivers.join(", ");
}

export default function SuperProcessScreen() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [receiverType, setReceiverType] = useState<ReceiverType>("Parents");
  const [selectedReceivers, setSelectedReceivers] = useState<ReceiverType[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingNotification, setEditingNotification] =
    useState<NotificationItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NotificationItem | null>(
    null
  );

  const [notice, setNotice] = useState<Notice | null>(null);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesReceiver =
        receiverType === "All" ||
        notification.receivers.includes("All") ||
        notification.receivers.includes(receiverType);

      const matchesDate = isWithinDateFilter(notification.createdAt, dateFilter);

      const matchesSearch =
        `${formatReceivers(notification.receivers)} ${notification.message} ${notification.dateLabel}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesReceiver && matchesDate && matchesSearch;
    });
  }, [notifications, receiverType, dateFilter, searchQuery]);

  async function loadNotifications() {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const result = await getSuperAdminNotifications();

      const mappedNotifications: NotificationItem[] = result.data.map(
        (notification: ApiNotification) => mapNotification(notification)
      );

      setNotifications(mappedNotifications);
    } catch (error: any) {
      setNotificationError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load system notifications."
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleBack = () => {
    setSearchQuery("");
    setMessage("");
    setSelectedReceivers([]);
    setEditingNotification(null);
    setDeleteTarget(null);
    setNotice(null);

    if (viewMode === "menu") {
      navigate("/superadmin/SuperDashboardScreen");
      return;
    }

    setViewMode("menu");
  };

  const showNotice = (title: string, noticeMessage: string) => {
    setNotice({
      title,
      message: noticeMessage,
    });
  };

  const sendNotification = async () => {
    if (selectedReceivers.length === 0) {
      showNotice("Receiver required", "Please select at least one receiver.");
      return;
    }

    if (!message.trim()) {
      showNotice("Message required", "Please write a notification first.");
      return;
    }

    try {
      setIsSending(true);

      const result = await createSuperAdminNotification({
        receivers: selectedReceivers,
        message: message.trim(),
      });

      const newNotification = mapNotification(result.data);

      setNotifications((prev) => [newNotification, ...prev]);
      setMessage("");
      setSelectedReceivers([]);
      showNotice("Notification sent", "Your system notification was sent successfully.");
    } catch (error: any) {
      showNotice(
        "Send failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send notification."
      );
    } finally {
      setIsSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setIsDeleting(true);

      await deleteSuperAdminNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );

      setDeleteTarget(null);
      showNotice("Notification deleted", "The notification was deleted successfully.");
    } catch (error: any) {
      showNotice(
        "Delete failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete notification."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const saveEditedNotification = async () => {
    if (!editingNotification) return;

    if (editingNotification.receivers.length === 0) {
      showNotice("Receiver required", "Please select at least one receiver.");
      return;
    }

    if (!editingNotification.message.trim()) {
      showNotice("Message required", "Notification message cannot be empty.");
      return;
    }

    try {
      setIsSavingEdit(true);

      const result = await updateSuperAdminNotification(editingNotification.id, {
        receivers: editingNotification.receivers,
        message: editingNotification.message.trim(),
      });

      const updatedNotification = mapNotification(result.data);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        )
      );

      setEditingNotification(null);
      showNotice("Notification updated", "Your changes were saved successfully.");
    } catch (error: any) {
      showNotice(
        "Update failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update notification."
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toggleReceiver = (receiver: ReceiverType) => {
    setSelectedReceivers((prev) => {
      if (receiver === "All") {
        return prev.includes("All") ? [] : ["All"];
      }

      const withoutAll = prev.filter((item) => item !== "All");

      if (withoutAll.includes(receiver)) {
        return withoutAll.filter((item) => item !== receiver);
      }

      return [...withoutAll, receiver];
    });
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
              {loadingNotifications && (
                <div className="empty-state">
                  <p>Loading notifications...</p>
                </div>
              )}

              {notificationError && (
                <div className="empty-state">
                  <p>{notificationError}</p>
                </div>
              )}

              {!loadingNotifications &&
              !notificationError &&
              filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <article key={notification.id} className="notification-row">
                    <div>
                      <div className="notification-title">
                        <strong>{formatReceivers(notification.receivers)}</strong>
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
              ) : null}

              {!loadingNotifications &&
                !notificationError &&
                filteredNotifications.length === 0 && (
                  <div className="empty-state">
                    <p>No notifications found.</p>
                  </div>
                )}
            </div>

            <div className="compose-area">
              <label>Write notification here</label>

              <div className="compose-box">
                <div className="compose-receiver-section">
                  <span className="compose-mini-title">Send to</span>

                  <div className="compose-checklist">
                    {(["Center", "Parents", "Doctor", "Therapist", "All"] as ReceiverType[]).map(
                      (receiver) => (
                        <label
                          key={receiver}
                          className={
                            selectedReceivers.includes(receiver)
                              ? "compose-check active"
                              : "compose-check"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedReceivers.includes(receiver)}
                            onChange={() => toggleReceiver(receiver)}
                          />
                          <span>{receiver}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="compose-message-row">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type here..."
                  />

                  <button onClick={sendNotification} disabled={isSending}>
                    <span>{isSending ? "SENDING..." : "SEND"}</span>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {editingNotification && (
        <Modal title="Edit Notification" onClose={() => setEditingNotification(null)}>
          <label className="modal-label">
            Receiver
            <div className="compose-receivers">
              {(["Center", "Parents", "Doctor", "Therapist", "All"] as ReceiverType[]).map(
                (receiver) => (
                  <button
                    key={receiver}
                    type="button"
                    className={
                      editingNotification.receivers.includes(receiver)
                        ? "compose-receiver active"
                        : "compose-receiver"
                    }
                    onClick={() =>
                      setEditingNotification((prev) => {
                        if (!prev) return prev;

                        if (receiver === "All") {
                          return {
                            ...prev,
                            receivers: prev.receivers.includes("All") ? [] : ["All"],
                          };
                        }

                        const withoutAll = prev.receivers.filter(
                          (item) => item !== "All"
                        );

                        if (withoutAll.includes(receiver)) {
                          return {
                            ...prev,
                            receivers: withoutAll.filter((item) => item !== receiver),
                          };
                        }

                        return {
                          ...prev,
                          receivers: [...withoutAll, receiver],
                        };
                      })
                    }
                  >
                    {receiver}
                  </button>
                )
              )}
            </div>
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

          <button
            className="save-btn"
            onClick={saveEditedNotification}
            disabled={isSavingEdit}
          >
            {isSavingEdit ? "Saving..." : "Save Changes"}
          </button>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Notification" onClose={() => setDeleteTarget(null)}>
          <p className="confirm-text">
            Are you sure you want to delete this notification?
          </p>

          <div className="confirm-preview">
            <strong>{formatReceivers(deleteTarget.receivers)}</strong>
            <p>{deleteTarget.message}</p>
          </div>

          <div className="confirm-actions">
            <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>

            <button
              className="delete-btn"
              onClick={() => deleteNotification(deleteTarget.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {notice && (
        <NoticeModal
          title={notice.title}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
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

        .row-actions button:disabled,
        .compose-message-row button:disabled,
        .save-btn:disabled,
        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .compose-area label {
          display: block;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .compose-box {
          min-height: 108px;
          background: #a99fc5;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          padding: 13px 16px;
          gap: 12px;
        }

        .compose-message-row input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 13px;
        }

        .compose-message-row input::placeholder {
          color: rgba(255,255,255,0.8);
        }

        .compose-message-row button {
          border: none;
          background: transparent;
          color: white;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .compose-receivers {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .compose-receiver {
          border: none;
          border-radius: 999px;
          background: #f5eef7;
          color: #6f2f9d;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .compose-receiver.active {
          background: #df6433;
          color: white;
        }


        .compose-receiver-section {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .compose-mini-title {
          color: white;
          font-size: 12px;
          font-weight: 900;
          padding-top: 6px;
          min-width: 48px;
        }

        .compose-checklist,
        .modal-checklist {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .compose-check {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          width: fit-content;
          margin: 0 !important;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          color: white;
          padding: 7px 10px;
          font-size: 11px !important;
          font-weight: 900;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .compose-check.active {
          background: #df6433;
          color: white;
          border-color: #df6433;
        }

        .compose-check input {
          accent-color: #df6433;
          margin: 0;
        }

        .compose-message-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .compose-message-row input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 13px;
        }

        .compose-message-row input::placeholder {
          color: rgba(255,255,255,0.8);
        }

        .compose-message-row button {
          border: none;
          background: transparent;
          color: white;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .modal-backdrop,
        .notice-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 50;
        }

        .notice-backdrop {
          z-index: 70;
        }

        .modal-card,
        .notice-card {
          width: min(520px, 100%);
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .notice-card {
          width: min(420px, 100%);
          border: 1px solid #ead4ee;
        }

        .modal-header,
        .notice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .modal-header h2,
        .notice-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .notice-message {
          margin: 0 0 20px;
          font-size: 14px;
          line-height: 1.5;
          color: #444;
        }

        .notice-ok-btn {
          width: 100%;
          border: none;
          border-radius: 999px;
          background: #df6433;
          color: white;
          padding: 12px 16px;
          font-weight: 900;
          cursor: pointer;
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

          .compose-message-row input {
            width: 100%;
            min-height: 36px;
          }

          .compose-message-row button {
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
  children: ReactNode;
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

function NoticeModal({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="notice-backdrop">
      <div className="notice-card">
        <div className="notice-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="notice-message">{message}</p>

        <button className="notice-ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
