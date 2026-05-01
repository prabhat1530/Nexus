import { useState } from 'react';
import { toggleFollow } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function FollowButton({ userId, initialFollowing, onToggle }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();

  if (userId === user?.id) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await toggleFollow(userId);
      setIsFollowing(data.isFollowing);
      onToggle?.(data.isFollowing);
      if (data.isFollowing && socket) {
        socket.emit('sendNotification', { recipientId: userId, notification: { type: 'follow', sender: user } });
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
        isFollowing
          ? 'bg-dark-200 border border-white/10 text-gray-300 hover:border-accent-rose/50 hover:text-accent-rose hover:bg-accent-rose/10'
          : 'gradient-bg text-white hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02]'
      } active:scale-[0.98] disabled:opacity-50`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
