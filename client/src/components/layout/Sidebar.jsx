import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiChat, HiGlobe, HiBell, HiUser, HiCog, HiLogout, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import { useSocket } from '../../context/SocketContext';

const navItems = [
  { path: '/', icon: HiHome, label: 'Home' },
  { path: '/explore', icon: HiGlobe, label: 'Explore' },
  { path: '/chat', icon: HiChat, label: 'Messages' },
  { path: '/notifications', icon: HiBell, label: 'Notifications', badge: true },
  { path: '/settings', icon: HiCog, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isOnline } = useSocket();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-white/5 bg-dark-300/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
            <HiSparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Nexus</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label, badge }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
          >
            <NavLink to={path} end={path === '/'} className={({ isActive }) => `group ${isActive ? 'nav-link-active' : 'nav-link'}`}>
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-3 w-full">
                  <span className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-400' : ''}`} />
                    {badge && unreadCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</motion.span>}
                  </span>
                  <span className="font-medium">{label}</span>
                </motion.div>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-white/5">
          <NavLink to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-200/80 transition-colors">
            <Avatar src={user.avatar} name={user.fullName} size="md" isOnline={isOnline(user.id)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </NavLink>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={logout} 
            className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-accent-rose hover:bg-accent-rose/10 rounded-xl transition-all duration-200"
          >
            <HiLogout className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      )}
    </aside>
  );
}
