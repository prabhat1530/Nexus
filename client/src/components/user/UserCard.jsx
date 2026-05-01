import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import FollowButton from './FollowButton';
import { useSocket } from '../../context/SocketContext';

export default function UserCard({ user, showFollow = true }) {
  const { isOnline } = useSocket();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-200/50 transition-colors">
      <Link to={`/profile/${user.id}`}>
        <Avatar src={user.avatar} name={user.fullName} size="md" isOnline={isOnline(user.id)} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="text-sm font-semibold text-white hover:text-primary-400 transition-colors truncate block">
          {user.fullName}
        </Link>
        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        {user.bio && <p className="text-xs text-gray-400 mt-0.5 truncate">{user.bio}</p>}
      </div>
      {showFollow && <FollowButton userId={user.id} initialFollowing={false} />}
    </div>
  );
}
