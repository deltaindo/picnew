-- PostgreSQL Constraints for PIC App
-- Note: Constraints reference actual tables from schema.sql
-- All tables use snake_case names per Prisma @map mappings

-- ============ USERS TABLE CONSTRAINTS ============

-- Simple constraint: role must be valid
ALTER TABLE users
ADD CONSTRAINT valid_role 
CHECK (role IN ('admin', 'superadmin'));

-- Simple constraint: status must be valid
ALTER TABLE users
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'suspended'));

-- ============ TRAINING PROGRAMS CONSTRAINTS ============

-- Training program status validation
ALTER TABLE training_programs
ADD CONSTRAINT valid_training_program_status 
CHECK (status IN ('active', 'inactive', 'archived'));

-- ============ REGISTRATION LINKS CONSTRAINTS ============

-- Registration link status validation
ALTER TABLE registration_links
ADD CONSTRAINT valid_registration_link_status 
CHECK (status IN ('active', 'expired', 'filled', 'closed'));

-- ============ REGISTRATIONS CONSTRAINTS ============

-- Registration status validation
ALTER TABLE registrations
ADD CONSTRAINT valid_registration_status 
CHECK (submission_status IN ('submitted', 'incomplete', 'approved', 'rejected', 'completed'));

-- ============ TRAINEE DOCUMENTS CONSTRAINTS ============

-- Document upload status validation
ALTER TABLE trainee_documents
ADD CONSTRAINT valid_trainee_document_upload_status 
CHECK (upload_status IN ('uploaded', 'verified', 'rejected'));

-- ============ NOTIFICATIONS CONSTRAINTS ============

-- Notification status validation
ALTER TABLE notifications
ADD CONSTRAINT valid_notification_status 
CHECK (status IN ('pending', 'sent', 'failed'));

-- Notification type validation
ALTER TABLE notifications
ADD CONSTRAINT valid_notification_type 
CHECK (type IN ('email', 'whatsapp'));

-- ============ CERTIFICATES CONSTRAINTS ============

-- Certificate status validation
ALTER TABLE certificates
ADD CONSTRAINT valid_certificate_status 
CHECK (status IN ('issued', 'pending', 'revoked'));

-- ============ ROLE ENFORCEMENT (APPLICATION LEVEL RECOMMENDED) ============

-- Create unique indexes for role enforcement
-- NOTE: This enforces only 1 superadmin and 1 admin can exist
-- Use application logic to enforce more complex rules

CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_superadmin 
ON users (role) WHERE role = 'superadmin';

CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_admin 
ON users (role) WHERE role = 'admin';
