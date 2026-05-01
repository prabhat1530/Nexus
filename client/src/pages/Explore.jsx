import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { getExplore } from '../services/postService';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import { HiGlobe } from 'react-icons/hi';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();

  useEffect(() => { loadPosts(); }, []);
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      loadPosts(next);
    }
  }, [inView]);

  const loadPosts = async (p = 1) => {
    try {
      const { data } = await getExplore(p);
      if (p === 1) setPosts(data.posts);
      else setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
          <HiGlobe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Explore</h1>
          <p className="text-xs text-gray-500">Discover posts from everyone</p>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />) :
          posts.length === 0 ? (
            <div className="glass-card p-12 text-center"><p className="text-gray-500">No posts to explore yet.</p></div>
          ) : posts.map((post) => <PostCard key={post.id} post={post} />)
        }
        {hasMore && <div ref={ref}><PostSkeleton /></div>}
      </div>
    </div>
  );
}
