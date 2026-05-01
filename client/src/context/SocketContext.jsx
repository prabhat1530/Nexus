import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      const socketUrl = import.meta.env.VITE_API_URL || '';
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('🟢 Socket connected');
      });

      newSocket.on('activeUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('userOnline', ({ userId }) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      });

      newSocket.on('userOffline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
