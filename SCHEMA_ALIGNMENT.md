# Schema Alignment Summary

**Date**: 2026-01-02  
**Status**: ✅ Aligned - Prisma is source of truth  
**Naming Convention**: camelCase (Prisma standard)

---

## Architecture Decision

**Prisma Schema** → **Source of Truth**

This means:
- Prisma `schema.prisma` defines the data model (camelCase fields)
- SQL `schema.sql` is generated/updated to match Prisma
- Backend uses Prisma ORM (reads from schema.prisma)
- Frontend uses same credentials and respects Prisma's field names

---

## User Model Alignment

### Prisma Schema (backend/prisma/schema.prisma)
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String
  phone     String?              // ← INCLUDED
  role      String    @default("admin")
  lastLogin DateTime?             // camelCase, NO @map
  createdAt DateTime  @default(now())  // camelCase, NO @map
  updatedAt DateTime  @updatedAt        // camelCase, NO @map

  @@map("users")
}
```

### SQL Schema (backend/database/schema.sql)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),              -- ← INCLUDED
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    lastLogin TIMESTAMP,            -- camelCase to match Prisma
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Point**: SQL uses camelCase column names to match Prisma exactly.

### Admin Seeder (backend/database/admin-seeder.sql)
```sql
INSERT INTO users 
  (name, email, password, phone, role, createdAt, updatedAt, lastLogin)
VALUES (
  'Admin Delta Indonesia',
  'admin@deltaindo.com',      -- ← FIXED EMAIL
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIQw6YzKgG',
  '+62812345678',             -- ← phone field
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  NULL
);
```

**Credentials:**
- Email: `admin@deltaindo.com`
- Password: `Admin123!`
- Phone: `+62812345678`

### Frontend Login (frontend/pages/admin/login.tsx)
```typescript
const [email, setEmail] = useState('admin@deltaindo.com');      // ← MATCHES SEEDER
const [password, setPassword] = useState('Admin123!');
```

**Credentials shown in UI:**
- Email: `admin@deltaindo.com`
- Password: `Admin123!`

---

## What Changed (From snake_case to camelCase)

| Old (snake_case) | New (camelCase) | Status |
|---|---|---|
| `created_at` | `createdAt` | ✅ Updated in SQL |
| `updated_at` | `updatedAt` | ✅ Updated in SQL |
| `last_login` | `lastLogin` | ✅ Updated in SQL |
| `phone` column removed | `phone` column added | ✅ Restored |
| `status` column added | `status` column removed | ✅ Removed |
| Admin email: `admin@delta-indonesia.com` | Admin email: `admin@deltaindo.com` | ✅ Fixed |

---

## Verification Checklist

Before rebuilding, verify:

✅ **Prisma Schema** (`backend/prisma/schema.prisma`)
- [ ] User model has camelCase fields: `createdAt`, `updatedAt`, `lastLogin`
- [ ] NO `@map()` annotations on these fields (they default to column names)
- [ ] `phone` field exists and is optional (`String?`)
- [ ] `status` field does NOT exist

✅ **SQL Schema** (`backend/database/schema.sql`)
- [ ] `users` table has camelCase columns: `createdAt`, `updatedAt`, `lastLogin`
- [ ] `phone` VARCHAR(20) column exists
- [ ] `status` column does NOT exist

✅ **Admin Seeder** (`backend/database/admin-seeder.sql`)
- [ ] Email is `admin@deltaindo.com`
- [ ] Password hash is `$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIQw6YzKgG` (Admin123!)
- [ ] Phone value is `+62812345678`
- [ ] Uses camelCase columns: `createdAt`, `updatedAt`, `lastLogin`

✅ **Frontend Login** (`frontend/pages/admin/login.tsx`)
- [ ] Default email: `admin@deltaindo.com`
- [ ] Default password: `Admin123!`
- [ ] Demo credentials box shows same values

---

## Rebuild Steps

```bash
cd picnew

# Pull latest changes
git pull origin automated-migration

# Clear old database (if needed)
docker compose down -v

# Start containers (Postgres will run init scripts)
docker compose up

# Verify admin user created
docker exec pic_postgres psql -U postgres -d pic_app -c \
  "SELECT id, email, name, phone, role FROM users WHERE email='admin@deltaindo.com';"

# Expected output:
# id |          email           |        name        |    phone    | role
# ---+--------------------------+--------------------+------------+------
#  1 | admin@deltaindo.com      | Admin Delta Indonesia | +62812345678 | admin
```

---

## Why This Alignment?

1. **Prisma First**: Prisma is the ORM and defines the model—follow its conventions (camelCase)
2. **Consistency**: Backend code uses camelCase (`user.createdAt`), so DB should too
3. **No @map Needed**: Since both Prisma and SQL use camelCase, no mapping layer required
4. **Simpler**: One naming convention everywhere—easier to debug
5. **Future Migrations**: Prisma migrations will align perfectly with actual DB schema

---

## Files Updated

- ✅ `backend/prisma/schema.prisma` — Reverted to camelCase User model
- ✅ `backend/database/schema.sql` — Updated to camelCase columns
- ✅ `backend/database/admin-seeder.sql` — Fixed email, added phone, camelCase fields
- ✅ `frontend/pages/admin/login.tsx` — Correct credentials displayed

---

## Next Steps

1. Run the rebuild with updated Docker Compose
2. Verify Postgres initializes with camelCase schema
3. Seed admin user successfully
4. Test backend API login endpoint
5. Test frontend login with provided credentials

**All systems aligned. Ready to rebuild! 🚀**
