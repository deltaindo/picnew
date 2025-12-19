'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ConfirmationPage() {
  const router = useRouter();
  const { token } = router.query;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#0f1619] flex items-center justify-center p-4">
      <div className="bg-[#233347] rounded-xl p-8 border border-[#2d3e52] max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 bg-opacity-20 mb-6">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Pendaftaran Berhasil!</h1>
        <p className="text-[#8fa3b8] mb-6">
          Terima kasih telah mendaftar. Email konfirmasi telah dikirim ke alamat email Anda.
        </p>

        {/* Info Box */}
        <div className="bg-[#1a2332] rounded-lg p-4 mb-6 text-left">
          <h3 className="text-white font-semibold mb-3">📋 Langkah Selanjutnya:</h3>
          <ul className="space-y-2 text-[#8fa3b8] text-sm">
            <li>✓ Cek email untuk konfirmasi pendaftaran</li>
            <li>✓ Ikuti link WhatsApp group untuk update training</li>
            <li>✓ Admin akan memverifikasi dokumen Anda</li>
            <li>✓ Hadir tepat waktu pada hari pertama training</li>
          </ul>
        </div>

        {/* Countdown */}
        <p className="text-[#8fa3b8] text-sm mb-6">
          Redirecting ke beranda dalam <span className="font-bold text-blue-400">{countdown}</span> detik...
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => router.push(`/register/${token}`)}
            className="flex-1 px-4 py-2 bg-[#2d3e52] hover:bg-[#3a4d62] text-white rounded-lg transition-colors font-semibold"
          >
            Kembali ke Form
          </button>
        </div>
      </div>
    </div>
  );
}
