-- PIC App - Update Admin Password
-- Changes admin password from 'Admin123!' to 'admin123'
-- New hash: $2a$12$eImiTXuWVxfaHNYY8ChLLu52yK4V8.pl3x/q7l8R/XtQKLMUJQnDi

UPDATE users
SET 
  password = '$2a$12$eImiTXuWVxfaHNYY8ChLLu52yK4V8.pl3x/q7l8R/XtQKLMUJQnDi',
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@deltaindo.com';

-- Verify update
SELECT 
  '✓ Admin password updated:' as status, 
  id,
  email, 
  name,
  role,
  updated_at
FROM users 
WHERE email = 'admin@deltaindo.com';

SELECT '
===========================================
NEW ADMIN LOGIN CREDENTIALS:
===========================================
Email:    admin@deltaindo.com
Password: admin123
===========================================
' as "LOGIN INFO";
