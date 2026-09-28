import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getConversations, createOrGetConversation } from '../services/chatService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getConversations();
      setConversations(data);
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  const startConversation = useCallback(async (selectedUserId) => {
    try {
      const { data } = await createOrGetConversation(selectedUserId);
      setActiveConv(data);
      // Add to list if not present
      setConversations((prev) => {
        if (prev.find((c) => c.id === data.id)) return prev;
        return [data, ...prev];
      });
    } catch { toast.error('Could not start the conversation. Please try again.'); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { if (userId) startConversation(userId); }, [userId, startConversation]);

  if (loading) return <Spinner size="lg" />;
  if (loadError && conversations.length === 0) return (
    <div className="glass-card mx-auto max-w-lg px-6 py-12 text-center" role="alert">
      <h1 className="text-xl font-bold text-white">Messages are unavailable</h1>
      <p className="mt-2 text-sm text-gray-400">Check your connection and try loading your conversations again.</p>
      <button className="btn-primary mt-6 min-h-11" onClick={loadConversations}>Try again</button>
    </div>
  );

  return (
    <div className="glass-card overflow-hidden -mx-4 sm:mx-0" style={{ height: 'max(360px, calc(100dvh - 170px))' }}>
      <div className="flex h-full">
        {/* Sidebar - always visible on desktop, hidden when chat is active on mobile */}
        <div className={`${activeConv ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 min-w-0 flex-col border-r border-white/5`}>
          <ChatSidebar conversations={conversations} activeId={activeConv?.id} onSelect={setActiveConv} />
        </div>
        {/* Chat Window */}
        <div className={`${activeConv ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1 flex-col`}>
          <ChatWindow conversation={activeConv} onBack={() => setActiveConv(null)} />
        </div>
      </div>
    </div>
  );
}
