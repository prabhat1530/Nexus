import { NavLink } from 'react-router-dom';
import { HiHome, HiGlobe, HiPlusCircle, HiChat, HiBell } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';

const items = [
  { path: '/', icon: HiHome, label: 'Home' },
  { path: '/explore', icon: HiGlobe, label: 'Explore' },
  { path: '/create', icon: HiPlusCircle, label: 'Create', special: true },
  { path: '/chat', icon: HiChat, label: 'Messages' },
  { path: '/notifications', icon: HiBell, label: 'Alerts', badge: true },
];

export default function MobileNav() {
  const { unreadCount } = useNotifications();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-dark-500/95 shadow-[0_-12px_36px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl safe-area-pb">
      <div className="flex items-center justify-around h-[68px]">
        {items.map(({ path, icon: Icon, label, special, badge }) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) =>
            `relative flex flex-col gap-0.5 items-center justify-center min-w-12 h-14 rounded-xl transition-all duration-200 ${
              special ? 'text-white' :
              isActive ? 'text-primary-200 bg-primary-500/10' : 'text-gray-500 hover:text-gray-300'
            }`
          }>
            <span className={special ? 'gradient-bg flex h-9 w-9 items-center justify-center rounded-xl -mt-2' : ''}><Icon className={`${special ? 'w-5 h-5' : 'w-5 h-5'}`} /></span>
            <span className="text-[10px] font-semibold">{label}</span>
            {badge && unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
