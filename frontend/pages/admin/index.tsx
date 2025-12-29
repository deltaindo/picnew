'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface DashboardStats {
  activeLinks: number;
  totalRegistrations: number;
  pendingDocuments: number;
  adminName: string;
}

interface Link {
  id: string;
  name: string;
  tanggal_pelaksanaan: string;
  tanggal_selesai: string;
  program: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    activeLinks: 0,
    totalRegistrations: 0,
    pendingDocuments: 0,
    adminName: 'Admin',
  });
  const [links, setLinks] = useState<Link[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch stats
        const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            activeLinks: statsData.activeLinks || 0,
            totalRegistrations: statsData.totalRegistrations || 0,
            pendingDocuments: statsData.pendingDocuments || 0,
            adminName: statsData.adminName || 'Admin',
          });
        }

        // Fetch links
        const linksResponse = await fetch(`${baseUrl}/api/links?limit=4`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (linksResponse.ok) {
          const linksData = await linksResponse.json();
          setLinks(linksData.data || []);
        }

        // Fetch activity logs
        const logsResponse = await fetch(`${baseUrl}/api/activity-logs?limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setActivityLogs(logsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Function to format activity date
  const formatActivityDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get days for calendar
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayArray = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Greeting Card */}
          <div className="md:col-span-2 bg-[#233347] rounded-xl p-6 border border-[#2d3e52] hover:border-blue-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Hello {stats.adminName}, 👋
                </h1>
                <p className="text-[#8fa3b8] text-sm">
                  Welcome to Delta Training Platform Dashboard
                </p>
              </div>
              <div className="hidden md:block w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] hover:border-blue-600 transition-colors">
            <h3 className="text-white font-semibold mb-4 text-sm">
              {monthYear.toUpperCase()}
            </h3>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-[#8fa3b8] font-medium text-center py-1">
                  {day}
                </div>
              ))}
              {getDayArray().map((day, idx) => (
                <div
                  key={idx}
                  className={`text-center py-2 rounded text-xs font-medium ${
                    day === currentDate.getDate()
                      ? 'bg-blue-600 text-white font-bold'
                      : day
                      ? 'text-[#8fa3b8] hover:bg-[#2d3e52] cursor-pointer'
                      : 'text-[#1a2332]'
                  }`}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52] hover:border-blue-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-xs font-medium uppercase">Active Links</p>
                <p className="text-white text-2xl font-bold mt-2">{stats.activeLinks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 bg-opacity-20 flex items-center justify-center text-xl">
                📊
              </div>
            </div>
          </div>

          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52] hover:border-green-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-xs font-medium uppercase">Total Registrations</p>
                <p className="text-white text-2xl font-bold mt-2">{stats.totalRegistrations}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 bg-opacity-20 flex items-center justify-center text-xl">
                📄
              </div>
            </div>
          </div>

          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52] hover:border-yellow-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-xs font-medium uppercase">Pending Documents</p>
                <p className="text-white text-2xl font-bold mt-2">{stats.pendingDocuments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 bg-opacity-20 flex items-center justify-center text-xl">
                ⚠️
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Link Pendaftaran Chart */}
          <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Link Pendaftaran</h3>
              <button className="text-[#8fa3b8] hover:text-white text-xl transition-colors" title="More options">⋯</button>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="#2d3e52"
                    strokeWidth="12"
                  />
                  {/* Active links circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="12"
                    strokeDasharray={`${stats.activeLinks * 1.4} 141`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-white text-3xl font-bold">{stats.activeLinks}</p>
                  <p className="text-[#8fa3b8] text-xs">Link</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-[#8fa3b8] text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#2d3e52] rounded-full"></div>
                  <span className="text-[#8fa3b8] text-sm">Non-active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Activity Log</h3>
              <button className="text-[#8fa3b8] hover:text-white text-xl transition-colors" title="More options">⋯</button>
            </div>
            <div className="space-y-4 max-h-56 overflow-y-auto">
              {activityLogs.length > 0 ? (
                activityLogs.map((log, idx) => (
                  <div key={idx} className="pb-4 border-b border-[#2d3e52]">
                    <p className="text-white text-sm font-medium">{log.description || log.message}</p>
                    <p className="text-[#8fa3b8] text-xs mt-1">
                      {formatActivityDate(log.created_at || log.timestamp)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#8fa3b8] text-sm">No activity logs yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Forms Table */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-white font-semibold text-lg">All Form</h3>
              <p className="text-[#8fa3b8] text-sm mt-1">List of training links</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-2 text-white text-sm placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500 w-full"
                />
              </div>
              <div className="flex-1 md:flex-none">
                <select className="bg-[#1a2332] border border-[#2d3e52] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 w-full">
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d3e52]">
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Form</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Tanggal Pelaksanaan</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Tanggal Selesai</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Program</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Link</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {links.length > 0 ? (
                  links.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#2d3e52] hover:bg-[#1a2332] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{formatDate(row.tanggal_pelaksanaan)}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{formatDate(row.tanggal_selesai)}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{row.program || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          row.status === 'active' || row.status === 'Active'
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {row.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[#8fa3b8] hover:text-blue-400 transition-colors" title="Copy link">
                          📋
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-[#8fa3b8] hover:text-white transition-colors" title="Settings">
                          ⚙️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="text-[#8fa3b8] text-sm">No training links found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
