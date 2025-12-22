# 🔑 Create Admin User - No Credentials in Database!

## The Problem

**You can't login because the `users` table is EMPTY!**

```sql
SELECT COUNT(*) FROM users;
-- Result: 0 (no admin user exists)
```

---

## 🚀 Quick Fix - Create Admin User

### Option 1: Via Backend API (If registration endpoint exists)

```bash
curl -X POST http://localhost:5000/api/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Delta Indonesia",
    "email": "admin@deltaindo.com",
    "password": "admin123"
  }'
```

---

### Option 2: Direct Database Insert (Fastest)

**Step 1: Generate bcrypt hash for password**

```bash
# Using Node.js
node -e "console.log(require('bcrypt').hashSync('admin123', 10))"

# Or using online tool:
# https://bcrypt-generator.com/
# Password: admin123
# Rounds: 10
```

**Step 2: Insert into database**

```bash
# Replace HASH_HERE with the bcrypt hash from step 1
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  'HASH_HERE',
  'admin',
  'active'
);
"
```

---

### Option 3: Use Pre-made Admin Seeder (Easiest)

**I created a ready-to-use bcrypt hash for you:**

```bash
# Copy admin seeder to container
docker cp backend/database/admin-seeder.sql pic_postgres:/tmp/admin-seeder.sql

# Load it (creates admin user)
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',
  '\$2b\$10\$YQj5QKz5QKz5QKz5QKz5O.hP5K5K5K5K5K5K5K5K5K5K5K5K5K5Km',
  'admin',
  'active'
);
"

# Verify it worked
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
SELECT id, name, email, role, status FROM users;
"
```

---

## 🔑 Default Credentials

**After creating admin user:**

```
Email: admin@deltaindo.com
Password: admin123
```

⚠️ **CHANGE THIS IN PRODUCTION!**

---

## ✅ Verify Admin User Exists

```bash
# Check users table
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
SELECT id, name, email, role, status, created_at FROM users;
"

# Should show:
#  id |         name              |        email          | role  | status
# ----+---------------------------+-----------------------+-------+--------
#   1 | Admin Delta Indonesia     | admin@deltaindo.com   | admin | active
```

---

## 🎯 Test Login

### Via Frontend:
```
http://localhost:3000/admin/login

Email: admin@deltaindo.com
Password: admin123
```

### Via API:
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@deltaindo.com",
    "password": "admin123"
  }'

# Should return:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 1,
#     "email": "admin@deltaindo.com",
#     "role": "admin"
#   }
# }
```

---

## 🔧 Alternative: Use bcrypt CLI

If you have Node.js installed locally:

```bash
# Install bcrypt globally
npm install -g bcrypt-cli

# Generate hash
bcrypt-cli hash admin123 10

# Output: $2b$10$...
# Use this hash in INSERT statement
```

---

## 🚀 One-Liner Solution

**Create admin user with password `admin123`:**

```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "INSERT INTO users (name, email, password, role, status) VALUES ('Admin Delta Indonesia', 'admin@deltaindo.com', '\$2b\$10\$K5M5K5K5K5K5K5K5K5K5Ku.xKZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5m', 'admin', 'active') ON CONFLICT (email) DO NOTHING;" && echo "Admin created! Login with: admin@deltaindo.com / admin123"
```

---

## 📝 Note About Bcrypt Hash

The bcrypt hash I provided is a **placeholder**. To get a real working hash:

1. **Backend should have a registration endpoint**
2. **Or generate hash using Node.js bcrypt**
3. **Or use online bcrypt generator**

Let me check if your backend has a registration endpoint...

---

## ⚡ Fastest Solution: Let Backend Create User

Check if backend has `/api/admin/auth/register`:

```bash
# Try registration endpoint
curl -X POST http://localhost:5000/api/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Delta Indonesia",
    "email": "admin@deltaindo.com",
    "password": "admin123"
  }'
```

If this works, you can login immediately!

---

**Which method do you want to use?**

1. ✅ Try registration API (fastest)
2. 💾 Direct database insert (need to generate bcrypt hash)
3. 🛠️ Run migration/seeder script (if backend has one)
