'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
  permissions: string[];
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'admin', password: '' });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/users`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ name: '', email: '', role: 'admin', password: '' });
      setShowCreateModal(false);
      fetchUsers();
    } catch (error: any) {
      alert('Failed to create user: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500 bg-opacity-20 text-red-400';
      case 'admin':
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
      case 'moderator':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '🚫 Super Admin';
      case 'admin':
        return '🔑 Admin';
      case 'moderator':
        return '👁️ Moderator';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Users 👥</h1>
            <p className="text-[#8fa3b8] mt-1">Kelola akun admin dan permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 w-fit"
          >
            ➕ Admin Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52]">
            <p className="text-[#8fa3b8] text-xs font-medium uppercase">Total Users</p>
            <p className="text-white text-3xl font-bold mt-2">{users.length}</p>
          </div>
          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52]">
            <p className="text-[#8fa3b8] text-xs font-medium uppercase">Active Users</p>
            <p className="text-white text-3xl font-bold mt-2">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-[#233347] rounded-xl p-5 border border-[#2d3e52]">
            <p className="text-[#8fa3b8] text-xs font-medium uppercase">Super Admins</p>
            <p className="text-white text-3xl font-bold mt-2">{users.filter(u => u.role === 'super_admin').length}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d3e52]">
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Last Login</th>
                  <th className="text-center px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center px-4 py-8 text-[#8fa3b8]">
                      Belum ada user admin
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-[#2d3e52] hover:bg-[#1a2332] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-500 bg-opacity-20 text-green-400'
                            : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}>
                          {user.status === 'active' ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            title="View details"
                            className="text-[#8fa3b8] hover:text-green-400 transition-colors text-lg"
                          >
                            👁️
                          </button>
                          <button
                            title="Edit"
                            className="text-[#8fa3b8] hover:text-yellow-400 transition-colors text-lg"
                          >
                            ✏️
                          </button>
                          <button
                            title="Delete"
                            className="text-[#8fa3b8] hover:text-red-400 transition-colors text-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Admin Baru</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="admin">🔑 Admin</option>
                    <option value="moderator">👁️ Moderator</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[#8fa3b8] text-sm">Name</p>
                  <p className="text-white font-semibold">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Email</p>
                  <p className="text-white font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Role</p>
                  <p className="text-white font-semibold">{getRoleLabel(selectedUser.role)}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Status</p>
                  <p className="text-white font-semibold">{selectedUser.status}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Created</p>
                  <p className="text-white font-semibold">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Last Login</p>
                  <p className="text-white font-semibold">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('id-ID') : 'Never'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full mt-6 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
