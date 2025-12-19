'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Training {
  id: string;
  name: string;
  bidangId: string;
  duration: number;
  maxParticipants: number;
  status: string;
  createdAt: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', duration: 5, maxParticipants: 25, status: 'active' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchTrainings();
  }, [router]);

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/training`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTrainings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/training`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setFormData({ name: '', duration: 5, maxParticipants: 25, status: 'active' });
      fetchTrainings();
    } catch (error) {
      console.error('Error creating training:', error);
    }
  };

  const filteredTrainings = trainings.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading training programs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Training Programs 📚</h1>
            <p className="text-[#8fa3b8]">Manage all K3 training programs</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
          >
            ➕ New Training
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search training programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#1a2332] border border-[#2d3e52] rounded-lg px-4 py-3 text-white placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <select className="bg-[#1a2332] border border-[#2d3e52] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Training List */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
          {filteredTrainings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#8fa3b8] text-lg">No training programs found</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create first training
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2d3e52]">
                    <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Training Name</th>
                    <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Duration</th>
                    <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Max Participants</th>
                    <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainings.map((training) => (
                    <tr key={training.id} className="border-b border-[#2d3e52] hover:bg-[#1a2332] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{training.name}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{training.duration} days</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{training.maxParticipants}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                            training.status === 'active'
                              ? 'bg-green-500 bg-opacity-20 text-green-400'
                              : 'bg-gray-500 bg-opacity-20 text-[#8fa3b8]'
                          }`}
                        >
                          {training.status === 'active' ? '✓ Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-[#8fa3b8] hover:text-blue-400 transition-colors" title="Edit">
                          ✏️
                        </button>
                        <button className="text-[#8fa3b8] hover:text-red-400 transition-colors ml-2" title="Delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Training</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Training Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., K3 LISTRIK"
                  className="w-full bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-3 text-white placeholder-[#8fa3b8] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="w-full bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#1a2332] border border-[#2d3e52] rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#2d3e52] text-[#8fa3b8] px-4 py-3 rounded-lg hover:bg-[#3a4d63] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
