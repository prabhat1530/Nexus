export const formatDate = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
