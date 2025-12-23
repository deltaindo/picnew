'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

type TabType = 'bidang' | 'classes' | 'personnel_types' | 'document_types';

interface MasterDataItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export default function MasterDataPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('bidang');
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = [
    { id: 'bidang', label: 'Bidang/Sektor', icon: '🏢' },
    { id: 'classes', label: 'Kelas', icon: '📚' },
    { id: 'personnel_types', label: 'Jenis Personel', icon: '👔' },
    { id: 'document_types', label: 'Tipe Dokumen', icon: '📄' },
  ] as const;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = `${API_BASE_URL}/api/admin/master-data/${activeTab}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        ...(formData.code && { code: formData.code }),
        ...(formData.description && { description: formData.description }),
      };

      await axios.post(`${API_BASE_URL}/api/admin/master-data/${activeTab}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({ name: '', code: '', description: '' });
      setShowCreateModal(false);
      await fetchData();
      alert('Berhasil menambah data!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambah data';
      alert('Gagal: ' + errorMessage);
      console.error('Create error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus item ini?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/admin/master-data/${activeTab}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchData();
        alert('Berhasil menghapus data!');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus data';
        alert('Gagal: ' + errorMessage);
        console.error('Delete error:', error);
      }
    }
  };

  const getTabLabel = (tab: TabType) => {
    return tabs.find(t => t.id === tab)?.label || '';
  };

  const getTabIcon = (tab: TabType) => {
    return tabs.find(t => t.id === tab)?.icon || '';
  };

  if (loading && items.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading master data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Master Data ⚙️</h1>
          <p className="text-[#8fa3b8] mt-1">Kelola data master sistem pelatihan</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#2d3e52] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowCreateModal(false);
              }}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-blue-400'
                  : 'text-[#8fa3b8] border-b-transparent hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Header with Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {getTabIcon(activeTab)} {getTabLabel(activeTab)}
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              ➕ Tambah Baru
            </button>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-3 text-[#8fa3b8]">Loading...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-[#233347] rounded-xl border border-[#2d3e52]">
              <p className="text-[#8fa3b8] text-lg">Belum ada data</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#233347] rounded-xl p-4 border border-[#2d3e52] hover:border-blue-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.code && (
                        <p className="text-[#8fa3b8] text-sm mt-1">Code: {item.code}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="text-[#8fa3b8] hover:text-red-400 transition-colors text-lg p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-[#8fa3b8] text-sm line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Tambah {getTabLabel(activeTab)}</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#8fa3b8] hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nama *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {(activeTab === 'bidang' || activeTab === 'document_types') && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Kode</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Optional"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    rows={3}
                    placeholder="Optional"
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
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
