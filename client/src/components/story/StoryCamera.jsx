import { useState, useRef, useEffect } from 'react';
import { HiX, HiCamera, HiSwitchHorizontal, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function StoryCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1920 } }, 
        audio: false 
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      toast.error('Could not access camera');
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
    }
  };

  const handleDone = async () => {
    setLoading(true);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], 'story.jpg', { type: 'image/jpeg' });
      await onCapture(file);
    } catch (err) {
      toast.error('Failed to process image');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
        <HiX className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-lg aspect-[9/16] bg-dark-400 overflow-hidden rounded-3xl shadow-2xl">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform">
                <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform" />
              </button>
            </div>
          </>
        ) : (
          <>
            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 px-10">
              <button onClick={() => setCapturedImage(null)} className="flex-1 btn-ghost py-4 flex items-center justify-center gap-2 bg-white/10 text-white rounded-2xl">
                <HiSwitchHorizontal className="w-5 h-5" /> Retake
              </button>
              <button onClick={handleDone} disabled={loading} className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary-500/30">
                {loading ? 'Uploading...' : <><HiCheck className="w-6 h-6" /> Share</>}
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
