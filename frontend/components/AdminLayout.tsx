'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// Lucide icons - using string as fallback if import fails
const icons = {
  Menu: () => <span>☰</span>,
  X: () => <span>✕</span>,
  LogOut: () => <span>⏏</span>,
  LayoutDashboard: () => <span>▤</span>,
  Link: () => <span>🔗</span>,
  Calendar: () => <span>📅</span>,
  Users: () => <span>👥</span>,
  Settings: () => <span>⚙</span>,
};

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token && router.pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { name: 'Link Pendaftaran', href: '/admin/links', icon: 'Link' },
    { name: 'Jadwal', href: '/admin/jadwal', icon: 'Calendar' },
    { name: 'Admin', href: '/admin/users', icon: 'Users' },
    { name: 'Master Data', href: '/admin/master-data', icon: 'Settings' },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#1e2a3a]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1a2332] border-r border-[#2d3e52] transition-all duration-300 flex flex-col fixed h-screen z-50 md:static`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-[#2d3e52]">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">Δ</span>
                </div>
                <h1 className="text-white text-sm font-semibold">DELTA</h1>
                <p className="text-[#8fa3b8] text-xs">Training</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#8fa3b8] hover:text-white ml-auto md:hidden"
              title="Toggle sidebar"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-[#8fa3b8] hover:bg-[#2d3e52] hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon === 'LayoutDashboard' && '▤'}</span>
                <span className="text-lg">{item.icon === 'Link' && '🔗'}</span>
                <span className="text-lg">{item.icon === 'Calendar' && '📅'}</span>
                <span className="text-lg">{item.icon === 'Users' && '👥'}</span>
                <span className="text-lg">{item.icon === 'Settings' && '⚙'}</span>
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </a>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[#2d3e52] p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#8fa3b8] hover:text-red-400 hover:bg-[#2d3e52] transition-colors"
          >
            <span className="text-lg">⏏</span>
            {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-[#233347] border-b border-[#2d3e52] px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-white text-lg md:text-xl font-semibold">Welcome, Admin 👋</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#1e2a3a]">
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
