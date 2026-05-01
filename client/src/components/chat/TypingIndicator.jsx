export default function TypingIndicator({ user }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
      <span className="text-xs text-gray-500">{user?.fullName || 'Someone'} is typing</span>
      <div className="flex gap-1">
        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="typing-dot" style={{ animationDelay: '150ms' }} />
        <div className="typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
