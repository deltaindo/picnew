'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to admin if token exists
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#0f1619] to-[#1a2332]">
      {/* Navigation */}
      <nav className="bg-[#233347] border-b border-[#2d3e52] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800">
              <span className="text-white font-bold text-lg">Δ</span>
            </div>
            <span className="text-white font-bold text-xl">DELTA Training</span>
          </div>
          <Link href="/admin/login">
            <span className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer">
              Login Admin
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Platform Pendaftaran Pelatihan K3
          </h1>
          <p className="text-xl text-[#8fa3b8] mb-12 leading-relaxed">
            Sistem terpadu untuk mendaftarkan peserta, mengelola dokumen, dan menyelenggarakan pelatihan
            K3 (Kesehatan dan Keselamatan Kerja) dengan mudah dan efisien.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-semibold mb-2">Pendaftaran Mudah</h3>
              <p className="text-[#8fa3b8] text-sm">
                Sistem pendaftaran online yang intuitif dengan verifikasi dokumen otomatis
              </p>
            </div>
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-white font-semibold mb-2">Manajemen Dokumen</h3>
              <p className="text-[#8fa3b8] text-sm">
                Kelola semua dokumen peserta di satu tempat dengan storage aman
              </p>
            </div>
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52]">
              <div className="text-4xl mb-4">📹</div>
              <h3 className="text-white font-semibold mb-2">Notifikasi Real-Time</h3>
              <p className="text-[#8fa3b8] text-sm">
                Email dan WhatsApp otomatis untuk update jadwal dan dokumen
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/admin/login">
              <span className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer">
                🔑 Login Admin
              </span>
            </Link>
            <a
              href="#features"
              className="inline-block px-8 py-4 rounded-lg bg-[#233347] border border-[#2d3e52] text-white font-bold hover:bg-[#2d3e52] transition-all"
            >
              🔍 Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#0f1619] bg-opacity-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Fitur Unggulan 🎦</h2>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h3>
                <ul className="space-y-3 text-[#8fa3b8]">
                  <li>✓ Kelola training programs dan jadwal</li>
                  <li>✓ Monitor registrasi peserta real-time</li>
                  <li>✓ Verifikasi dokumen peserta</li>
                  <li>✓ Upload sertifikat pelatihan</li>
                  <li>✓ Kelola admin users dan permissions</li>
                </ul>
              </div>
              <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] text-4xl text-center">
                👂
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] text-4xl text-center order-2 md:order-1">
                📄
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-white mb-4">Registration Links</h3>
                <ul className="space-y-3 text-[#8fa3b8]">
                  <li>✓ Generate unique token untuk setiap training</li>
                  <li>✓ Customize dokumen yang diperlukan</li>
                  <li>✓ Set kapasitas maksimal peserta</li>
                  <li>✓ Share via QR code atau link</li>
                  <li>✓ Track registrasi real-time</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Trainee Portal</h3>
                <ul className="space-y-3 text-[#8fa3b8]">
                  <li>✓ Registrasi mudah dengan form intuitif</li>
                  <li>✓ Upload dokumen drag & drop</li>
                  <li>✓ Lihat status pendaftaran real-time</li>
                  <li>✓ Download sertifikat setelah training</li>
                  <li>✓ Join WhatsApp group otomatis</li>
                </ul>
              </div>
              <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] text-4xl text-center">
                🎉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] text-center">
              <p className="text-4xl font-bold text-blue-400">19+</p>
              <p className="text-[#8fa3b8] mt-2">Training Programs</p>
            </div>
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] text-center">
              <p className="text-4xl font-bold text-green-400">100+</p>
              <p className="text-[#8fa3b8] mt-2">Peserta per Tahun</p>
            </div>
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] text-center">
              <p className="text-4xl font-bold text-yellow-400">98%</p>
              <p className="text-[#8fa3b8] mt-2">Success Rate</p>
            </div>
            <div className="bg-[#233347] rounded-xl p-6 border border-[#2d3e52] text-center">
              <p className="text-4xl font-bold text-purple-400">24/7</p>
              <p className="text-[#8fa3b8] mt-2">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-12 border border-blue-500 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Siap Memulai? 🎀</h2>
          <p className="text-white opacity-90 mb-8">
            Hubungi tim kami untuk mendaftar atau jika punya pertanyaan tentang platform ini.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="mailto:info@delta-indonesia.com"
              className="px-8 py-3 rounded-lg bg-white text-blue-600 font-bold hover:bg-opacity-90 transition-all"
            >
              📧 Email Kami
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg bg-white bg-opacity-20 border border-white text-white font-bold hover:bg-opacity-30 transition-all"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1619] border-t border-[#2d3e52] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-[#8fa3b8] text-sm">
          <p>© 2025 DELTA Indonesia | Pranenggar Training Center. All rights reserved.</p>
          <p className="mt-4">Platform Pendaftaran Pelatihan K3 yang Aman dan Terpercaya</p>
        </div>
      </footer>
    </div>
  );
}
