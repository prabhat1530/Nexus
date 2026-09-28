import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CreatePostPage from './pages/CreatePostPage';
import Spinner from './components/common/Spinner';
import GlobalCallHandler from './components/chat/GlobalCallHandler';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-300"><Spinner size="lg" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-300"><Spinner size="lg" /></div>;
  return !isAuthenticated ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create" element={<CreatePostPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
            <GlobalCallHandler />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1d2b40',
                  color: '#eaf2f5',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                },
                success: { iconTheme: { primary: '#20b397', secondary: '#0e192a' } },
                error: { iconTheme: { primary: '#ff758e', secondary: '#0e192a' } },
              }}
            />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
