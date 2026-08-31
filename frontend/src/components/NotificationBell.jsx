import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications';

// Section 2.8: in-app only — this polls while the tab is open, no push/SMS/email.
const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    listNotifications()
      .then(({ notifications: list, unreadCount: count }) => {
        setNotifications(list);
        setUnreadCount(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = async (notification) => {
    setOpen(false);
    if (!notification.read) {
      markNotificationRead(notification._id)
        .then(load)
        .catch(() => {});
    }
    if (notification.faultReport) navigate(`/reports/${notification.faultReport}`);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllNotificationsRead()
      .then(load)
      .catch(() => {});
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">No notifications yet</p>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleSelect(n)}
                className={`block w-full border-b border-slate-50 px-3 py-2 text-left text-sm last:border-0 hover:bg-slate-50 ${
                  n.read ? 'text-slate-500' : 'text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                  <span className={n.read ? '' : 'font-medium'}>{n.message}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
