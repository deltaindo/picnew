-- PIC App - Training Programs Seeder
-- Insert 19 K3 Training Programs + Master Data

-- Insert Bidang (Sectors) if not already seeded in schema
INSERT INTO bidang (name, code) VALUES 
('PAA', 'PAA'),
('AK3U', 'AK3U'),
('ELEVATOR', 'ELEVATOR'),
('LISTRIK', 'LISTRIK'),
('KEBAKARAN', 'KEBAKARAN'),
('KETINGGIAN', 'KETINGGIAN'),
('TENAGA', 'TENAGA'),
('KONSTRUKSI', 'KONSTRUKSI'),
('UAP', 'UAP'),
('LINGKUNGAN', 'LINGKUNGAN'),
('KESEHATAN', 'KESEHATAN'),
('PENGELASAN', 'PENGELASAN'),
('MANAJEMEN K3', 'MANAJEMEN')
ON CONFLICT DO NOTHING;

-- Insert Classes if not already seeded
INSERT INTO classes (name, code) VALUES 
('AHLI', 'AHLI'),
('SUPERVISI', 'SUPERVISI'),
('TEKNISI', 'TEKNISI'),
('OPERATOR', 'OPERATOR'),
('KELAS A', 'KELAS_A'),
('KELAS B', 'KELAS_B'),
('KELAS C', 'KELAS_C'),
('KELAS D', 'KELAS_D'),
('PETUGAS', 'PETUGAS'),
('UTAMA', 'UTAMA'),
('MADYA', 'MADYA')
ON CONFLICT DO NOTHING;

-- Insert Personnel Types if not already seeded
INSERT INTO personnel_types (name, code) VALUES 
('OPERATOR', 'OPERATOR'),
('JURU', 'JURU'),
('TEKNISI', 'TEKNISI'),
('AHLI K3', 'AHLI_K3'),
('SUPERVISI', 'SUPERVISI'),
('PETUGAS', 'PETUGAS'),
('MANTRI', 'MANTRI'),
('INSPECTOR', 'INSPECTOR'),
('PENGUJI', 'PENGUJI'),
('KEPALA', 'KEPALA'),
('MANAGER', 'MANAGER'),
('KOORDINATOR', 'KOORDINATOR'),
('STAFF', 'STAFF')
ON CONFLICT DO NOTHING;

-- Insert Document Types if not already seeded
INSERT INTO document_types (name, code) VALUES 
('Surat Rekomendasi', 'SURAT'),
('Ijazah/Sertifikat', 'IJAZAH'),
('Fotokopi KTP', 'KTP'),
('Surat Keputusan', 'SK'),
('Foto 4x6', 'FOTO'),
('Bukti Pengalaman', 'BUKTI')
ON CONFLICT DO NOTHING;

-- Insert 19 Training Programs
INSERT INTO trainings (name, description, start_date, end_date, location, duration_days, max_participants, instructor, status) VALUES
(
  'AHLI K3 UMUM',
  'Program pelatihan Ahli K3 Umum - Sertifikasi Nasional',
  '2026-01-19',
  '2026-02-03',
  'Bekasi Training Center',
  16,
  25,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'AUDITOR SMK3',
  'Program pelatihan Auditor Sistem Manajemen K3',
  '2026-02-09',
  '2026-02-13',
  'Bekasi Training Center',
  5,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 LISTRIK',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Kelistrikan',
  '2026-02-16',
  '2026-02-20',
  'Bekasi Training Center',
  5,
  25,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 KONSTRUKSI',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Konstruksi',
  '2026-02-23',
  '2026-02-27',
  'Bekasi Training Center',
  5,
  25,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 ELEVATOR ESKALATOR',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Elevator dan Eskalator',
  '2026-03-02',
  '2026-03-06',
  'Bekasi Training Center',
  5,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 KEBAKARAN',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Pencegahan Kebakaran',
  '2026-03-09',
  '2026-03-11',
  'Bekasi Training Center',
  3,
  25,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 PAA',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Pesawat Angkut dan Angkat',
  '2026-03-16',
  '2026-03-17',
  'Bekasi Training Center',
  2,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 PTP',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Pekerjaan Tambang dan Permukaan',
  '2026-03-23',
  '2026-03-27',
  'Bekasi Training Center',
  5,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 PUBT',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Penerbangan Udara Barang Terbang',
  '2026-03-30',
  '2026-04-03',
  'Bekasi Training Center',
  5,
  15,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 LAS',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Pengelasan',
  '2026-04-06',
  '2026-04-10',
  'Bekasi Training Center',
  5,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 KIMIA',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Bahan Kimia',
  '2026-04-13',
  '2026-04-17',
  'Bekasi Training Center',
  5,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 RUANG TERBATAS',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Ruang Terbatas',
  '2026-04-20',
  '2026-04-21',
  'Bekasi Training Center',
  2,
  15,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 PEKERJAAN KETINGGIAN',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Pekerjaan Ketinggian',
  '2026-04-27',
  '2026-04-29',
  'Bekasi Training Center',
  3,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'K3 KESEHATAN KERJA',
  'Program pelatihan Keselamatan dan Kesehatan Kerja Kesehatan Kerja',
  '2026-05-04',
  '2026-05-07',
  'Bekasi Training Center',
  4,
  25,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'TKBT 1',
  'Program pelatihan Teknisi Keselamatan Boiler Tingkat 1',
  '2026-05-11',
  '2026-05-14',
  'Bekasi Training Center',
  4,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'TKBT 2',
  'Program pelatihan Teknisi Keselamatan Boiler Tingkat 2',
  '2026-05-18',
  '2026-05-20',
  'Bekasi Training Center',
  3,
  20,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'TKPK 1',
  'Program pelatihan Teknisi Keselamatan Pipa Kukus Tingkat 1',
  '2026-05-25',
  '2026-05-28',
  'Bekasi Training Center',
  4,
  15,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'TKPK 2',
  'Program pelatihan Teknisi Keselamatan Pipa Kukus Tingkat 2',
  '2026-06-01',
  '2026-06-04',
  'Bekasi Training Center',
  4,
  15,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
),
(
  'TKPK 3',
  'Program pelatihan Teknisi Keselamatan Pipa Kukus Tingkat 3',
  '2026-06-08',
  '2026-06-10',
  'Bekasi Training Center',
  3,
  15,
  'Tim Instruktur Delta Indonesia',
  'scheduled'
)
ON CONFLICT DO NOTHING;

-- Verify seeding
SELECT 'Trainings seeded:' as message, COUNT(*) as total FROM trainings;
SELECT 'Bidang seeded:' as message, COUNT(*) as total FROM bidang;
SELECT 'Classes seeded:' as message, COUNT(*) as total FROM classes;
SELECT 'Personnel Types seeded:' as message, COUNT(*) as total FROM personnel_types;
SELECT 'Document Types seeded:' as message, COUNT(*) as total FROM document_types;
