'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from './layout';
import { Calendar, AlertCircle, BarChart3, FileText } from 'lucide-react';

interface DashboardStats {
  activeLinks: number;
  totalRegistrations: number;
  pendingDocuments: number;
  certificatesExpiring: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    activeLinks: 0,
    totalRegistrations: 0,
    pendingDocuments: 0,
    certificatesExpiring: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const user = await response.json();
          setUserName(user.data.email.split('@')[0]);
        }
        // Mock stats for now
        setStats({
          activeLinks: 30,
          totalRegistrations: 156,
          pendingDocuments: 24,
          certificatesExpiring: 3,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

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
          <div className="md:col-span-2 bg-[#233347] rounded-lg p-6 border border-[#2d3e52]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Hello Aryo, 👋</h1>
                <div className="flex items-center gap-2 text-[#8fa3b8]">
                  <AlertCircle size={16} />
                  <span className="text-sm">3 certificates are expiring today</span>
                </div>
              </div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-[#233347] rounded-lg p-6 border border-[#2d3e52]">
            <h3 className="text-white font-semibold mb-4">JULY 2025</h3>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {['Sun', 'Mon', 'Thu', 'Wed', 'Thru', 'Sat'].map((day) => (
                <div key={day} className="text-[#8fa3b8] text-xs font-medium text-center">
                  {day}
                </div>
              ))}
              {[13, 14, 15, 16, 17, 18].map((day) => (
                <div
                  key={day}
                  className={`text-center py-2 rounded ${
                    day === 15
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-[#8fa3b8] hover:bg-[#2d3e52] cursor-pointer'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-[#233347] rounded-lg p-4 border border-[#2d3e52]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-sm">Active Links</p>
                <p className="text-white text-2xl font-bold mt-1">{stats.activeLinks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <BarChart3 className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#233347] rounded-lg p-4 border border-[#2d3e52]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-sm">Total Registrations</p>
                <p className="text-white text-2xl font-bold mt-1">{stats.totalRegistrations}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 bg-opacity-20 flex items-center justify-center">
                <FileText className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#233347] rounded-lg p-4 border border-[#2d3e52]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-sm">Pending Documents</p>
                <p className="text-white text-2xl font-bold mt-1">{stats.pendingDocuments}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                <AlertCircle className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-[#233347] rounded-lg p-4 border border-[#2d3e52]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8fa3b8] text-sm">Expiring Soon</p>
                <p className="text-white text-2xl font-bold mt-1">{stats.certificatesExpiring}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500 bg-opacity-20 flex items-center justify-center">
                <Calendar className="text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Link Pendaftaran Chart */}
          <div className="bg-[#233347] rounded-lg p-6 border border-[#2d3e52]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Link Pendaftaran</h3>
              <button className="text-[#8fa3b8] text-xl">⋯</button>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32">
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
                  {/* Active links circle (75% = 30 active out of 40) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="12"
                    strokeDasharray="106 141"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-white text-3xl font-bold">30</p>
                  <p className="text-[#8fa3b8] text-xs">Link</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-[#8fa3b8] text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#2d3e52] rounded"></div>
                  <span className="text-[#8fa3b8] text-sm">Non-active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#233347] rounded-lg p-6 border border-[#2d3e52]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Activity Log</h3>
              <button className="text-[#8fa3b8] text-xl">⋯</button>
            </div>
            <div className="space-y-4">
              <div className="pb-4 border-b border-[#2d3e52]">
                <p className="text-white text-sm font-medium">Link pendaftaran baru telah di buat</p>
                <p className="text-[#8fa3b8] text-xs mt-1">Wednesday</p>
              </div>
              <div className="pb-4 border-b border-[#2d3e52]">
                <p className="text-white text-sm font-medium">Link pendaftaran "K3 LISTRIK" telah di tambahkan</p>
                <p className="text-[#8fa3b8] text-xs mt-1">April, 18</p>
              </div>
              <div className="pb-4 border-b border-[#2d3e52]">
                <p className="text-white text-sm font-medium">Admin baru telah di tambahkan</p>
                <p className="text-[#8fa3b8] text-xs mt-1">January, 10</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Forms Table */}
        <div className="bg-[#233347] rounded-lg p-6 border border-[#2d3e52]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-lg">All Form</h3>
              <p className="text-[#8fa3b8] text-sm mt-1">List of clients</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-2 text-white text-sm placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-[#1a2332] border border-[#2d3e52] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
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
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Form</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Tanggal Pelaksanaan</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Tanggal Selesai</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Program</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Link</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { form: 'TKBT 2', date1: '15-07-2025', date2: '15-07-2025', program: 'Reguler', status: 'Reminder' },
                  { form: 'K3 PAA', date1: '15-07-2025', date2: '15-07-2025', program: 'Inhouse', status: 'Reminder' },
                  { form: 'AHLI K3 UMUM', date1: '15-07-2025', date2: '15-07-2025', program: 'Inhouse', status: 'Reminder' },
                  { form: 'K3 LISTRIK', date1: '15-07-2025', date2: '15-07-2025', program: 'Inhouse', status: 'Reminder' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-[#2d3e52] hover:bg-[#1a2332]">
                    <td className="px-4 py-3 text-white font-medium">{row.form}</td>
                    <td className="px-4 py-3 text-[#8fa3b8]">{row.date1}</td>
                    <td className="px-4 py-3 text-[#8fa3b8]">{row.date2}</td>
                    <td className="px-4 py-3 text-[#8fa3b8]">{row.program}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded text-xs font-medium">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8fa3b8]">📋</td>
                    <td className="px-4 py-3 text-[#8fa3b8] text-center">
                      <button className="hover:text-white">⚙️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
