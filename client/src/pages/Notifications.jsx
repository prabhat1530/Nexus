import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAllRead, markOneRead } from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/notification/NotificationItem';
import Spinner from '../components/common/Spinner';
import { HiBell, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { resetUnread, fetchUnreadCount, notifications: realtimeNotifs } = useNotifications();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getNotifications(); setItems(data.notifications || []); setLoadError(false); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (realtimeNotifs.length > 0) {
      setItems((prev) => {
        const ids = new Set(prev.map(n => n.id));
        const newOnes = realtimeNotifs.filter(n => !ids.has(n.id));
        return [...newOnes, ...prev];
      });
    }
  }, [realtimeNotifs]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      resetUnread();
    } catch { toast.error('Could not mark notifications as read. Try again.'); }
  };

  const handleMarkRead = async (id) => {
    try {
      await markOneRead(id);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      fetchUnreadCount();
    } catch { toast.error('Could not mark this notification as read.'); }
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
        <button onClick={handleMarkAllRead} disabled={!items.some((item) => !item.read)} className="btn-secondary relative flex min-h-11 items-center gap-1.5 px-3 py-2 text-xs sm:text-sm disabled:cursor-not-allowed disabled:opacity-50">
          <HiCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="glass-card divide-y divide-white/5">
        {loading ? <Spinner /> : loadError && items.length === 0 ? (
          <div className="p-8 sm:p-12 text-center" role="alert"><h2 className="text-lg font-bold text-white">Notifications unavailable</h2><p className="mt-2 text-sm text-gray-400">Check your connection and try again.</p><button onClick={loadNotifications} className="btn-secondary mt-5 min-h-11">Try again</button></div>
        ) :
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
