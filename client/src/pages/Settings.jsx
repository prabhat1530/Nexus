import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';
import { HiCog, HiUser, HiPhotograph, HiUpload } from 'react-icons/hi';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('bio', form.bio);
      if (file) formData.append('avatar', file);

      const { data } = await updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
          <HiCog className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-dark-200/30 border border-white/5">
            <div className="relative group">
              <Avatar src={preview || user?.avatar} name={form.fullName} size="xl" className="ring-4 ring-primary-500/20" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <HiUpload className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white mb-1">Profile Picture</h3>
              <p className="text-xs text-gray-500 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="btn-ghost text-xs text-primary-400 font-semibold px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg">
                Choose New File
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <HiUser className="inline w-4 h-4 mr-1" /> Full Name
              </label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="input-field resize-none h-24" placeholder="Tell us about yourself..." maxLength={500} />
              <p className="text-xs text-gray-600 mt-1 text-right">{form.bio.length}/500</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
