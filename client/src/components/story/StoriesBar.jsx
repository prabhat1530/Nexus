import { useState, useEffect } from 'react';
import { HiPlus } from 'react-icons/hi';
import { getStories, createStory } from '../../services/storyService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import StoryCamera from './StoryCamera';
import StoryViewer from './StoryViewer';
import toast from 'react-hot-toast';

export default function StoriesBar() {
  const [userStories, setUserStories] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data } = await getStories();
      setUserStories(data);
    } catch (err) {
      console.error('Failed to load stories');
    }
    setLoading(false);
  };

  const handleCapture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      await createStory(formData);
      toast.success('Story shared!');
      setShowCamera(false);
      loadStories();
    } catch (err) {
      toast.error('Failed to share story');
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {/* Create Story Button */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button onClick={() => setShowCamera(true)}
          className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary-500 to-accent-blue transition-transform active:scale-95">
          <div className="w-full h-full rounded-full bg-dark-300 flex items-center justify-center p-0.5">
            <Avatar src={user?.avatar} name={user?.fullName} size="lg" className="w-full h-full" />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full border-4 border-dark-400 flex items-center justify-center text-white">
            <HiPlus className="w-3.5 h-3.5" />
          </div>
        </button>
        <span className="text-[11px] font-medium text-gray-400">Your Story</span>
      </div>

      {/* Stories List */}
      {userStories.map((group) => (
        <div key={group.user.id} onClick={() => setActiveGroup(group)} 
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary-500 via-accent-purple to-accent-pink group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-dark-300 p-0.5">
              <Avatar src={group.user.avatar} name={group.user.fullName} size="lg" className="w-full h-full border-2 border-dark-400" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors truncate w-16 text-center">
            {group.user.id === user?.id ? 'You' : group.user.username}
          </span>
        </div>
      ))}

      {showCamera && <StoryCamera onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      {activeGroup && <StoryViewer userGroup={activeGroup} onClose={() => setActiveGroup(null)} onStoryDeleted={loadStories} />}
    </div>
  );
}
