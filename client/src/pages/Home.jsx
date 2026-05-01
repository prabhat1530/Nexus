import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { getFeed } from '../services/postService';
import { getSuggestions } from '../services/userService';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import StoriesBar from '../components/story/StoriesBar';
import UserCard from '../components/user/UserCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const { ref: loadMoreRef, inView } = useInView();

  const loadPosts = useCallback(async (p = 1) => {
    try {
      const { data } = await getFeed(p);
      if (p === 1) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); loadSuggestions(); }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      loadPosts(next);
    }
  }, [inView]);

  const loadSuggestions = async () => {
    try { const { data } = await getSuggestions(); setSuggestions(data); } catch {}
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-6">
      <StoriesBar />
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1">Suggested for you</h3>
          <div className="space-y-1">
            {suggestions.slice(0, 3).map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500">No posts yet. Follow users or create your first post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))
        )}
        {hasMore && <div ref={loadMoreRef}><PostSkeleton /></div>}
      </div>
    </div>
  );
}
