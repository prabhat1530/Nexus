import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiChat, HiDotsHorizontal, HiTrash, HiPencil } from 'react-icons/hi';
import { toggleLike, deletePost } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function PostCard({ post, onDelete, onUpdate }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const isAuthor = user?.id === post.author?.id;

  const handleLike = async () => {
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 500);
    const prev = liked;
    setLiked(!liked);
    setLikesCount((c) => (liked ? c - 1 : c + 1));
    try {
      const { data } = await toggleLike(post.id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
      if (data.isLiked && socket && post.author?.id !== user.id) {
        socket.emit('sendNotification', { recipientId: post.author.id, notification: { type: 'like', sender: user, post: { id: post.id } } });
        socket.emit('postLiked', { postAuthorId: post.author.id, data: { postId: post.id, likesCount: data.likesCount, isLiked: data.isLiked } });
      }
    } catch {
      setLiked(prev);
      setLikesCount((c) => (prev ? c : c - 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete post'); }
    setShowMenu(false);
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card-hover p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author?.id}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.avatar} name={post.author?.fullName} size="md" isOnline={isOnline(post.author?.id)} />
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">{post.author?.fullName}</p>
            <p className="text-xs text-gray-500">@{post.author?.username} · {formatDate(post.createdAt)}</p>
          </div>
        </Link>
        {isAuthor && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <HiDotsHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <AnimatePresence>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-36 glass-card p-1 z-20"
                  >
                    <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors">
                      <HiTrash className="w-4 h-4" /> Delete
                    </button>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="mt-3 text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img src={post.image} alt="Post" className="w-full max-h-96 object-cover hover:scale-[1.02] transition-transform duration-500" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={handleLike} 
          className={`flex items-center gap-2 text-sm transition-all duration-200 group ${liked ? 'text-accent-rose' : 'text-gray-500 hover:text-accent-rose'}`}
        >
          {liked ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
              <HiHeart className="w-5 h-5" />
            </motion.div>
          ) : (
            <HiOutlineHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-medium">{likesCount}</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-accent-blue transition-colors group"
        >
          <HiChat className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{commentsCount}</span>
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-2 border-t border-white/5">
              <CommentSection postId={post.id} comments={post.comments || []} onCommentAdded={setCommentsCount} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
