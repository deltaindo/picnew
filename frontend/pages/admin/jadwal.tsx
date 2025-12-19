'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Training {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  duration_days: number;
  max_participants: number;
  current_participants: number;
  instructor: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export default function JadwalPage() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/training`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
      case 'ongoing':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
      case 'completed':
        return 'bg-green-500 bg-opacity-20 text-green-400';
      case 'cancelled':
        return 'bg-red-500 bg-opacity-20 text-red-400';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '📅 Terjadwal';
      case 'ongoing':
        return '🔼 Sedang Berlangsung';
      case 'completed':
        return '✓ Selesai';
      case 'cancelled':
        return '✗ Dibatalkan';
      default:
        return status;
    }
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-[#8fa3b8]">Loading jadwal pelatihan...</p>
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
          <h1 className="text-3xl font-bold text-white">Jadwal Pelatihan 📅</h1>
          <p className="text-[#8fa3b8] mt-1">Lihat dan kelola jadwal semua program pelatihan</p>
        </div>

        {/* Month Selector */}
        <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
            >
              ← Sebelumnya
            </button>
            <span className="text-white font-semibold text-lg">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors"
            >
              Berikutnya →
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedMonth(new Date().getMonth());
              setSelectedYear(new Date().getFullYear());
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Hari Ini
          </button>
        </div>

        {/* Trainings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#8fa3b8] text-lg">Tidak ada pelatihan dijadwalkan</p>
            </div>
          ) : (
            trainings.map((training) => {
              const startDate = new Date(training.start_date);
              const endDate = new Date(training.end_date);
              const isThisMonth = startDate.getMonth() === selectedMonth && startDate.getFullYear() === selectedYear;

              return (
                <div
                  key={training.id}
                  className={`bg-[#233347] rounded-xl p-6 border-2 transition-all ${
                    isThisMonth ? 'border-blue-600' : 'border-[#2d3e52]'
                  } hover:border-blue-600`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{training.name}</h3>
                      <p className="text-[#8fa3b8] text-sm mt-1">Instruktur: {training.instructor}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(training.status)}`}>
                      {getStatusLabel(training.status)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Dates */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-1">📅</span>
                      <div>
                        <p className="text-[#8fa3b8] text-sm">Tanggal</p>
                        <p className="text-white text-sm font-medium">
                          {startDate.toLocaleDateString('id-ID')} - {endDate.toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-1">⏱️</span>
                      <div>
                        <p className="text-[#8fa3b8] text-sm">Durasi</p>
                        <p className="text-white text-sm font-medium">{training.duration_days} hari</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-1">📍</span>
                      <div>
                        <p className="text-[#8fa3b8] text-sm">Lokasi</p>
                        <p className="text-white text-sm font-medium">{training.location}</p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-1">👥</span>
                      <div>
                        <p className="text-[#8fa3b8] text-sm">Peserta</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-[#1a2332] rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(training.current_participants / training.max_participants) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-white text-sm font-medium">
                            {training.current_participants}/{training.max_participants}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {training.description && (
                    <p className="text-[#8fa3b8] text-sm mt-4 line-clamp-2">{training.description}</p>
                  )}

                  {/* Action Button */}
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                    Lihat Detail
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
