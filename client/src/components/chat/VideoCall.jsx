import { useState, useEffect, useRef } from 'react';
import { HiPhoneMissedCall, HiMicrophone, HiVideoCamera, HiPhone } from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { getIceServers } from '../../services/chatService';
import Avatar from '../common/Avatar';

export default function VideoCall({ otherUser, isIncoming, initialSignal, onEnd, callType = 'video' }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [streamReady, setStreamReady] = useState(false);

  const localVideoEl = useRef(null);
  const remoteVideoEl = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const cleanedUpRef = useRef(false);
  const iceBuffer = useRef([]);

  const isVoice = callType === 'voice';

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // =====================================================
  //  STOP ALL TRACKS — guaranteed to turn off camera LED
  // =====================================================
  const stopAllTracks = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].enabled = false;
        tracks[i].stop();
      }
      streamRef.current = null;
    }
  };

  // =====================================================
  //  FULL CLEANUP
  // =====================================================
  const doCleanup = () => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    // 1. Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 2. Stop camera/mic tracks
    stopAllTracks();

    // 3. Close peer connection
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      try { pcRef.current.close(); } catch (e) {}
      pcRef.current = null;
    }

    // 4. Clear video elements
    try {
      if (localVideoEl.current) localVideoEl.current.srcObject = null;
      if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null;
    } catch (e) {}

    // 5. Remove socket listeners
    if (socket) {
      socket.off('callAccepted');
      socket.off('iceCandidate');
      socket.off('callEnded');
    }

    iceBuffer.current = [];
  };

  // =====================================================
  //  GET CAMERA/MIC
  // =====================================================
  const getMedia = async () => {
    // Stop any existing stream first (prevents StrictMode double-grab)
    stopAllTracks();

    try {
      if (!navigator.mediaDevices?.getUserMedia) return null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: !isVoice,
      });

      // If cleanup already ran while we were waiting for permission, stop immediately
      if (cleanedUpRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return null;
      }

      streamRef.current = stream;
      setStreamReady(true);

      // Attach to video element
      if (localVideoEl.current) {
        localVideoEl.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.warn('⚠️ Camera/mic error:', err.message);
      return null;
    }
  };

  // =====================================================
  //  ATTACH LOCAL STREAM TO VIDEO ELEMENT
  //  (handles React re-render timing)
  // =====================================================
  useEffect(() => {
    if (streamReady && localVideoEl.current && streamRef.current) {
      localVideoEl.current.srcObject = streamRef.current;
    }
  }, [streamReady]);

  // =====================================================
  //  CREATE WEBRTC PEER CONNECTION
  // =====================================================
  const createPC = (localStream, customServers = null) => {
    const pc = new RTCPeerConnection({
      iceServers: customServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    pcRef.current = pc;

    // Add our tracks so the other person can see/hear us
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    // Receive remote tracks
    pc.ontrack = (event) => {
      const remoteStream = event.streams?.[0];
      if (remoteStream && remoteVideoEl.current) {
        remoteVideoEl.current.srcObject = remoteStream;
      }
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('iceCandidate', { to: otherUser.id, candidate: event.candidate });
      }
    };

    return pc;
  };

  // =====================================================
  //  FLUSH BUFFERED ICE CANDIDATES
  // =====================================================
  const flushIce = async (pc) => {
    const buffered = iceBuffer.current.splice(0);
    for (const c of buffered) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
    }
  };

  // =====================================================
  //  CALLER: initiate a call
  // =====================================================
  const startCall = async () => {
    let customServers = null;
    try {
      const { data } = await getIceServers();
      customServers = data;
    } catch (err) {
      console.warn('⚠️ Could not fetch TURN servers, using public STUN only.');
    }

    const stream = await getMedia();
    if (cleanedUpRef.current) return;

    const pc = createPC(stream, customServers);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('callUser', {
      recipientId: otherUser.id,
      signalData: offer,
      from: user.id,
      callerName: user.fullName,
      callType,
    });

    // When the other person accepts our call
    socket.on('callAccepted', async (signal) => {
      if (cleanedUpRef.current) return;
      setIsAccepted(true);
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      await flushIce(pc);
    });

    // Receive ICE candidates
    socket.on('iceCandidate', async (candidate) => {
      if (cleanedUpRef.current) return;
      if (pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      } else {
        iceBuffer.current.push(candidate);
      }
    });

    // Other person ended the call
    socket.on('callEnded', () => {
      doCleanup();
      onEnd();
    });
  };

  // =====================================================
  //  RECEIVER: accept an incoming call
  // =====================================================
  const answerCall = async () => {
    setIsAccepted(true);

    let customServers = null;
    try {
      const { data } = await getIceServers();
      customServers = data;
    } catch (err) {
      console.warn('⚠️ Could not fetch TURN servers, using public STUN only.');
    }

    // Get media if not already obtained
    let stream = streamRef.current;
    if (!stream) stream = await getMedia();
    if (cleanedUpRef.current) return;

    const pc = createPC(stream, customServers);

    // Set caller's offer
    await pc.setRemoteDescription(new RTCSessionDescription(initialSignal));
    await flushIce(pc);

    // Send our answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answerCall', { signal: answer, to: otherUser.id });

    // Receive ICE candidates
    socket.on('iceCandidate', async (candidate) => {
      if (cleanedUpRef.current) return;
      if (pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      } else {
        iceBuffer.current.push(candidate);
      }
    });

    // Caller ended
    socket.on('callEnded', () => {
      doCleanup();
      onEnd();
    });
  };

  // =====================================================
  //  END CALL
  // =====================================================
  const endCall = () => {
    // Immediately stop camera before any async work
    stopAllTracks();
    if (socket) socket.emit('endCall', { to: otherUser.id });
    doCleanup();
    onEnd();
  };

  // =====================================================
  //  TOGGLE MIC / VIDEO
  // =====================================================
  const toggleMic = () => {
    const s = streamRef.current;
    if (!s) return;
    const tracks = s.getAudioTracks();
    if (tracks.length > 0) {
      const newState = !tracks[0].enabled;
      tracks[0].enabled = newState;
      setIsMicOn(newState);
    }
  };

  const toggleVideo = () => {
    const s = streamRef.current;
    if (!s) return;
    const tracks = s.getVideoTracks();
    if (tracks.length > 0) {
      const newState = !tracks[0].enabled;
      tracks[0].enabled = newState;
      setIsVideoOn(newState);
    }
  };

  // =====================================================
  //  MOUNT / UNMOUNT
  //  Uses a delay to prevent React StrictMode from
  //  sending duplicate callUser events
  // =====================================================
  useEffect(() => {
    cleanedUpRef.current = false;

    const timeout = setTimeout(() => {
      if (cleanedUpRef.current) return; // StrictMode unmounted us
      if (!isIncoming) {
        startCall();
      } else {
        getMedia(); // pre-fetch while ringing
      }
    }, 150);

    // UNMOUNT: guaranteed cleanup
    return () => {
      clearTimeout(timeout);
      // Force stop tracks even if doCleanup already ran
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => { t.stop(); });
        streamRef.current = null;
      }
      doCleanup();
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isAccepted) {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAccepted]);

  // =====================================================
  //  RENDER
  // =====================================================
  return (
    <div className="fixed inset-0 z-[200] bg-dark-400/95 backdrop-blur-2xl flex flex-col">
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-5xl bg-dark-400 rounded-3xl overflow-hidden shadow-2xl border border-white/5">

          {/* REMOTE VIDEO — always in DOM so ref is never null */}
          <video
            ref={remoteVideoEl}
            autoPlay
            playsInline
            style={{ display: isAccepted && !isVoice ? 'block' : 'none' }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* AVATAR / STATUS OVERLAY */}
          <div
            style={{ display: isAccepted && !isVoice ? 'none' : 'flex' }}
            className="absolute inset-0 flex-col items-center justify-center space-y-6"
          >
            {isVoice && isAccepted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 rounded-full border-2 border-primary-500/20 animate-ping" />
              </div>
            )}

            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-blue flex items-center justify-center ring-4 ring-primary-500/20 overflow-hidden">
              {(otherUser.avatar || otherUser.callerAvatar) ? (
                <img src={otherUser.avatar || otherUser.callerAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {otherUser.fullName ? otherUser.fullName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{otherUser.fullName || 'Unknown'}</h2>
              {isAccepted ? (
                <p className="text-emerald-400 font-mono text-lg">{formatTime(callDuration)}</p>
              ) : (
                <p className="text-primary-400 animate-pulse text-lg">
                  {isIncoming ? 'Incoming Call...' : 'Calling...'}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">{isVoice ? '🎤 Voice Call' : '📹 Video Call'}</p>
            </div>

            {/* Hidden video for voice calls — still needs to play audio */}
            {isVoice && <video ref={remoteVideoEl} autoPlay playsInline style={{ display: 'none' }} />}
          </div>

          {/* LOCAL VIDEO PIP */}
          {!isVoice && (
            <div className="absolute top-6 right-6 w-32 sm:w-48 aspect-[3/4] bg-dark-300 rounded-2xl overflow-hidden shadow-xl border border-white/10 z-10">
              <video
                ref={localVideoEl}
                autoPlay
                muted
                playsInline
                style={{
                  display: streamReady && isVideoOn ? 'block' : 'none',
                  transform: 'scaleX(-1)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {(!streamReady || !isVideoOn) && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-300">
                  <Avatar src={user?.avatar} name={user?.fullName} size="lg" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="p-8 flex items-center justify-center gap-6">
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMicOn
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          }`}
          title={isMicOn ? 'Mute' : 'Unmute'}
        >
          <HiMicrophone className="w-6 h-6" />
        </button>

        {isIncoming && !isAccepted && (
          <button
            onClick={answerCall}
            className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 transition-transform animate-bounce"
          >
            <HiPhone className="w-8 h-8" />
          </button>
        )}

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 transition-transform"
        >
          <HiPhoneMissedCall className="w-8 h-8" />
        </button>

        {!isVoice && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOn
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            }`}
            title={isVideoOn ? 'Camera Off' : 'Camera On'}
          >
            <HiVideoCamera className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
