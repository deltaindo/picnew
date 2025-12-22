-- PostgreSQL Constraints for PIC App
-- Note: CHECK constraints with subqueries not supported in PostgreSQL
-- Use application logic or triggers instead for role enforcement

-- Simple constraint: role must be valid
ALTER TABLE users
ADD CONSTRAINT valid_role 
CHECK (role IN ('admin', 'superadmin'));

-- Simple constraint: status must be valid
ALTER TABLE users
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Training status validation
ALTER TABLE trainings
ADD CONSTRAINT valid_training_status 
CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'));

-- Registration link status validation
ALTER TABLE registration_links
ADD CONSTRAINT valid_link_status 
CHECK (status IN ('active', 'expired', 'closed'));

-- Registration status validation
ALTER TABLE registrations
ADD CONSTRAINT valid_registration_status 
CHECK (status IN ('submitted', 'approved', 'rejected', 'completed'));

-- Document status validation
ALTER TABLE registration_documents
ADD CONSTRAINT valid_document_status 
CHECK (status IN ('uploaded', 'verified', 'rejected'));

-- Notification status validation
ALTER TABLE notifications
ADD CONSTRAINT valid_notification_status 
CHECK (status IN ('pending', 'sent', 'failed'));

-- Notification type validation
ALTER TABLE notifications
ADD CONSTRAINT valid_notification_type 
CHECK (type IN ('email', 'whatsapp'));

-- Ensure dates make sense for trainings
ALTER TABLE trainings
ADD CONSTRAINT valid_training_dates 
CHECK (start_date <= end_date);

-- Ensure expiry date is in future for certificates
ALTER TABLE certificates
ADD CONSTRAINT valid_certificate_dates 
CHECK (issue_date <= expiry_date);

-- IMPORTANT: Application-level enforcement
-- For role enforcement (only 1 admin, 1 superadmin), use:
-- 1. Database triggers (advanced)
-- 2. Application logic in backend (recommended)
-- 3. Unique indexes with partial WHERE clause

-- Create unique indexes for role enforcement (alternative approach)
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_superadmin 
ON users (role) WHERE role = 'superadmin';

CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_admin 
ON users (role) WHERE role = 'admin';
