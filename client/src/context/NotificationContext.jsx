import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getUnreadCount } from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return () => { socket.off('newNotification'); };
    }
  }, [socket]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {}
  };

  const resetUnread = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, notifications, setNotifications, resetUnread, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
