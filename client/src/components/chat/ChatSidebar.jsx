import Avatar from '../common/Avatar';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

export default function ChatSidebar({ conversations, activeId, onSelect }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No conversations yet</div>
        ) : (
          conversations.map((conv) => {
            const otherUser = conv.participants?.find((p) => p.id !== user?.id);
            if (!otherUser) return null;
            return (
              <button key={conv.id} onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 p-4 transition-all duration-200 text-left ${
                  activeId === conv.id ? 'bg-primary-500/10 border-r-2 border-primary-500' : 'hover:bg-dark-200/50'
                }`}
              >
                <Avatar src={otherUser.avatar} name={otherUser.fullName} size="md" isOnline={isOnline(otherUser.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{otherUser.fullName}</p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-600">{formatDate(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {conv.lastMessage ? conv.lastMessage.text || '📷 Image' : 'Start a conversation'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full px-1.5">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
