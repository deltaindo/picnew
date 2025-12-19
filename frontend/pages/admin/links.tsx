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

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<RegistrationLink | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchLinks();
  }, [router]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinks(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
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
    alert('Link copied to clipboard!');
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
            onClick={() => setShowCreateModal(true)}
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
                      <td className="px-4 py-3 text-[#8fa3b8]">{link.class_level}</td>
                      <td className="px-4 py-3 text-[#8fa3b8]">
                        <span className="text-blue-400 font-medium">{link.current_registrations}</span>
                        <span className="text-[#8fa3b8]">/{link.max_registrations}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8fa3b8]">{new Date(link.expiry_date).toLocaleDateString('id-ID')}</td>
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
                          <button
                            title="Edit"
                            className="text-[#8fa3b8] hover:text-yellow-400 transition-colors text-lg"
                          >
                            ✏️
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
                  <p className="text-white font-semibold">{selectedLink.class_level}</p>
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
                  <p className="text-white font-semibold">{new Date(selectedLink.expiry_date).toLocaleDateString('id-ID')}</p>
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
