import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSuggestions, toggleFollow } from '../../services/userService';
import Avatar from './Avatar';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

export default function UserSuggestions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data } = await getSuggestions();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (id) => {
    try {
      await toggleFollow(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('Followed!');
    } catch (err) {
      toast.error('Failed to follow');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (users.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h3 className="font-bold text-white">People you may know</h3>
        <p className="text-xs text-gray-500">Connect with others to see their posts</p>
      </div>
      <div className="divide-y divide-white/5">
        {users.map(u => (
          <div key={u.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
              <Avatar src={u.avatar} name={u.fullName} size="md" />
              <div>
                <p className="text-sm font-semibold text-white">{u.fullName}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
            </Link>
            <button 
              onClick={() => handleFollow(u.id)}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
