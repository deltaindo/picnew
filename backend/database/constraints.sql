-- Enhanced constraints to enforce 1 admin + 1 superadmin

-- Unique constraint: only 1 superadmin
ALTER TABLE users ADD CONSTRAINT only_one_superadmin
CHECK (
  (role = 'superadmin' AND (SELECT COUNT(*) FROM users WHERE role = 'superadmin') <= 1) 
  OR role != 'superadmin'
);

-- Unique constraint: only 1 admin
ALTER TABLE users ADD CONSTRAINT only_one_admin
CHECK (
  (role = 'admin' AND (SELECT COUNT(*) FROM users WHERE role = 'admin') <= 1) 
  OR role != 'admin'
);

-- Ensure at least one user must exist with admin role
ALTER TABLE users ADD CONSTRAINT min_one_admin_required
CHECK (
  (SELECT COUNT(*) FROM users WHERE role IN ('admin', 'superadmin')) >= 1
);
