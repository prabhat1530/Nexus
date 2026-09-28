import { useState, useEffect, useRef, useCallback } from 'react';
import { HiPaperAirplane, HiArrowLeft, HiVideoCamera, HiPhone } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import { getMessages, sendMessage as sendMessageApi, markMessagesRead } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Spinner from '../common/Spinner';
import VideoCall from './VideoCall';

export default function ChatWindow({ conversation, onBack }) {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();

  const otherUser = conversation?.participants?.find((p) => p.id !== user?.id);
  const conversationId = conversation?.id;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data } = await getMessages(conversationId);
      setMessages(data.messages);
      setLoadError(false);
      scrollToBottom();
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('call') === 'true' && otherUser && !activeCall) {
      setActiveCall({ otherUser, isIncoming: false });
    }
  }, [location.search, otherUser, activeCall]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markMessagesRead(conversationId).catch(() => {});
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (socket && conversationId) {
      const handleMessage = (message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
          markMessagesRead(conversationId).catch(() => {});
          scrollToBottom();
        }
      };
      const handleTyping = (data) => {
        if (data.conversationId === conversationId) { setIsTyping(true); setTypingUser(data.user); }
      };
      const handleStopTyping = (data) => {
        if (data.conversationId === conversationId) setIsTyping(false);
      };

      socket.on('receiveMessage', handleMessage);
      socket.on('typing', handleTyping);
      socket.on('stopTyping', handleStopTyping);

      return () => { 
        socket.off('receiveMessage', handleMessage); 
        socket.off('typing', handleTyping); 
        socket.off('stopTyping', handleStopTyping);
      };
    }
  }, [socket, conversationId, scrollToBottom]);

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  const handleTyping = () => {
    if (socket && otherUser) {
      socket.emit('typing', { conversationId: conversation.id, recipientId: otherUser.id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { conversationId: conversation.id, recipientId: otherUser.id });
      }, 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await sendMessageApi(conversation.id, { text: text.trim() });
      setMessages((prev) => [...prev, data]);
      setText('');
      setSendError(false);
      scrollToBottom();
      if (socket && otherUser) {
        socket.emit('sendMessage', { recipientId: otherUser.id, message: data });
        socket.emit('stopTyping', { conversationId: conversation.id, recipientId: otherUser.id });
      }
    } catch { setSendError(true); }
    finally { setSending(false); }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 gradient-bg rounded-full flex items-center justify-center opacity-50">
            <HiPaperAirplane className="w-8 h-8 text-white rotate-90" />
          </div>
          <p className="text-gray-500 text-sm">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-white/5 bg-dark-300/80 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onBack && (
            <button aria-label="Back to conversations" onClick={onBack} className="lg:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <HiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Avatar src={otherUser?.avatar} name={otherUser?.fullName} size="md" isOnline={isOnline(otherUser?.id)} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{otherUser?.fullName}</p>
            <p className="text-xs text-gray-500">{isOnline(otherUser?.id) ? 'Online' : 'Offline'}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button onClick={() => setActiveCall({ otherUser, isIncoming: false, callType: 'voice' })} 
            aria-label="Voice call" className="flex h-11 w-11 items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all" title="Voice Call">
            <HiPhone className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveCall({ otherUser, isIncoming: false, callType: 'video' })} 
            aria-label="Video call" className="flex h-11 w-11 items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-full transition-all" title="Video Call">
            <HiVideoCamera className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {loading ? <Spinner /> : loadError ? (
          <div className="mx-auto max-w-sm py-10 text-center" role="alert">
            <p className="font-semibold text-white">Could not load messages</p>
            <p className="mt-2 text-sm text-gray-400">Check your connection and try again.</p>
            <button type="button" className="btn-secondary mt-5 min-h-11" onClick={loadMessages}>Try again</button>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && <TypingIndicator user={typingUser} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-white/5 bg-dark-300/80">
        {sendError && <p className="mb-2 text-sm text-accent-rose" role="alert">Message not sent. Your text is still here so you can try again.</p>}
        <div className="flex items-center gap-3">
          <input aria-label="Message" value={text} onChange={(e) => { setText(e.target.value); setSendError(false); handleTyping(); }} placeholder="Type a message..."
            className="min-w-0 flex-1 bg-dark-200 border border-white/5 rounded-full px-5 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500/30 transition-colors" />
          <button type="submit" disabled={!text.trim() || sending}
            aria-label="Send message" className="w-11 h-11 shrink-0 gradient-bg rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50">
            <HiPaperAirplane className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </form>

      {activeCall && (
        <VideoCall 
          otherUser={activeCall.otherUser} 
          isIncoming={activeCall.isIncoming} 
          initialSignal={activeCall.signal} 
          callType={activeCall.callType || 'video'}
          onEnd={() => setActiveCall(null)} 
        />
      )}
    </div>
  );
}
