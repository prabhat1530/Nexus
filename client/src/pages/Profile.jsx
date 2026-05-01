import { useState, useEffect } from 'react';
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
import { HiCalendar, HiVideoCamera } from 'react-icons/hi';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const { user } = useAuth();
  const { isOnline } = useSocket();
  const isOwn = user?.id === parseInt(id);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try { const { data } = await getUserById(id); setProfile(data); } catch {}
    setLoading(false);
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try { const { data } = await getUserPosts(id); setPosts(data.posts); } catch {}
    setPostsLoading(false);
  };

  if (loading) return <Spinner size="lg" />;
  if (!profile) return <div className="glass-card p-12 text-center text-gray-500">User not found</div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-600/40 via-accent-blue/30 to-accent-cyan/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_50%,rgba(0,0,0,0.4))]" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative">
            <Avatar src={profile.avatar} name={profile.fullName} size="xl" isOnline={isOnline(profile.id)} className="ring-4 ring-dark-300" />
            <div className="flex-1 sm:mb-1">
              <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
            <div className="flex gap-2">
              {!isOwn && (
                <>
                  <button onClick={() => navigate(`/chat?user=${profile.id}&call=true`)}
                    className="p-2.5 text-primary-400 bg-primary-500/10 rounded-xl border border-primary-500/20 hover:bg-primary-500/20 transition-all">
                    <HiVideoCamera className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate(`/chat?user=${profile.id}`)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-dark-200 border border-white/10 text-gray-300 hover:bg-dark-100 transition-all">
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
          {postsLoading ? Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />) :
            posts.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500 text-sm">No posts yet</div>
            ) : posts.map((post) => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />)
          }
        </div>
      </div>
    </div>
  );
}
