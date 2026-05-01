import { useState } from 'react';
import { addComment } from '../../services/postService';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function CommentSection({ postId, comments: initialComments = [], onCommentAdded }) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await addComment(postId, text.trim());
      setComments((prev) => [...prev, data.comment]);
      setText('');
      onCommentAdded?.(data.commentsCount);
    } catch {
      toast.error('Failed to add comment');
    }
    setLoading(false);
  };

  return (
    <div className="border-t border-white/5 mt-3 pt-3">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 animate-fade-in">
              <Avatar src={comment.user?.avatar} name={comment.user?.fullName} size="sm" />
              <div className="flex-1 bg-dark-300/50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{comment.user?.fullName}</span>
                  <span className="text-[10px] text-gray-600">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Comment */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..."
          className="flex-1 bg-dark-300/80 border border-white/5 rounded-full px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary-500/30 transition-colors" />
        <button type="submit" disabled={!text.trim() || loading}
          className="text-sm font-semibold text-primary-400 hover:text-primary-300 disabled:opacity-30 transition-colors">
          Post
        </button>
      </form>
    </div>
  );
}
