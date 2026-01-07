-- PIC App Database Schema (PostgreSQL 15 Compatible)
-- Generated from Prisma schema with snake_case column/table names
-- Timestamp: 2026-01-07

-- Users table (Admin accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin',
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Provinces table (Level 1 - Provinsi)
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provinces_code ON provinces(code);
CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);

-- Regencies table (Level 2 - Kabupaten/Kota)
CREATE TABLE IF NOT EXISTS regencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'regency',
    province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, province_id)
);

CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_regencies_code ON regencies(code);
CREATE INDEX IF NOT EXISTS idx_regencies_name ON regencies(name);
CREATE INDEX IF NOT EXISTS idx_regencies_type ON regencies(type);

-- Districts table (Level 3 - Kecamatan)
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    regency_id INT NOT NULL REFERENCES regencies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, regency_id)
);

CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- Villages table (Level 4 - Desa/Kelurahan)
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'village',
    district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, district_id)
);

CREATE INDEX IF NOT EXISTS idx_villages_district_id ON villages(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_code ON villages(code);
CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);
CREATE INDEX IF NOT EXISTS idx_villages_type ON villages(type);

-- Bidang (Sectors/Fields)
CREATE TABLE IF NOT EXISTS bidangs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    bidang_id INT NOT NULL REFERENCES bidangs(id) ON DELETE CASCADE,
    duration_days INT NOT NULL,
    min_participants INT DEFAULT 8,
    max_participants INT DEFAULT 25,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_programs_bidang_id ON training_programs(bidang_id);

-- Training Classes
CREATE TABLE IF NOT EXISTS training_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personnel Types
CREATE TABLE IF NOT EXISTS personnel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Types
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    bidang_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PIC (Person In Charge)
CREATE TABLE IF NOT EXISTS pics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pics_name ON pics(name);

-- Marketing
CREATE TABLE IF NOT EXISTS marketings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketings_name ON marketings(name);

-- Program Types
CREATE TABLE IF NOT EXISTS program_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_program_types_name ON program_types(name);

-- Registration Links
CREATE TABLE IF NOT EXISTS registration_links (
    id SERIAL PRIMARY KEY,
    unique_token VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    training_program_id INT NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    training_class_id INT NOT NULL REFERENCES training_classes(id) ON DELETE CASCADE,
    personnel_type_id INT NOT NULL REFERENCES personnel_types(id) ON DELETE CASCADE,
    created_by_admin_id INT NOT NULL REFERENCES users(id),
    pic_id INT REFERENCES pics(id) ON DELETE SET NULL,
    marketing_id INT REFERENCES marketings(id) ON DELETE SET NULL,
    program_type_id INT REFERENCES program_types(id) ON DELETE SET NULL,
    tanggal_pelaksanaan TIMESTAMP,
    tanggal_selesai TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    max_registrations INT NOT NULL,
    current_registrations INT DEFAULT 0,
    expiry_date TIMESTAMP NOT NULL,
    wa_group_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registration_links_training_program_id ON registration_links(training_program_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_created_by_admin_id ON registration_links(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_pic_id ON registration_links(pic_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_marketing_id ON registration_links(marketing_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_program_type_id ON registration_links(program_type_id);

-- Required Documents
CREATE TABLE IF NOT EXISTS required_documents (
    id SERIAL PRIMARY KEY,
    registration_link_id INT NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
    document_type VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_required_documents_registration_link_id ON required_documents(registration_link_id);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    registration_link_id INT NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    nik VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date TIMESTAMP,
    blood_type VARCHAR(5),
    education_level VARCHAR(100),
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    address TEXT,
    submission_status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registrations_registration_link_id ON registrations(registration_link_id);

-- Trainee Documents
CREATE TABLE IF NOT EXISTS trainee_documents (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    document_type VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    upload_status VARCHAR(50) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trainee_documents_registration_id ON trainee_documents(registration_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    registration_id INT UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    certificate_number VARCHAR(255) UNIQUE NOT NULL,
    training_name_id VARCHAR(255),
    training_name_en VARCHAR(255),
    issue_date TIMESTAMP NOT NULL,
    validity_years INT DEFAULT 2,
    pdf_file_path TEXT NOT NULL,
    verification_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'issued',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON certificates(registration_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_registration_id ON notifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
