import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import VideoCall from './VideoCall';

export default function GlobalCallHandler() {
  const [activeCall, setActiveCall] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user) {
      const handleIncomingCall = ({ from, callerName, signal, callerAvatar, callType }) => {
        // Only show if not already in a call
        if (!activeCall) {
          setActiveCall({
            otherUser: { id: from, fullName: callerName, avatar: callerAvatar },
            isIncoming: true,
            signal,
            callType: callType || 'video',
          });
        }
      };

      socket.on('incomingCall', handleIncomingCall);
      // DO NOT listen for 'callEnded' here — VideoCall handles its own cleanup
      // If we unmount VideoCall externally, doCleanup() won't run properly

      return () => {
        socket.off('incomingCall', handleIncomingCall);
      };
    }
  }, [socket, user, activeCall]);

  if (!activeCall) return null;

  return (
    <VideoCall 
      otherUser={activeCall.otherUser} 
      isIncoming={activeCall.isIncoming} 
      initialSignal={activeCall.signal} 
      callType={activeCall.callType || 'video'}
      onEnd={() => setActiveCall(null)} 
    />
  );
}
