'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface RegistrationLink {
  id: string;
  training_name: string;
  training_id: string;
  class_level: string;
  start_date: string;
  end_date: string;
  location: string;
  max_registrations: number;
  current_registrations: number;
  whatsapp_link: string;
  required_documents: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export default function RegisterPage() {
  const router = useRouter();
  const { token } = router.query;
  const [link, setLink] = useState<RegistrationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    nik: '',
    address: '',
    company: '',
    position: '',
  });
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchRegistrationLink();
    }
  }, [token]);

  const fetchRegistrationLink = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/public/links/${token}`);
      setLink(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Link tidak ditemukan atau sudah expired');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    try {
      setSubmitting(true);
      setError('');

      // Create FormData for file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add files
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          submitData.append(`files[${key}]`, file);
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/public/registrations`,
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        router.push(`/register/${token}/confirmation`);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal mendaftar, coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-[#8fa3b8]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] flex items-center justify-center p-4">
        <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] max-w-md text-center">
          <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!link) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 mb-4">
            <span className="text-white font-bold text-2xl">Δ</span>
          </div>
          <h1 className="text-3xl font-bold text-white">DELTA Training</h1>
          <p className="text-[#8fa3b8] mt-2">Formulir Pendaftaran Peserta</p>
        </div>

        {/* Training Info */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">{link.training_name}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[#8fa3b8] text-sm">Kelas / Level</p>
              <p className="text-white font-semibold">{link.class_level}</p>
            </div>
            <div>
              <p className="text-[#8fa3b8] text-sm">Lokasi</p>
              <p className="text-white font-semibold">{link.location}</p>
            </div>
            <div>
              <p className="text-[#8fa3b8] text-sm">Tanggal Mulai</p>
              <p className="text-white font-semibold">{new Date(link.start_date).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-[#8fa3b8] text-sm">Tanggal Selesai</p>
              <p className="text-white font-semibold">{new Date(link.end_date).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-[#8fa3b8] text-sm">Kapasitas Pendaftar</p>
              <p className="text-white font-semibold">
                {link.current_registrations}/{link.max_registrations}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] space-y-6">
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
              <p className="text-green-400">✓ Pendaftaran berhasil! Redirecting...</p>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">📋 Data Pribadi</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">No. Telepon *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">NIK *</label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2 mt-4">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Work Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">💼 Data Pekerjaan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nama Perusahaan</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Jabatan</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">📄 Dokumen yang Diperlukan</h3>
            <div className="space-y-3">
              {link.required_documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-[#1a2332] rounded-lg border border-[#2d3e52]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDocuments({ ...documents, [doc.id]: file });
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-xl">📎</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{doc.name}</p>
                      <p className="text-[#8fa3b8] text-sm">
                        {documents[doc.id] ? documents[doc.id]?.name : 'Klik untuk upload'}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sedang Mendaftar...
              </>
            ) : (
              <>
                ✓ Daftar Sekarang
              </>
            )}
          </button>

          {/* WhatsApp Link */}
          {link.whatsapp_link && (
            <div className="p-4 bg-green-500 bg-opacity-10 rounded-lg text-center">
              <p className="text-[#8fa3b8] text-sm mb-3">Bergabunglah dengan grup WhatsApp training</p>
              <a
                href={link.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                💬 Buka WhatsApp Group
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
