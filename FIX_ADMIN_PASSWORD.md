# 🔐 Fix Admin Password - Hash Got Truncated!

## The Problem

**Your password hash was truncated!**

```sql
-- What's in database (WRONG):
password: '.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.'

-- What it should be (CORRECT):
password: '$2b$10$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.'
```

**Why:** The `$` symbols were interpreted by PowerShell and removed!

---

## ⚡ IMMEDIATE FIX

### Option 1: Update Existing User (Fastest)

```powershell
# Use single quotes and escape properly
docker exec -it pic_postgres psql -U postgres -d pic_app -c "UPDATE users SET password = '\$2b\$10\$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.' WHERE email = 'admin@deltaindo.com';"

# Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT id, email, password FROM users;"
```

**The password should now start with `$2b$10$`**

---

### Option 2: Delete and Re-create (Clean)

```powershell
# 1. Delete broken user
docker exec -it pic_postgres psql -U postgres -d pic_app -c "DELETE FROM users WHERE email = 'admin@deltaindo.com';"

# 2. Create new user with escaped hash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "INSERT INTO users (name, email, password, role, status) VALUES ('Admin Delta Indonesia', 'admin@deltaindo.com', '\$2b\$10\$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.', 'admin', 'active');"

# 3. Verify password is correct
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT id, email, LEFT(password, 10) as password_start FROM users;"
# Should show: $2b$10$...
```
---

### Option 3: Use a File (Most Reliable)

Create a SQL file to avoid shell escaping issues:

**1. Create `fix-admin.sql`:**
```sql
-- fix-admin.sql
DELETE FROM users WHERE email = 'admin@deltaindo.com';

INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '$2b$10$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.',
  'admin',
  'active'
);

SELECT 'Admin user fixed!' as status, email, role FROM users WHERE email = 'admin@deltaindo.com';
```

**2. Load it:**
```powershell
# Copy to container
docker cp fix-admin.sql pic_postgres:/tmp/fix-admin.sql

# Execute
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/fix-admin.sql
```

---

## ✅ Verify It Worked

```powershell
# Check password starts correctly
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT id, email, LEFT(password, 10) as pwd_start, LENGTH(password) as pwd_length FROM users;"

# Should show:
#  id |        email         | pwd_start  | pwd_length
# ----+----------------------+------------+------------
#   1 | admin@deltaindo.com  | $2b$10$... |         60
```

**Key checks:**
- ✅ `pwd_start` = `$2b$10$...`
- ✅ `pwd_length` = `60` (bcrypt hashes are always 60 chars)

---

## 🎯 Then Try Login

```
Email: admin@deltaindo.com
Password: admin123
```

---

## 🛠️ Alternative: Generate Fresh Hash

If the provided hash still doesn't work:

```powershell
# Generate new hash
node -e "console.log(require('bcrypt').hashSync('admin123', 10))"

# Copy output, then update:
# docker exec -it pic_postgres psql -U postgres -d pic_app -c "UPDATE users SET password = 'NEW_HASH_HERE' WHERE email = 'admin@deltaindo.com';"
```

---

## 📝 PowerShell Escaping Rules

In PowerShell, `$` is a special character. You must escape it:

```powershell
# ❌ WRONG (PowerShell interprets $2b as variable)
"$2b$10$abc..."

# ✅ CORRECT (escape with backtick)
"`$2b`$10`$abc..."

# ✅ BETTER (use single quotes - no interpretation)
'$2b$10$abc...'

# ✅ BEST (escape in SQL with backslash)
"UPDATE ... SET password = '\$2b\$10\$abc...';"
```

---

## 🚀 Quickest Fix (Copy-Paste)

```powershell
docker exec -it pic_postgres psql -U postgres -d pic_app -c "UPDATE users SET password = '\$2b\$10\$KQl3UfgPquaQuP0wxpr6d.m953s7m7cQcxPp.aCQmw7kh0BIw6XV.' WHERE email = 'admin@deltaindo.com';" && docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT email, LEFT(password,10) as pwd FROM users;"
```

**Look for output:**
```
UPDATE 1
        email         |    pwd     
----------------------+------------
 admin@deltaindo.com  | $2b$10$KQl
```

If you see `$2b$10$`, it worked! Try logging in now.

---

**Run the quickest fix above and tell me what it shows!**
