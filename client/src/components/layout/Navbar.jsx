import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiSearch, HiBell, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import UserSearch from '../user/UserSearch';

export default function Navbar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-dark-400/80 shadow-[0_12px_30px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="brand-mark w-8 h-8 rounded-xl">
            <HiSparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-white">nexus<span className="text-accent-amber">.</span></span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-sm mx-4 lg:mx-0">
          <UserSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button aria-label="Search" onClick={() => setShowSearch(!showSearch)} className="md:hidden btn-ghost p-2">
            <HiSearch className="w-5 h-5" />
          </button>
          <Link to="/notifications" aria-label="Notifications" className="btn-ghost p-2 relative">
            <HiBell className="w-5 h-5" />
            {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
          {user && (
            <Link to={`/profile/${user.id}`}>
              <Avatar src={user.avatar} name={user.fullName} size="sm" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && (
        <div className="md:hidden p-4 border-t border-white/5 animate-slide-up">
          <UserSearch onSelect={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  );
}
