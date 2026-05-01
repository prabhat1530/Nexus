import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/post/CreatePost';
import { useNavigate } from 'react-router-dom';

export default function CreatePostPage() {
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/');
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Create Post</h1>
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
