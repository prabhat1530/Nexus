import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isMine = message.sender?.id === user?.id || message.senderId === user?.id;

  return (
    <div className={`flex gap-2 mb-3 ${isMine ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {!isMine && <Avatar src={message.sender?.avatar} name={message.sender?.fullName || message.sender?.username} size="sm" />}
      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
        {message.image && (
          <img src={message.image} alt="Shared" className="max-w-full rounded-xl mb-1 max-h-48 object-cover" />
        )}
        {message.text && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md'
              : 'bg-dark-200 text-gray-200 rounded-bl-md'
          }`}>
            {message.text}
          </div>
        )}
        <p className={`text-[10px] text-gray-600 mt-1 ${isMine ? 'text-right' : ''}`}>
          {formatMessageTime(message.createdAt)}
          {isMine && message.reads?.length > 1 && <span className="ml-1 text-accent-blue">✓✓</span>}
        </p>
      </div>
    </div>
  );
}
