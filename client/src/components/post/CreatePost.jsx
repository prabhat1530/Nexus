import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPhotograph, HiX } from 'react-icons/hi';
import { createPost } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        return toast.error('File size must be less than 5MB');
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    setLoading(true);
    
    try {
      let data;
      if (file) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('image', file);
        const response = await createPost(formData);
        data = response.data;
      } else {
        const response = await createPost({ content: content.trim() });
        data = response.data;
      }

      setContent('');
      removeFile();
      onPostCreated?.(data);
      toast.success('Post created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      animate={{ 
        scale: isFocused ? 1.01 : 1, 
        boxShadow: isFocused ? '0 10px 40px -10px rgba(168, 85, 247, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      }}
      transition={{ duration: 0.3 }}
      className="glass-card p-5 mb-6 border border-white/5"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar src={user?.avatar} name={user?.fullName} size="md" />
          <div className="flex-1">
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none text-[15px] min-h-[80px]"
              maxLength={5000}
            />
            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 relative rounded-xl overflow-hidden group"
                >
                  <img src={preview} alt="Preview" className="w-full max-h-80 object-cover rounded-xl" />
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 bg-dark-400/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiX className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="button" onClick={() => fileInputRef.current?.click()}
            className="btn-ghost flex items-center gap-2 text-sm text-primary-400">
            <HiPhotograph className="w-5 h-5" />
            <span>Photo</span>
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit" disabled={(!content.trim() && !file) || loading}
            className="btn-primary text-sm px-6 py-2">
            {loading ? 'Posting...' : 'Post'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
