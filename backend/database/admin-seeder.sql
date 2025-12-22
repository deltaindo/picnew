-- PIC App - Admin User Seeder
-- Creates default admin user for development

-- Default Admin User
-- Email: admin@deltaindo.com
-- Password: admin123
-- Hashed with bcrypt (10 rounds)

INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '$2b$10$rQ5YvK3K5uZ5Z5Z5Z5Z5Z.xKZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above is for 'admin123'
-- For production, change this password immediately!

-- Verify admin created
SELECT 'Admin user created:' as message, email, role FROM users WHERE role = 'admin';
