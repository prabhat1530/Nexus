import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiSparkles, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form);
    if (result.success) navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-dark-400">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <HiSparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Welcome to Nexus</h1>
          <p className="text-gray-500 mt-2">Sign in to continue your journey</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" className="input-field" id="login-email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input-field pr-10" id="login-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-center" id="login-submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
