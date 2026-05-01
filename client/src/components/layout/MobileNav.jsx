import { NavLink } from 'react-router-dom';
import { HiHome, HiGlobe, HiPlusCircle, HiChat, HiBell } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';

const items = [
  { path: '/', icon: HiHome },
  { path: '/explore', icon: HiGlobe },
  { path: '/create', icon: HiPlusCircle, special: true },
  { path: '/chat', icon: HiChat },
  { path: '/notifications', icon: HiBell, badge: true },
];

export default function MobileNav() {
  const { unreadCount } = useNotifications();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-dark-300/90 backdrop-blur-xl safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map(({ path, icon: Icon, special, badge }) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) =>
            `relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
              special ? 'gradient-bg shadow-lg shadow-primary-500/25 -mt-4 w-14 h-14 rounded-2xl' :
              isActive ? 'text-primary-400 bg-primary-500/10' : 'text-gray-500 hover:text-gray-300'
            }`
          }>
            <Icon className={`${special ? 'w-7 h-7 text-white' : 'w-6 h-6'}`} />
            {badge && unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
