-- PIC App - Admin User Seeder
-- Creates default admin user for development

-- Default Admin User
-- Email: admin@deltaindo.com
-- Password: Admin123!
-- Hashed with bcrypt (12 rounds)

-- Insert admin user (matches Prisma seed)
INSERT INTO users (name, email, password, role, phone, status, created_at, updated_at, last_login)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIQw6YzKgG',  -- Password: Admin123!
  'superadmin',
  '+62812345678',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  updated_at = CURRENT_TIMESTAMP;

-- Verify admin created
SELECT 
  '✓ Admin user ready:' as message, 
  id,
  email, 
  name,
  role,
  status
FROM users 
WHERE email = 'admin@deltaindo.com';

-- Show usage
SELECT '
===========================================
ADMIN LOGIN CREDENTIALS:
===========================================
Email:    admin@deltaindo.com
Password: Admin123!
===========================================
' as "LOGIN INFO";
