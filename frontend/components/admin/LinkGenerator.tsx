'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Training {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface GeneratedLink {
  id: number;
  token: string;
  share_url: string;
  qr_code_url: string;
  training_id: number;
  max_registrations: number;
  current_registrations: number;
  whatsapp_link: string;
  status: string;
}

export default function LinkGenerator() {
  const { request, loading, error } = useApi();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [form, setForm] = useState({
    training_id: '',
    max_registrations: 25,
    whatsapp_link: '',
  });
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch trainings on mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoadingTrainings(true);
      const response = await request('GET', '/admin/training');
      if (response.success) {
        setTrainings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch trainings:', err);
    } finally {
      setLoadingTrainings(false);
    }
  };

  // Generate link
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.training_id) {
      alert('Pilih pelatihan terlebih dahulu');
      return;
    }

    try {
      const response = await request('POST', '/admin/links', {
        training_id: parseInt(form.training_id),
        max_registrations: form.max_registrations,
        whatsapp_link: form.whatsapp_link || null,
      });

      if (response.success) {
        setGeneratedLink(response.data);
        alert('✅ Link berhasil dibuat!');
        // Reset form
        setForm({
          training_id: '',
          max_registrations: 25,
          whatsapp_link: '',
        });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to generate link:', err);
      alert('❌ Gagal membuat link');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} telah dicopy!`);
  };

  return (
    <div className="space-y-6">
      {/* Button to Toggle Form */}
      {!showForm && !generatedLink && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
        >
          🔗 Buat Link Baru
        </button>
      )}

      {/* Generator Form */}
      {showForm && (
        <form onSubmit={handleGenerate} className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Buat Link Pendaftaran Baru</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Training Selector */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Pilih Pelatihan *</label>
              {loadingTrainings ? (
                <div className="text-gray-500">Loading pelatihan...</div>
              ) : trainings.length === 0 ? (
                <div className="text-red-500 font-semibold">⚠️ Belum ada pelatihan. Buat pelatihan terlebih dahulu!</div>
              ) : (
                <select
                  value={form.training_id}
                  onChange={(e) => setForm({ ...form, training_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Pilih Pelatihan --</option>
                  {trainings.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.start_date} s/d {t.end_date})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Max Registrations */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Max Pendaftaran</label>
              <input
                type="number"
                min="1"
                max="200"
                value={form.max_registrations}
                onChange={(e) => setForm({ ...form, max_registrations: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* WhatsApp Link */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Link WhatsApp Group (Optional)</label>
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/..."
                value={form.whatsapp_link}
                onChange={(e) => setForm({ ...form, whatsapp_link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || trainings.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Membuat...' : '✅ Buat Link Otomatis'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-green-800">✅ Link Berhasil Dibuat!</h3>
            <button
              onClick={() => {
                setGeneratedLink(null);
                setShowForm(false);
              }}
              className="text-green-600 hover:text-green-800 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Token */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">🔐 Token Unik:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink.token}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border-2 border-green-300 rounded-lg font-mono font-bold text-green-800"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.token, 'Token')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Shareable URL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">🔗 Link Untuk Dibagikan:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink.share_url}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border-2 border-green-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.share_url, 'Link')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  📋 Copy
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">📧 Kirim link ini ke peserta via email atau WhatsApp</p>
            </div>

            {/* QR Code */}
            <div className="border-t-2 border-green-300 pt-4">
              <label className="block text-gray-700 font-semibold mb-3">📱 QR Code:</label>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                  <img
                    src={generatedLink.qr_code_url}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <a
                  href={generatedLink.qr_code_url}
                  download="qrcode.png"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-semibold"
                >
                  ⬇️ Download QR Code
                </a>
              </div>
              <p className="text-sm text-gray-600 mt-3">🖨️ Print QR code dan tempel di poster/email</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg p-3 border border-green-200 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="font-semibold text-gray-700">Max</div>
                <div className="text-lg font-bold text-green-600">{generatedLink.max_registrations}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Terdaftar</div>
                <div className="text-lg font-bold text-blue-600">{generatedLink.current_registrations}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Status</div>
                <div className="text-lg font-bold text-green-600">{generatedLink.status === 'active' ? '🟢 Aktif' : '🔴 Expired'}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setGeneratedLink(null)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Buat Link Lagi
            </button>
            <button
              onClick={() => {
                copyToClipboard(generatedLink.share_url, 'Link');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              ✅ Copy Link & Bagikan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
