import { Link } from 'react-router-dom';
import { HiHeart, HiChat, HiUserAdd } from 'react-icons/hi';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/formatDate';

const icons = {
  like: { icon: HiHeart, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
  comment: { icon: HiChat, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  follow: { icon: HiUserAdd, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
};

const messages = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

export default function NotificationItem({ notification, onRead }) {
  const { icon: Icon, color, bg } = icons[notification.type] || icons.like;

  return (
    <div onClick={() => onRead?.(notification.id)}
      className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
        notification.read ? 'opacity-60 hover:opacity-80' : 'hover:bg-dark-200/50'
      }`}
    >
      <div className="relative">
        <Avatar src={notification.sender?.avatar} name={notification.sender?.fullName} size="md" />
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${bg} flex items-center justify-center`}>
          <Icon className={`w-3 h-3 ${color}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">
          <Link to={`/profile/${notification.sender?.id}`} className="font-semibold text-white hover:text-primary-400 transition-colors">
            {notification.sender?.fullName}
          </Link>{' '}
          {messages[notification.type]}
        </p>
        {notification.post?.content && (
          <p className="text-xs text-gray-500 mt-1 truncate">"{notification.post.content.slice(0, 80)}"</p>
        )}
        <p className="text-xs text-gray-600 mt-1">{formatDate(notification.createdAt)}</p>
      </div>
      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />}
    </div>
  );
}
