-- Add complete trainee registration fields to match old system

-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create districts/kabupaten table
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(province_id, name)
);

-- Create subdistricts/kecamatan table
CREATE TABLE IF NOT EXISTS subdistricts (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(district_id, name)
);

-- Create villages/kelurahan table
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  subdistrict_id INTEGER NOT NULL REFERENCES subdistricts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subdistrict_id, name)
);

-- Create education level table
CREATE TABLE IF NOT EXISTS education_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default education levels
INSERT INTO education_levels (name) VALUES 
  ('SD'), ('SMP'), ('SMA/SMK'), ('D3'), ('S1'), ('S2'), ('S3')
ON CONFLICT (name) DO NOTHING;

-- Create document types table
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(500),
  file_types VARCHAR(100) DEFAULT 'pdf,jpg,png',
  max_file_size INTEGER DEFAULT 2097152,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default document types
INSERT INTO document_types (name, description) VALUES
  ('Surat Pernyataan', 'Surat Pernyataan Peserta'),
  ('Ijazah', 'Ijazah Terakhir'),
  ('KTP', 'Fotokopi KTP'),
  ('Surat Keterangan Sehat', 'Surat Keterangan Sehat dari Dokter'),
  ('Pas Foto', 'Pas Foto Berwarna 4x6'),
  ('CV', 'Curriculum Vitae'),
  ('Bukti Transfer', 'Bukti Transfer Pembayaran')
ON CONFLICT (name) DO NOTHING;

-- Create link_required_documents junction table
CREATE TABLE IF NOT EXISTS link_required_documents (
  id SERIAL PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(link_id, document_id)
);

-- Expand registrations table with all fields
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  ktp VARCHAR(20) UNIQUE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  tempat_lahir VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  tanggal_lahir DATE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  pendidikan VARCHAR(100);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  nama_sekolah VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  no_ijazah VARCHAR(100) UNIQUE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  tgl_ijazah DATE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  province_id INTEGER REFERENCES provinces(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  district_id INTEGER REFERENCES districts(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  subdistrict_id INTEGER REFERENCES subdistricts(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  village_id INTEGER REFERENCES villages(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  alamat_rumah VARCHAR(500);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  golongan_darah VARCHAR(10);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  wa VARCHAR(20) UNIQUE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  instansi VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  sektor VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  alamat_perusahaan VARCHAR(500);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  jabatan VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS 
  tlp_kantor VARCHAR(20);

-- Create registration_documents table
CREATE TABLE IF NOT EXISTS registration_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'uploaded',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  notes VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(registration_id, document_type_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_districts_province ON districts(province_id);
CREATE INDEX IF NOT EXISTS idx_subdistricts_district ON subdistricts(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_subdistrict ON villages(subdistrict_id);
CREATE INDEX IF NOT EXISTS idx_link_docs_link ON link_required_documents(link_id);
CREATE INDEX IF NOT EXISTS idx_registration_docs_reg ON registration_documents(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_docs_type ON registration_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(wa);
CREATE INDEX IF NOT EXISTS idx_registrations_ktp ON registrations(ktp);
