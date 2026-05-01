import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Custom hook for infinite scrolling
 * @param {Function} fetchData - Async function to fetch data, takes page number as argument
 * @param {Object} options - Options for intersection observer
 * @returns {Object} - { data, loading, hasMore, ref, error, setData }
 */
export default function useInfiniteScroll(fetchData, options = {}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
    ...options,
  });

  const loadMore = useCallback(async (p) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchData(p);
      const newItems = response.data.posts || response.data.notifications || response.data || [];
      const more = response.data.hasMore !== undefined ? response.data.hasMore : newItems.length > 0;
      
      setData((prev) => (p === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(more);
      setPage(p);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, loading, hasMore]);

  // Initial load
  useEffect(() => {
    loadMore(1);
  }, []);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore(page + 1);
    }
  }, [inView, hasMore, loading, page, loadMore]);

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    loadMore(1);
  };

  return { data, loading, hasMore, ref, error, setData, refresh };
}
