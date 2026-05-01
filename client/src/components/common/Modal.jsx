import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative ${maxWidth} w-full glass-card p-6 animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
