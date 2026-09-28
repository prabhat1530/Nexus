import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../services/userService';
import { getUserPosts } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/common/Avatar';
import FollowButton from '../components/user/FollowButton';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import Spinner from '../components/common/Spinner';
import { HiVideoCamera } from 'react-icons/hi';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [postsError, setPostsError] = useState(false);
  const { user } = useAuth();
  const { isOnline } = useSocket();
  const isOwn = user?.id === parseInt(id);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setProfileError('');
    try { const { data } = await getUserById(id); setProfile(data); }
    catch (error) { setProfile(null); setProfileError(error.response?.status === 404 ? 'not-found' : 'unavailable'); }
    finally { setLoading(false); }
  }, [id]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPosts([]);
    try { const { data } = await getUserPosts(id); setPosts(data.posts || []); setPostsError(false); }
    catch { setPostsError(true); }
    finally { setPostsLoading(false); }
  }, [id]);

  useEffect(() => { loadProfile(); loadPosts(); }, [loadProfile, loadPosts]);

  if (loading) return <Spinner size="lg" />;
  if (!profile) return (
    <div className="glass-card p-10 text-center" role={profileError === 'unavailable' ? 'alert' : undefined}>
      <h1 className="text-xl font-bold text-white">{profileError === 'not-found' ? 'User not found' : 'Profile unavailable'}</h1>
      <p className="mt-2 text-sm text-gray-400">{profileError === 'not-found' ? 'This profile may have been removed.' : 'We could not load this profile. Check your connection and try again.'}</p>
      {profileError !== 'not-found' && <button onClick={loadProfile} className="btn-primary mt-6 min-h-11">Try again</button>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="h-36 relative overflow-hidden bg-[radial-gradient(circle_at_75%_5%,rgba(169,183,255,0.45),transparent_34%),linear-gradient(125deg,#394a85,#27345c_60%,#222b45)]">
          <div className="absolute -right-8 -top-16 h-52 w-52 rounded-full border border-white/15" />
          <div className="absolute right-5 -top-9 h-36 w-36 rounded-full border border-white/10" />
        </div>
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative">
            <Avatar src={profile.avatar} name={profile.fullName} size="xl" isOnline={isOnline(profile.id)} className="ring-4 ring-dark-300" />
            <div className="flex-1 sm:mb-1">
              <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isOwn && (
                <>
                  <button aria-label={`Video call ${profile.fullName}`} onClick={() => navigate(`/chat?user=${profile.id}&call=true`)}
                    className="flex h-11 w-11 items-center justify-center text-primary-400 bg-primary-500/10 rounded-xl border border-primary-500/20 hover:bg-primary-500/20 transition-all">
                    <HiVideoCamera className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate(`/chat?user=${profile.id}`)}
                    className="min-h-11 px-5 py-2 text-sm font-semibold rounded-xl bg-dark-200 border border-white/10 text-gray-300 hover:bg-dark-100 transition-all">
                    Message
                  </button>
                  <FollowButton userId={profile.id} initialFollowing={profile.isFollowing} onToggle={() => loadProfile()} />
                </>
              )}
            </div>
          </div>
          {profile.bio && <p className="mt-4 text-sm text-gray-300 leading-relaxed">{profile.bio}</p>}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.postsCount}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.followersCount}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{profile.followingCount}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">Posts</h2>
        <div className="space-y-4">
          {postsLoading ? Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />) : postsError && posts.length === 0 ? (
            <div className="glass-card p-8 text-center" role="alert"><p className="font-semibold text-white">Could not load posts</p><p className="mt-2 text-sm text-gray-400">Check your connection and try again.</p><button onClick={loadPosts} className="btn-secondary mt-5 min-h-11">Try again</button></div>
          ) :
            posts.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500 text-sm">No posts yet</div>
            ) : posts.map((post) => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />)
          }
        </div>
      </div>
    </div>
  );
}
