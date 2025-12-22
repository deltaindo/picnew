-- Fix Admin Password - Complete Bcrypt Hash
-- This fixes the truncated password hash issue

DELETE FROM users WHERE email = 'admin@deltaindo.com';

INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '$2b$10$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.',
  'admin',
  'active'
);

-- Verify the fix
SELECT 
  'Password fixed!' as status,
  email,
  LEFT(password, 10) as password_start,
  LENGTH(password) as password_length
FROM users 
WHERE email = 'admin@deltaindo.com';
