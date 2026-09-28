import CreatePost from '../components/post/CreatePost';
import { useNavigate } from 'react-router-dom';

export default function CreatePostPage() {
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="mb-6 rounded-3xl border border-primary-400/20 bg-[linear-gradient(120deg,#1c3b45,#17283b_70%)] p-6 sm:p-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-300">Share a moment</p>
        <h1 className="text-3xl font-bold text-white">Create a post</h1>
        <p className="mt-2 text-sm text-gray-300">What would you like your community to know?</p>
      </div>
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
