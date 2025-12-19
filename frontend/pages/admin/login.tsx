'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@delta-indonesia.com');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        router.push('/admin');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 mb-4">
            <span className="text-white font-bold text-2xl">Δ</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">DELTA Training</h1>
          <p className="text-[#8fa3b8] text-sm">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-[#8fa3b8] text-sm mb-6">Sign in to your admin account</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@delta-indonesia.com"
                className="w-full px-4 py-3 rounded-lg bg-[#1a2332] border border-[#2d3e52] text-white placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-[#1a2332] border border-[#2d3e52] text-white placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8fa3b8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-[#1a2332] border border-[#2d3e52] checked:bg-blue-600 cursor-pointer"
                />
                <span className="text-[#8fa3b8]">Remember me</span>
              </label>
              <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-[#2d3e52]">
            <p className="text-[#8fa3b8] text-xs text-center mb-3">Demo Credentials</p>
            <div className="bg-[#1a2332] rounded p-3 text-xs text-[#8fa3b8] space-y-1">
              <p><span className="text-blue-400">Email:</span> admin@delta-indonesia.com</p>
              <p><span className="text-blue-400">Password:</span> Admin123!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#8fa3b8] text-xs mt-6">
          © 2025 Delta Indonesia. All rights reserved.
        </p>
      </div>
    </div>
  );
}
