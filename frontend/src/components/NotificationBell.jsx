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
        className="relative rounded-sm p-2 text-white/70 transition-colors hover:text-white"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-signal font-mono text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-sm border border-ink/10 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-ink/10 px-3 py-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-steel hover:text-ink"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-steel">No notifications yet</p>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleSelect(n)}
                className={`block w-full border-b border-ink/5 px-3 py-2 text-left text-sm last:border-0 hover:bg-paper ${
                  n.read ? 'text-steel' : 'text-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />}
                  <span className={n.read ? '' : 'font-medium'}>{n.message}</span>
                </div>
                <span className="font-mono text-xs text-steel/70">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
