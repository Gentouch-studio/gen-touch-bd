import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await register(name, email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Instant Demo Admin Mode Access for Developer Testing
  const handleInstantAdminAccess = () => {
    // Store an admin session in localStorage for immediate admin role access
    const adminProfile = {
      uid: 'admin-master-001',
      email: 'admin@gentouch.com',
      displayName: 'System Admin',
      role: 'admin',
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('gen_touch_admin_override', JSON.stringify(adminProfile));
    toast.success('Admin Mode Activated! Redirecting to Admin Dashboard...');
    setTimeout(() => {
      navigate('/admin');
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-2xl shadow-xs">
            G
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-gray-500">
            {isLogin
              ? 'Enter your credentials to access your Gen-Touch account'
              : 'Sign up to track orders, save wishlist, and get exclusive offers'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isLogin ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isLogin ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Developer Instant Admin Access Option */}
        <div className="pt-4 border-t border-gray-100 text-center space-y-2">
          <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">
            Owner & Administrator Tools
          </p>
          <button
            type="button"
            onClick={handleInstantAdminAccess}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enter as Admin (Direct Access)</span>
          </button>
        </div>

      </div>
    </div>
  );
};