import { useState, useEffect } from 'react';
import { HiX, HiChevronLeft, HiChevronRight, HiEye, HiTrash } from 'react-icons/hi';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { markStoryViewed, deleteStory } from '../../services/storyService';
import toast from 'react-hot-toast';

export default function StoryViewer({ userGroup, onClose, onStoryDeleted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const stories = userGroup.stories;
  const user = userGroup.user;
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id === user?.id;

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (currentStory && currentUser?.id !== user?.id) {
      markStoryViewed(currentStory.id).catch(console.error);
    }
  }, [currentIndex, currentStory, currentUser, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showViewers) handleNext();
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [currentIndex, showViewers]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(currentStory.id);
      toast.success('Story deleted');
      if (stories.length === 1) {
        onClose();
      } else {
        handleNext();
      }
      onStoryDeleted?.(currentStory.id);
    } catch {
      toast.error('Failed to delete story');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-dark-400/95 backdrop-blur-3xl flex items-center justify-center">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-[120]">
        <HiX className="w-8 h-8" />
      </button>

      <div className="relative w-full max-w-lg aspect-[9/16] bg-black shadow-2xl rounded-3xl overflow-hidden group">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-[120]">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full' : 'w-0'}`}
                style={{ animationPlayState: showViewers ? 'paused' : 'running' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-[120]">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.fullName} size="md" className="ring-2 ring-white/20" />
            <div>
              <p className="text-sm font-bold text-white shadow-sm">{user.fullName}</p>
              <p className="text-[10px] text-white/60">{new Date(currentStory.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="p-2 text-white/50 hover:text-accent-rose transition-colors">
              <HiTrash className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Story Image */}
        <img src={currentStory.imageUrl} className="w-full h-full object-cover" alt="Story" />

        {/* Navigation Overlays */}
        {!showViewers && (
          <div className="absolute inset-0 flex">
            <div onClick={handlePrev} className="flex-1 cursor-pointer" />
            <div onClick={handleNext} className="flex-1 cursor-pointer" />
          </div>
        )}

        {/* Bottom Views Info */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[120]">
          <button 
            onClick={() => isOwner && setShowViewers(!showViewers)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 transition-all ${isOwner ? 'hover:bg-black/60' : 'cursor-default'}`}
          >
            <HiEye className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-semibold">{currentStory.viewsCount || 0} views</span>
          </button>
        </div>

        {/* Viewers List Drawer */}
        {showViewers && isOwner && (
          <div className="absolute inset-x-0 bottom-0 bg-dark-300/90 backdrop-blur-xl border-t border-white/10 p-6 z-[130] animate-slide-up max-h-[60%] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Seen by</h3>
              <button onClick={() => setShowViewers(false)} className="text-gray-400 hover:text-white">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {currentStory.views?.length > 0 ? (
                currentStory.views.map((view) => (
                  <div key={view.id} className="flex items-center gap-3">
                    <Avatar src={view.user?.avatar} name={view.user?.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-white">{view.user?.fullName}</p>
                      <p className="text-[10px] text-gray-500">@{view.user?.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-gray-500 py-4">No views yet</p>
              )}
            </div>
          </div>
        )}

        {/* Desktop Navigation Buttons */}
        <button onClick={handlePrev} className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity ${currentIndex === 0 ? 'hidden' : ''}`}>
          <HiChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <HiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
