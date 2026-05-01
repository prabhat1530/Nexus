import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getConversations, createOrGetConversation } from '../services/chatService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import Spinner from '../components/common/Spinner';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      startConversation(userId);
    }
  }, [searchParams]);

  const loadConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
    } catch {}
    setLoading(false);
  };

  const startConversation = async (userId) => {
    try {
      const { data } = await createOrGetConversation(userId);
      setActiveConv(data);
      // Add to list if not present
      setConversations((prev) => {
        if (prev.find((c) => c.id === data.id)) return prev;
        return [data, ...prev];
      });
    } catch {}
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="glass-card overflow-hidden -mx-4 lg:mx-0" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="flex h-full">
        {/* Sidebar - always visible on desktop, hidden when chat is active on mobile */}
        <div className={`${activeConv ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col border-r border-white/5`}>
          <ChatSidebar conversations={conversations} activeId={activeConv?.id} onSelect={setActiveConv} />
        </div>
        {/* Chat Window */}
        <div className={`${activeConv ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
          <ChatWindow conversation={activeConv} onBack={() => setActiveConv(null)} />
        </div>
      </div>
    </div>
  );
}
