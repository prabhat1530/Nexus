import CreatePost from '../components/post/CreatePost';
import { useNavigate } from 'react-router-dom';

export default function CreatePostPage() {
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="hero-panel mb-6">
        <div className="hero-orbit -right-10 -top-16 h-48 w-48" />
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-200">Share a moment</p>
        <h1 className="text-3xl font-bold text-white">Create a post</h1>
        <p className="mt-2 text-sm text-gray-300">What would you like your community to know?</p>
      </div>
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
