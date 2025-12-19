-- PIC App Database Schema

-- Users table (Only 1 admin / 1 superadmin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin' or 'superadmin'
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Trainings (Jadwal Pelatihan)
CREATE TABLE IF NOT EXISTS trainings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration_days INT,
    max_participants INT DEFAULT 25,
    current_participants INT DEFAULT 0,
    instructor VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'ongoing', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bidang (Sectors)
CREATE TABLE IF NOT EXISTS bidang (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Personnel Types
CREATE TABLE IF NOT EXISTS personnel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Document Types
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Registration Links (Auto-generated with unique token)
CREATE TABLE IF NOT EXISTS registration_links (
    id SERIAL PRIMARY KEY,
    token VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated unique token
    training_id INT NOT NULL REFERENCES trainings(id),
    class_level VARCHAR(255),
    personnel_type VARCHAR(255),
    max_registrations INT DEFAULT 25,
    current_registrations INT DEFAULT 0,
    expiry_date TIMESTAMP,
    whatsapp_link TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_registration_links_token ON registration_links(token);
CREATE INDEX idx_registration_links_training_id ON registration_links(training_id);

-- Registrations (Trainee form submissions)
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    link_id INT NOT NULL REFERENCES registration_links(id),
    trainee_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    address TEXT,
    company VARCHAR(255),
    position VARCHAR(255),
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'approved', 'rejected', 'completed'
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_registrations_link_id ON registrations(link_id);
CREATE INDEX idx_registrations_email ON registrations(email);

-- Registration Documents
CREATE TABLE IF NOT EXISTS registration_documents (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES registrations(id),
    document_type VARCHAR(100) NOT NULL, -- 'surat', 'ijazah', 'ktp', 'sk', 'foto', 'bukti'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT,
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'verified', 'rejected'
    verification_note TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE INDEX idx_registration_documents_registration_id ON registration_documents(registration_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES registrations(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    file_path TEXT,
    issue_date DATE,
    expiry_date DATE,
    verification_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificates_registration_id ON certificates(registration_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id),
    type VARCHAR(50) NOT NULL, -- 'email', 'whatsapp'
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_registration_id ON notifications(registration_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default master data
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
ON CONFLICT (name) DO NOTHING;

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
ON CONFLICT (name) DO NOTHING;

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
ON CONFLICT (name) DO NOTHING;

INSERT INTO document_types (name, code) VALUES 
('Surat Rekomendasi', 'SURAT'),
('Ijazah/Sertifikat', 'IJAZAH'),
('Fotokopi KTP', 'KTP'),
('Surat Keputusan', 'SK'),
('Foto 4x6', 'FOTO'),
('Bukti Pengalaman', 'BUKTI')
ON CONFLICT (name) DO NOTHING;
