import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';
import { searchUsers } from '../../services/userService';
import useDebounce from '../../hooks/useDebounce';
import Avatar from '../common/Avatar';
import { useSocket } from '../../context/SocketContext';

export default function UserSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const { isOnline } = useSocket();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchUsers(debouncedQuery).then(({ data }) => { setResults(data); setShow(true); }).catch(() => {});
    } else {
      setResults([]);
      setShow(false);
    }
  }, [debouncedQuery]);

  const handleSelect = (user) => {
    navigate(`/profile/${user.id}`);
    setQuery('');
    setShow(false);
    onSelect?.();
  };

  return (
    <div className="relative">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text" placeholder="Search users..." value={query}
          onChange={(e) => setQuery(e.target.value)} onFocus={() => results.length > 0 && setShow(true)}
          className="input-field pl-10 py-2.5 text-sm"
        />
      </div>
      {show && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 max-h-64 overflow-y-auto z-50 animate-slide-up">
          {results.map((user) => (
            <button key={user.id} onClick={() => handleSelect(user)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-dark-100/50 transition-colors text-left">
              <Avatar src={user.avatar} name={user.fullName} size="sm" isOnline={isOnline(user.id)} />
              <div>
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {show && <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />}
    </div>
  );
}
