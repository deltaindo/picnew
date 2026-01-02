-- PIC App Database Schema (PostgreSQL 15 Compatible)
-- Fully compatible with PostgreSQL 15 Alpine
-- Column naming: snake_case (standard SQL convention)

-- Users table (Only 1 admin / 1 superadmin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Trainings table
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
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bidang (Sectors) table
CREATE TABLE IF NOT EXISTS bidang (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Classes table
CREATE TABLE IF NOT EXISTS training_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personnel Types table
CREATE TABLE IF NOT EXISTS personnel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Types table
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PIC table
CREATE TABLE IF NOT EXISTS pic (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing table
CREATE TABLE IF NOT EXISTS marketing (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program Type table
CREATE TABLE IF NOT EXISTS program_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    bidang_id INT NOT NULL REFERENCES bidang(id) ON DELETE CASCADE,
    duration_days INT,
    min_participants INT DEFAULT 8,
    max_participants INT DEFAULT 25,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_programs_bidang_id ON training_programs(bidang_id);

-- Registration Links table
CREATE TABLE IF NOT EXISTS registration_links (
    id SERIAL PRIMARY KEY,
    unique_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    training_program_id INT NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    training_class_id INT NOT NULL REFERENCES training_classes(id) ON DELETE CASCADE,
    personnel_type_id INT NOT NULL REFERENCES personnel_types(id) ON DELETE CASCADE,
    created_by_admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pic_id INT REFERENCES pic(id) ON DELETE SET NULL,
    marketing_id INT REFERENCES marketing(id) ON DELETE SET NULL,
    program_type_id INT REFERENCES program_type(id) ON DELETE SET NULL,
    tanggal_pelaksanaan TIMESTAMP,
    tanggal_selesai TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    max_registrations INT,
    current_registrations INT DEFAULT 0,
    expiry_date TIMESTAMP,
    wa_group_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registration_links_training_program_id ON registration_links(training_program_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_created_by_admin_id ON registration_links(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_pic_id ON registration_links(pic_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_marketing_id ON registration_links(marketing_id);
CREATE INDEX IF NOT EXISTS idx_registration_links_program_type_id ON registration_links(program_type_id);

-- Required Documents table
CREATE TABLE IF NOT EXISTS required_documents (
    id SERIAL PRIMARY KEY,
    registration_link_id INT NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
    document_type VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_required_documents_registration_link_id ON required_documents(registration_link_id);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    registration_link_id INT NOT NULL REFERENCES registration_links(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    nik VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date TIMESTAMP,
    blood_type VARCHAR(10),
    education_level VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    address TEXT,
    submission_status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registrations_registration_link_id ON registrations(registration_link_id);

-- Trainee Documents table
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

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    registration_id INT UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    training_name_id VARCHAR(255),
    training_name_en VARCHAR(255),
    issue_date TIMESTAMP NOT NULL,
    validity_years INT DEFAULT 2,
    pdf_file_path TEXT NOT NULL,
    verification_code VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'issued',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON certificates(registration_id);

-- Notifications table
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

-- Audit Logs table
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
