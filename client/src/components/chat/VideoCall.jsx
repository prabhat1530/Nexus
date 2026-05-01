import { useState, useEffect, useRef } from 'react';
import { HiPhoneMissedCall, HiMicrophone, HiVideoCamera, HiPhone } from 'react-icons/hi';
import toast from 'react-hot-toast';
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
  const ringtoneRef = useRef(null);

  const RINGING_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3';
  const INCOMING_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

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
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
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
  };  // =====================================================
  //  GET CAMERA/MIC
  // =====================================================
  const getMedia = async () => {
    stopAllTracks();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Your browser does not support video/audio calls.');
        return null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: !isVoice ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          } : false,
        });
      } catch (videoErr) {
        if (!isVoice) {
          console.warn('📹 Video permission denied or no camera found, falling back to audio only.');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setIsVideoOn(false);
          toast.error('Could not access camera, switching to voice only.');
        } else {
          throw videoErr;
        }
      }

      if (cleanedUpRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return null;
      }

      streamRef.current = stream;
      setStreamReady(true);
      if (localVideoEl.current) localVideoEl.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error('⚠️ Media access error:', err);
      toast.error('Could not access microphone or camera. Please check permissions.');
      endCall();
      return null;
    }
  };

  // =====================================================
  //  CREATE WEBRTC PEER CONNECTION
  // =====================================================
  const createPC = (localStream, customServers = null) => {
    const pc = new RTCPeerConnection({
      iceServers: customServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    });
    pcRef.current = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.ontrack = (event) => {
      const remoteStream = event.streams?.[0];
      if (remoteStream && remoteVideoEl.current) {
        remoteVideoEl.current.srcObject = remoteStream;
        // Ensure audio plays by calling play() explicitly
        remoteVideoEl.current.play().catch(e => console.warn('Autoplay prevented:', e));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('iceCandidate', { to: otherUser.id, candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected') {
        toast.error('Network unstable, trying to reconnect...', { id: 'rtc-status' });
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        toast.success('Connection stable', { id: 'rtc-status' });
      } else if (pc.iceConnectionState === 'failed') {
        toast.error('Connection failed. Please check your network.');
        endCall();
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
      try { 
        if (c && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(c)); 
        }
      } catch (e) {
        console.warn('ICE add error:', e);
      }
    }
  };

  // =====================================================
  //  CALLER: initiate a call
  // =====================================================
  const startCall = async () => {
    const ringtone = new Audio(RINGING_SOUND);
    ringtone.loop = true;
    ringtone.play().catch(() => {});
    ringtoneRef.current = ringtone;

    let customServers = null;
    try {
      const { data } = await getIceServers();
      customServers = (data && Array.isArray(data)) ? data : null;
    } catch (err) {
      console.warn('⚠️ Could not fetch TURN servers.');
    }

    const stream = await getMedia();
    if (cleanedUpRef.current || !stream) return;

    const pc = createPC(stream, customServers);
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: !isVoice,
    });
    await pc.setLocalDescription(offer);

    socket.emit('callUser', {
      recipientId: otherUser.id,
      signalData: offer,
      from: user.id,
      callerName: user.fullName,
      callType,
    });

    socket.on('callAccepted', async (signal) => {
      if (cleanedUpRef.current) return;
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
      setIsAccepted(true);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        await flushIce(pc);
      } catch (e) {
        console.error('Error setting remote description:', e);
      }
    });

    socket.on('iceCandidate', async (candidate) => {
      if (cleanedUpRef.current) return;
      if (pc.remoteDescription && pc.remoteDescription.type) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      } else {
        iceBuffer.current.push(candidate);
      }
    });

    socket.on('callEnded', () => {
      doCleanup();
      onEnd();
    });
  };

  // =====================================================
  //  RECEIVER: accept an incoming call
  // =====================================================
  const answerCall = async () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
    
    setIsAccepted(true);
    let customServers = null;
    try {
      const { data } = await getIceServers();
      customServers = (data && Array.isArray(data)) ? data : null;
    } catch (err) {
      console.warn('⚠️ Could not fetch TURN servers.');
    }

    let stream = streamRef.current;
    if (!stream) stream = await getMedia();
    if (cleanedUpRef.current || !stream) return;

    const pc = createPC(stream, customServers);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(initialSignal));
      await flushIce(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answerCall', { signal: answer, to: otherUser.id });
    } catch (e) {
      console.error('Error answering call:', e);
      toast.error('Failed to connect call.');
      endCall();
    }

    socket.on('iceCandidate', async (candidate) => {
      if (cleanedUpRef.current) return;
      if (pc.remoteDescription && pc.remoteDescription.type) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      } else {
        iceBuffer.current.push(candidate);
      }
    });

    socket.on('callEnded', () => {
      doCleanup();
      onEnd();
    });
  };

  // =====================================================
  //  END CALL
  // =====================================================
  const endCall = () => {
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
      tracks[0].enabled = !tracks[0].enabled;
      setIsMicOn(tracks[0].enabled);
    }
  };

  const toggleVideo = () => {
    const s = streamRef.current;
    if (!s) return;
    const tracks = s.getVideoTracks();
    if (tracks.length > 0) {
      tracks[0].enabled = !tracks[0].enabled;
      setIsVideoOn(tracks[0].enabled);
    }
  };

  // =====================================================
  //  MOUNT / UNMOUNT
  // =====================================================
  useEffect(() => {
    cleanedUpRef.current = false;
    const timeout = setTimeout(() => {
      if (cleanedUpRef.current) return;
      if (!isIncoming) {
        startCall();
      } else {
        const ringtone = new Audio(INCOMING_SOUND);
        ringtone.loop = true;
        ringtone.play().catch(() => {});
        ringtoneRef.current = ringtone;
      }
    }, 150);

    return () => {
      clearTimeout(timeout);
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
    <div className="fixed inset-0 z-[200] bg-dark-400 flex flex-col min-h-[100dvh] safe-area-pb">
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative w-full h-full lg:max-w-5xl lg:max-h-[80vh] lg:rounded-3xl bg-black overflow-hidden shadow-2xl border-white/5">

          {/* REMOTE VIDEO / AUDIO */}
          <video
            ref={remoteVideoEl}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${(!isAccepted || (isVoice && isAccepted)) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          />

          {/* AVATAR / STATUS OVERLAY */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center space-y-6 ${(isAccepted && !isVoice) ? 'hidden' : 'flex'}`}>
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
          </div>

          {/* LOCAL VIDEO PIP */}
          {!isVoice && (
            <div className="absolute top-4 right-4 w-28 sm:w-48 aspect-[3/4] bg-dark-300 rounded-xl overflow-hidden shadow-xl border border-white/10 z-10">
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
