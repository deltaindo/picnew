'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface RegistrationLink {
  id: string;
  token: string;
  training_id: string;
  training_name: string;
  class_level: string;
  personnel_type: string;
  max_registrations: number;
  current_registrations: number;
  expiry_date: string;
  whatsapp_link: string;
  status: 'active' | 'expired' | 'archived';
  created_at: string;
}

interface Training {
  id: string;
  name: string;
}

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<RegistrationLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    training_id: '',
    class_level: '',
    personnel_type: '',
    max_registrations: 25,
    whatsapp_link: '',
    expiry_date: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchLinks();
    fetchTrainings();
  }, [router]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching links with API_BASE_URL:', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/api/admin/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Links response:', response.data);
      setLinks(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching trainings...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/training`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Trainings response:', response.data);
      setTrainings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.training_id) {
      alert('Pilih training terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        training_id: formData.training_id,
        class_level: formData.class_level || null,
        personnel_type: formData.personnel_type || null,
        max_registrations: parseInt(String(formData.max_registrations)) || 25,
        expiry_date: formData.expiry_date || null,
        whatsapp_link: formData.whatsapp_link || null,
      };

      console.log('Creating link with payload:', payload);
      console.log('API URL:', `${API_BASE_URL}/api/admin/links`);
      
      const response = await axios.post(`${API_BASE_URL}/api/admin/links`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Create response:', response.data);
      
      setFormData({
        training_id: '',
        class_level: '',
        personnel_type: '',
        max_registrations: 25,
        whatsapp_link: '',
        expiry_date: '',
      });
      setShowCreateModal(false);
      await fetchLinks();
      alert('✅ Link berhasil dibuat!');
    } catch (error: any) {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat link';
      alert('❌ Gagal: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 bg-opacity-20 text-green-400';
      case 'expired':
        return 'bg-red-500 bg-opacity-20 text-red-400';
      case 'archived':
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
      default:
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
    }
  };

  const copyToClipboard = (token: string) => {
    const linkUrl = `${window.location.origin}/register/${token}`;
    navigator.clipboard.writeText(linkUrl);
    alert('✅ Link copied to clipboard!');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading registration links...</p>
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
            <h1 className="text-3xl font-bold text-white">Link Pendaftaran 🔗</h1>
            <p className="text-[#8fa3b8] mt-1">Kelola tautan pendaftaran peserta pelatihan</p>
          </div>
          <button
            onClick={() => {
              console.log('Opening create modal');
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 w-fit"
          >
            ➕ Buat Link Baru
          </button>
        </div>

        {/* Links Table */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d3e52]">
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Training</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Class</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Registrasi</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Exp Date</th>
                  <th className="text-left px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-[#8fa3b8] font-medium text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center px-4 py-8 text-[#8fa3b8]">
                      Belum ada link pendaftaran. Buat link baru sekarang!
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link.id} className="border-b border-[#2d3e52] hover:bg-[#1a2332] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{link.training_name}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{link.class_level || '-'}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        <span className="text-blue-400 font-medium">{link.current_registrations}</span>
                        <span className="text-[#8fa3b8]">/{link.max_registrations}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        {link.expiry_date ? new Date(link.expiry_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(link.status)}`}>
                          {link.status === 'active' && '✓ Active'}
                          {link.status === 'expired' && '✗ Expired'}
                          {link.status === 'archived' && '📦 Archived'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => copyToClipboard(link.token)}
                            title="Copy link"
                            className="text-[#8fa3b8] hover:text-blue-400 transition-colors text-lg"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => setSelectedLink(link)}
                            title="View details"
                            className="text-[#8fa3b8] hover:text-green-400 transition-colors text-lg"
                          >
                            👁️
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

        {/* Create Link Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Buat Link Pendaftaran Baru</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Training *</label>
                  <select
                    value={formData.training_id}
                    onChange={(e) => {
                      console.log('Selected training:', e.target.value);
                      setFormData({ ...formData, training_id: e.target.value });
                    }}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">-- Pilih Training --</option>
                    {trainings.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {trainings.length === 0 && (
                    <p className="text-red-400 text-xs mt-1">⚠️ Tidak ada training tersedia</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Class Level</label>
                  <input
                    type="text"
                    value={formData.class_level}
                    onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., AHLI, SUPERVISI"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Personnel Type</label>
                  <input
                    type="text"
                    value={formData.personnel_type}
                    onChange={(e) => setFormData({ ...formData, personnel_type: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., OPERATOR, TEKNISI"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Max Registrations</label>
                  <input
                    type="number"
                    value={formData.max_registrations}
                    onChange={(e) => setFormData({ ...formData, max_registrations: parseInt(e.target.value) || 25 })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">WhatsApp Group Link</label>
                  <input
                    type="url"
                    value={formData.whatsapp_link}
                    onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://chat.whatsapp.com/..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '⏳ Creating...' : '✅ Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Link Details Modal */}
        {selectedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Detail Link</h2>
                <button
                  onClick={() => setSelectedLink(null)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[#8fa3b8] text-sm">Training</p>
                  <p className="text-white font-semibold">{selectedLink.training_name}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Class Level</p>
                  <p className="text-white font-semibold">{selectedLink.class_level || '-'}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Registration URL</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/register/${selectedLink.token}`}
                      readOnly
                      className="flex-1 bg-[#1a2332] border border-[#2d3e52] rounded px-3 py-2 text-[#8fa3b8] text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedLink.token)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Max Registrations</p>
                  <p className="text-white font-semibold">{selectedLink.max_registrations}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Current Registrations</p>
                  <p className="text-white font-semibold">{selectedLink.current_registrations}</p>
                </div>
                <div>
                  <p className="text-[#8fa3b8] text-sm">Expiry Date</p>
                  <p className="text-white font-semibold">
                    {selectedLink.expiry_date ? new Date(selectedLink.expiry_date).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLink(null)}
                className="w-full mt-6 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
