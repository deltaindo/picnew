-- PIC App - Admin User Seeder
-- Creates default admin user for development
-- Matches Prisma User model with camelCase columns

-- Default Admin User
-- Email: admin@deltaindo.com
-- Password: Admin123!
-- Hashed with bcrypt (12 rounds)

-- Insert admin user (matches Prisma User model)
INSERT INTO users (name, email, password, phone, role, createdAt, updatedAt, lastLogin)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIQw6YzKgG',  -- Password: Admin123!
  '+62812345678',
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  updatedAt = CURRENT_TIMESTAMP;

-- Verify admin created
SELECT 
  '✓ Admin user ready:' as message, 
  id,
  email, 
  name,
  role
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
