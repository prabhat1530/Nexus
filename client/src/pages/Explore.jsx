import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { getExplore } from '../services/postService';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import UserSuggestions from '../components/common/UserSuggestions';
import { HiGlobe } from 'react-icons/hi';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const { ref, inView } = useInView();

  const loadPosts = useCallback(async (p = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (p > 1) setLoadingMore(true);
    try {
      const { data } = await getExplore(p);
      if (p === 1) setPosts(data.posts || []);
      else setPosts((prev) => [...prev, ...(data.posts || [])]);
      setHasMore(Boolean(data.hasMore));
      setError(false);
      pageRef.current = p;
    } catch { setError(true); }
    finally { fetchingRef.current = false; setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) loadPosts(pageRef.current + 1);
  }, [inView, hasMore, loading, loadingMore, loadPosts]);

  return (
    <div>
      <div className="hero-panel mb-8 flex items-center gap-4">
        <div className="hero-orbit -right-8 -top-14 h-44 w-44" />
        <div className="brand-mark h-11 w-11 shrink-0">
          <HiGlobe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-gray-400">Discover fresh ideas from the community.</p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />) : error && posts.length === 0 ? (
          <div className="glass-card p-10 text-center"><p className="text-gray-300 mb-4">Could not load posts.</p><button className="btn-secondary" onClick={() => loadPosts(1)}>Try again</button></div>
        ) :
          posts.length === 0 ? (
            <div className="space-y-6">
              <div className="glass-card p-12 text-center">
                <p className="text-gray-500 mb-4">No posts to explore yet.</p>
              </div>
              <UserSuggestions />
            </div>
          ) : posts.map((post) => <PostCard key={post.id} post={post} />)
        }
        {!loading && !error && hasMore && <div ref={ref}>{loadingMore && <PostSkeleton />}</div>}
      </div>
    </div>
  );
}
