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
  required_documents?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  provinces?: Array<{
    id: number;
    name: string;
  }>;
  education_levels?: Array<{
    id: number;
    name: string;
  }>;
}

interface CascadingLocation {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { token } = router.query;
  const [link, setLink] = useState<RegistrationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Personal Data
    nama: '',
    ktp: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    pendidikan: '',
    nama_sekolah: '',
    no_ijazah: '',
    tgl_ijazah: '',
    // Location
    province_id: '',
    district_id: '',
    subdistrict_id: '',
    village_id: '',
    alamat_rumah: '',
    golongan_darah: '',
    // Contact
    wa: '',
    email: '',
    // Company
    instansi: '',
    sektor: '',
    alamat_perusahaan: '',
    jabatan: '',
    tlp_kantor: '',
  });

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Cascading location states
  const [districts, setDistricts] = useState<CascadingLocation[]>([]);
  const [subdistricts, setSubdistricts] = useState<CascadingLocation[]>([]);
  const [villages, setVillages] = useState<CascadingLocation[]>([]);

  useEffect(() => {
    if (token) {
      fetchRegistrationLink();
    }
  }, [token]);

  const fetchRegistrationLink = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/public/links/${token}`);
      const data = response.data.data;
      
      setLink({
        ...data,
        required_documents: data.required_documents || [],
        provinces: data.provinces || [],
        education_levels: data.education_levels || [],
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Link tidak ditemukan atau sudah expired');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    if (!provinceId) {
      setDistricts([]);
      setSubdistricts([]);
      setVillages([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/public/locations/districts/${provinceId}`);
      setDistricts(response.data.data || []);
      setSubdistricts([]);
      setVillages([]);
      setFormData({ ...formData, district_id: '', subdistrict_id: '', village_id: '' });
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchSubdistricts = async (districtId: string) => {
    if (!districtId) {
      setSubdistricts([]);
      setVillages([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/public/locations/subdistricts/${districtId}`);
      setSubdistricts(response.data.data || []);
      setVillages([]);
      setFormData({ ...formData, subdistrict_id: '', village_id: '' });
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
    }
  };

  const fetchVillages = async (subdistrictId: string) => {
    if (!subdistrictId) {
      setVillages([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/public/locations/villages/${subdistrictId}`);
      setVillages(response.data.data || []);
      setFormData({ ...formData, village_id: '' });
    } catch (error) {
      console.error('Error fetching villages:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle cascading dropdowns
    if (name === 'province_id') fetchDistricts(value);
    if (name === 'district_id') fetchSubdistricts(value);
    if (name === 'subdistrict_id') fetchVillages(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    try {
      setSubmitting(true);
      setError('');

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('link_id', link.id);
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
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

  const requiredDocuments = link.required_documents || [];
  const provinces = link.provinces || [];
  const educationLevels = link.education_levels || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] py-12 px-4">
      <div className="max-w-3xl mx-auto">
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

        {/* Multi-Step Form */}
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

          {/* Step Indicator */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2d3e52] text-[#8fa3b8]'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-[#2d3e52]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Data */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Data Pribadi</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">No. KTP *</label>
                  <input
                    type="text"
                    name="ktp"
                    value={formData.ktp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Pendidikan Terakhir</label>
                  <select
                    name="pendidikan"
                    value={formData.pendidikan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih Pendidikan</option>
                    {educationLevels.map((edu) => (
                      <option key={edu.id} value={edu.name}>
                        {edu.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nama Sekolah/Universitas</label>
                  <input
                    type="text"
                    name="nama_sekolah"
                    value={formData.nama_sekolah}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">No. Ijazah</label>
                  <input
                    type="text"
                    name="no_ijazah"
                    value={formData.no_ijazah}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Tanggal Ijazah</label>
                  <input
                    type="date"
                    name="tgl_ijazah"
                    value={formData.tgl_ijazah}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="pt-4">
                <h4 className="text-md font-semibold text-white mb-4">Alamat Rumah</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Provinsi</label>
                    <select
                      name="province_id"
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Kabupaten</label>
                    <select
                      name="district_id"
                      value={formData.district_id}
                      onChange={handleInputChange}
                      disabled={!formData.province_id}
                      className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Kabupaten</option>
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Kecamatan</label>
                    <select
                      name="subdistrict_id"
                      value={formData.subdistrict_id}
                      onChange={handleInputChange}
                      disabled={!formData.district_id}
                      className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {subdistricts.map((subdist) => (
                        <option key={subdist.id} value={subdist.id}>
                          {subdist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Kelurahan</label>
                    <select
                      name="village_id"
                      value={formData.village_id}
                      onChange={handleInputChange}
                      disabled={!formData.subdistrict_id}
                      className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">Pilih Kelurahan</option>
                      {villages.map((vill) => (
                        <option key={vill.id} value={vill.id}>
                          {vill.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-white text-sm font-medium mb-2">Alamat Rumah</label>
                  <textarea
                    name="alamat_rumah"
                    value={formData.alamat_rumah}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-white text-sm font-medium mb-2">Golongan Darah</label>
                  <select
                    name="golongan_darah"
                    value={formData.golongan_darah}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Pilih Golongan Darah</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Company */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">📞 Kontak & Perusahaan</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">No. WhatsApp *</label>
                  <input
                    type="text"
                    name="wa"
                    value={formData.wa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Instansi/Perusahaan</label>
                  <input
                    type="text"
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Bidang Usaha</label>
                  <input
                    type="text"
                    name="sektor"
                    value={formData.sektor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Alamat Perusahaan</label>
                  <input
                    type="text"
                    name="alamat_perusahaan"
                    value={formData.alamat_perusahaan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Jabatan</label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">No. Telp/Fax Kantor</label>
                  <input
                    type="text"
                    name="tlp_kantor"
                    value={formData.tlp_kantor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-[#1a2332] border border-[#2d3e52] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && requiredDocuments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📄 Dokumen yang Diperlukan</h3>
              <p className="text-[#8fa3b8] text-sm mb-4">Format: PDF, JPG, PNG | Ukuran maksimal: 2MB</p>
              <div className="space-y-3">
                {requiredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 bg-[#1a2332] rounded-lg border border-[#2d3e52]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('File terlalu besar (max 2MB)');
                              return;
                            }
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
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">✓ Ringkasan Data</h3>
              <div className="bg-[#1a2332] rounded-lg p-4 space-y-2 text-sm">
                <p className="text-[#8fa3b8]"><span className="text-white font-medium">Nama:</span> {formData.nama}</p>
                <p className="text-[#8fa3b8]"><span className="text-white font-medium">KTP:</span> {formData.ktp}</p>
                <p className="text-[#8fa3b8]"><span className="text-white font-medium">Email:</span> {formData.email}</p>
                <p className="text-[#8fa3b8]"><span className="text-white font-medium">WhatsApp:</span> {formData.wa}</p>
                <p className="text-[#8fa3b8]"><span className="text-white font-medium">Instansi:</span> {formData.instansi || '-'}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              disabled={currentStep === 1}
            >
              ← Kembali
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Lanjut →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sedang Mengirim...
                  </>
                ) : (
                  <>✓ Daftar Sekarang</>
                )}
              </button>
            )}
          </div>

          {/* WhatsApp Link */}
          {link.whatsapp_link && currentStep === 4 && (
            <div className="p-4 bg-green-500 bg-opacity-10 rounded-lg text-center mt-4">
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
