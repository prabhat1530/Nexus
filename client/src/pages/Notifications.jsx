import { useState, useEffect } from 'react';
import { getNotifications, markAllRead, markOneRead } from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/notification/NotificationItem';
import Spinner from '../components/common/Spinner';
import { HiBell, HiCheck } from 'react-icons/hi';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resetUnread, fetchUnreadCount, notifications: realtimeNotifs } = useNotifications();

  useEffect(() => { loadNotifications(); }, []);

  useEffect(() => {
    if (realtimeNotifs.length > 0) {
      setItems((prev) => {
        const ids = new Set(prev.map(n => n.id));
        const newOnes = realtimeNotifs.filter(n => !ids.has(n.id));
        return [...newOnes, ...prev];
      });
    }
  }, [realtimeNotifs]);

  const loadNotifications = async () => {
    try { const { data } = await getNotifications(); setItems(data.notifications); } catch {}
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      resetUnread();
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await markOneRead(id);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      fetchUnreadCount();
    } catch {}
  };

  return (
    <div>
      <div className="hero-panel mb-6 flex items-center justify-between gap-3">
        <div className="hero-orbit -right-12 -top-16 h-44 w-44" />
        <div className="flex items-center gap-3">
          <div className="brand-mark h-10 w-10 shrink-0">
            <HiBell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
        <button onClick={handleMarkAllRead} className="btn-secondary relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm">
          <HiCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="glass-card divide-y divide-white/5">
        {loading ? <Spinner /> :
          items.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No notifications yet</div>
          ) : items.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} onRead={handleMarkRead} />
          ))
        }
      </div>
    </div>
  );
}
