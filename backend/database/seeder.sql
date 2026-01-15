-- PIC App - Master Data Seeder
-- Insert Bidang (Sectors), Training Programs, Classes, Personnel Types, Document Types
-- Uses snake_case table and column names per Prisma schema mapping

-- Insert Bidang (Sectors) if not already seeded
INSERT INTO bidangs (name, description, created_at, updated_at) VALUES 
('PAA (PESAWAT ANGKAT DAN ANGKUT)', 'Keselamatan Pesawat Angkat dan Angkut', NOW(), NOW()),
('AK3U (KEAHLIAN K3 UMUM)', 'Keahlian Keselamatan dan Kesehatan Kerja Umum', NOW(), NOW()),
('ELEVATOR DAN ESKALATOR', 'Keselamatan Elevator dan Eskalator', NOW(), NOW()),
('LISTRIK', 'Keselamatan dan Kesehatan Kerja Kelistrikan', NOW(), NOW()),
('PENANGGULANGAN KEBAKARAN', 'Pencegahan dan Penanggulangan Kebakaran', NOW(), NOW()),
('BEKERJA PADA KETINGGIAN', 'Keselamatan Bekerja pada Ketinggian', NOW(), NOW()),
('PESAWAT TENAGA DAN PRODUKSI', 'Keselamatan Pesawat Tenaga dan Produksi', NOW(), NOW()),
('KONSTRUKSI DAN BANGUNAN', 'Keselamatan Konstruksi dan Bangunan', NOW(), NOW()),
('PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', 'Keselamatan Pesawat Uap dan Bejana Tekanan', NOW(), NOW()),
('LINGKUNGAN KERJA DAN BAHAN BERBAHAYA', 'Keselamatan Lingkungan Kerja dan B3', NOW(), NOW()),
('KESEHATAN KERJA', 'Kesehatan dan Higiene Kerja', NOW(), NOW()),
('PENGELASAN', 'Keselamatan Pengelasan', NOW(), NOW()),
('SISTEM MANAJEMEN K3', 'Sistem Manajemen Keselamatan dan Kesehatan Kerja', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Training Programs (with bidang_id references)
INSERT INTO training_programs (name, description, bidang_id, duration_days, min_participants, max_participants, status, created_at, updated_at)
SELECT 
  tp.name,
  tp.description,
  b.id as bidang_id,
  tp.duration_days,
  8 as min_participants,
  25 as max_participants,
  'active' as status,
  NOW(),
  NOW()
FROM (
  VALUES
    ('AHLI K3 UMUM', 'Pelatihan Ahli Keselamatan dan Kesehatan Kerja Umum', 'AK3U (KEAHLIAN K3 UMUM)', 12),
    ('AUDITOR SMK3', 'Pelatihan Auditor Sistem Manajemen K3', 'SISTEM MANAJEMEN K3', 5),
    ('K3 KONSTRUKSI', 'Pelatihan K3 Konstruksi dan Bangunan', 'KONSTRUKSI DAN BANGUNAN', 5),
    ('K3 LISTRIK', 'Pelatihan K3 Kelistrikan', 'LISTRIK', 5),
    ('K3 ELEVATOR ESKALATOR', 'Pelatihan K3 Elevator dan Eskalator', 'ELEVATOR DAN ESKALATOR', 4),
    ('K3 KEBAKARAN', 'Pelatihan K3 Penanggulangan Kebakaran', 'PENANGGULANGAN KEBAKARAN', 4),
    ('K3 PAA', 'Pelatihan K3 Pesawat Angkat dan Angkut', 'PAA (PESAWAT ANGKAT DAN ANGKUT)', 5),
    ('K3 PTP', 'Pelatihan K3 Pesawat Tenaga dan Produksi', 'PESAWAT TENAGA DAN PRODUKSI', 5),
    ('K3 PUBT', 'Pelatihan K3 Pesawat Uap dan Bejana Tekanan', 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', 5),
    ('K3 LAS', 'Pelatihan K3 Pengelasan', 'PENGELASAN', 3),
    ('K3 KIMIA', 'Pelatihan K3 Bahan Kimia Berbahaya', 'LINGKUNGAN KERJA DAN BAHAN BERBAHAYA', 4),
    ('K3 RUANG TERBATAS', 'Pelatihan K3 Bekerja di Ruang Terbatas', 'LINGKUNGAN KERJA DAN BAHAN BERBAHAYA', 2),
    ('K3 PEKERJAAN PADA KETINGGIAN', 'Pelatihan K3 Bekerja pada Ketinggian', 'BEKERJA PADA KETINGGIAN', 3),
    ('K3 KESEHATAN KERJA', 'Pelatihan Kesehatan dan Higiene Kerja', 'KESEHATAN KERJA', 4),
    ('TKBT 2', 'Teknisi Keselamatan Bejana Tekan Tingkat 2', 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', 5),
    ('TKBT 1', 'Teknisi Keselamatan Bejana Tekan Tingkat 1', 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', 4),
    ('TKPK 1', 'Teknisi Keselamatan Pesawat Khusus Tingkat 1', 'PAA (PESAWAT ANGKAT DAN ANGKUT)', 4),
    ('TKPK 2', 'Teknisi Keselamatan Pesawat Khusus Tingkat 2', 'PAA (PESAWAT ANGKAT DAN ANGKUT)', 5)
) AS tp(name, description, bidang_name, duration_days)
JOIN bidangs b ON b.name = tp.bidang_name
WHERE NOT EXISTS (
  SELECT 1 FROM training_programs WHERE name = tp.name
);

-- Insert Training Classes
INSERT INTO training_classes (name, level, created_at, updated_at) VALUES 
('AHLI', 3, NOW(), NOW()),
('SUPERVISI SCAFFOLDING', 3, NOW(), NOW()),
('TEKNISI SCAFFOLDING', 2, NOW(), NOW()),
('TEKNISI', 2, NOW(), NOW()),
('KELAS A', 1, NOW(), NOW()),
('KELAS B', 2, NOW(), NOW()),
('KELAS C', 3, NOW(), NOW()),
('KELAS D', 4, NOW(), NOW()),
('OPERATOR', 2, NOW(), NOW()),
('TEKNISI PESAWAT UAP', 2, NOW(), NOW()),
('TEKNISI BEJANA TEKAN DAN TANGKI TIMBUN', 2, NOW(), NOW()),
('KELAS I', 1, NOW(), NOW()),
('KELAS II', 2, NOW(), NOW()),
('KELAS III', 3, NOW(), NOW()),
('PETUGAS', 1, NOW(), NOW()),
('UTAMA', 3, NOW(), NOW()),
('MADYA', 2, NOW(), NOW()),
('REGU PENYELAMAT', 2, NOW(), NOW()),
('TKBT 2', 2, NOW(), NOW()),
('TKPK 1', 1, NOW(), NOW()),
('TKPK 2', 2, NOW(), NOW()),
('TEKNISI & OPERATOR', 2, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Personnel Types
INSERT INTO personnel_types (name, created_at, updated_at) VALUES 
('OPERATOR MESIN', NOW(), NOW()),
('PEKERJA KONSTRUKSI', NOW(), NOW()),
('TEKNISI MESIN', NOW(), NOW()),
('SUPERVISOR K3', NOW(), NOW()),
('AHLI K3', NOW(), NOW()),
('PETUGAS KEBAKARAN', NOW(), NOW()),
('TEKNISI LISTRIK', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Document Types
INSERT INTO document_types (name, created_at, updated_at) VALUES 
('Sertifikat Pelatihan', NOW(), NOW()),
('Ijazah', NOW(), NOW()),
('KTP', NOW(), NOW()),
('Surat Keterangan Kerja', NOW(), NOW()),
('Pas Foto', NOW(), NOW()),
('Surat Keterangan Sehat', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert PIC (Person In Charge)
INSERT INTO pics (name, created_at, updated_at) VALUES 
('Ghaida Trisnanda', NOW(), NOW()),
('Yuyun', NOW(), NOW()),
('Echasita', NOW(), NOW()),
('Erje', NOW(), NOW()),
('Nur Afidah', NOW(), NOW()),
('Hafid', NOW(), NOW()),
('Daniel Setiono', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Marketing Personnel
INSERT INTO marketings (name, created_at, updated_at) VALUES 
('Agustyani', NOW(), NOW()),
('Atikah', NOW(), NOW()),
('Anik', NOW(), NOW()),
('Yoppi', NOW(), NOW()),
('Intang', NOW(), NOW()),
('Hafid', NOW(), NOW()),
('Ali M', NOW(), NOW()),
('Erje', NOW(), NOW()),
('Indri', NOW(), NOW()),
('Bayu', NOW(), NOW()),
('Yunny', NOW(), NOW()),
('Eko', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Program Types
INSERT INTO program_types (name, description, created_at, updated_at) VALUES 
('Reguler', 'Program Reguler', NOW(), NOW()),
('Inhouse', 'Program Inhouse', NOW(), NOW()),
('BNSP', 'Program BNSP', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify seeding
SELECT 'Master data seeded successfully!' as status;
SELECT COUNT(*) as bidang_count FROM bidangs;
SELECT COUNT(*) as training_programs_count FROM training_programs;
SELECT COUNT(*) as training_classes_count FROM training_classes;
SELECT COUNT(*) as personnel_types_count FROM personnel_types;
SELECT COUNT(*) as document_types_count FROM document_types;
SELECT COUNT(*) as pics_count FROM pics;
SELECT COUNT(*) as marketings_count FROM marketings;
SELECT COUNT(*) as program_types_count FROM program_types;
