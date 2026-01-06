-- Admin User Seed
-- Direct SQL insert for admin user
-- Email: admin@deltaindo.com
-- Password: admin123 (bcrypt hashed)
-- Run this if the TypeScript seeder fails

INSERT INTO users (email, password, name, phone, role, created_at, updated_at)
VALUES (
  'admin@deltaindo.com',
  '$2b$10$Z3FXBsZ0gCq3E5P1cK9Aq.3QvDFh9V8z2N1L5M6K7O8P9Q0R1S2T3',
  'Admin Delta Indonesia',
  '081234567890',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    name = EXCLUDED.name,
    updated_at = NOW();

-- Verify
SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@deltaindo.com';
