import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { getFeed } from '../services/postService';
import { getSuggestions } from '../services/userService';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import StoriesBar from '../components/story/StoriesBar';
import UserCard from '../components/user/UserCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const { ref: loadMoreRef, inView } = useInView();

  const loadPosts = useCallback(async (p = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (p > 1) setLoadingMore(true);
    try {
      const { data } = await getFeed(p);
      if (p === 1) setPosts(data.posts || []);
      else setPosts((prev) => [...prev, ...(data.posts || [])]);
      setHasMore(Boolean(data.hasMore));
      setError(false);
      pageRef.current = p;
    } catch { setError(true); }
    finally { fetchingRef.current = false; setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { loadPosts(); loadSuggestions(); }, [loadPosts]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) loadPosts(pageRef.current + 1);
  }, [inView, hasMore, loading, loadingMore, loadPosts]);

  const loadSuggestions = async () => {
    try { const { data } = await getSuggestions(); setSuggestions(data); } catch { setSuggestions([]); }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-6">
      <div className="hero-panel">
        <div className="hero-orbit -right-14 -top-20 h-56 w-56" />
        <div className="hero-orbit -right-1 -top-8 h-40 w-40" />
        <div className="absolute right-10 top-9 h-16 w-16 rotate-12 rounded-2xl border border-white/20 bg-white/10 shadow-[10px_12px_24px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm hidden sm:block" />
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-200">Your community</p>
        <h1 className="relative text-3xl sm:text-4xl font-bold text-white">Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</h1>
        <p className="relative mt-2 max-w-md text-sm text-primary-50/75">A place to share what matters and catch up with your people.</p>
      </div>
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
        <div className="flex items-center justify-between px-1"><h2 className="text-xl font-bold text-white">Your feed</h2><span className="text-xs text-gray-500">Latest posts</span></div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : error && posts.length === 0 ? (
          <div className="glass-card p-10 text-center"><p className="text-gray-300 mb-4">Could not load your feed.</p><button className="btn-secondary" onClick={() => loadPosts(1)}>Try again</button></div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500">No posts yet. Follow users or create your first post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))
        )}
        {!loading && !error && hasMore && <div ref={loadMoreRef}>{loadingMore && <PostSkeleton />}</div>}
      </div>
    </div>
  );
}
