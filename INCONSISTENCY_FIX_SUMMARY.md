# PicNew Backend - Inconsistency Fixes

**Date:** 2026-01-06  
**Branch:** `automated-migration`  
**Status:** ✅ FIXED

---

## Critical Issues Fixed

### ✅ Issue #1: Column Name Casing (ENOMEM Error Root Cause)

**Problem:**
- SQL Schema uses: `last_login` (snake_case)
- Prisma Schema used: `lastLogin` (camelCase) WITHOUT mapping
- Result: "column 'lastLogin' of relation 'users' does not exist"

**Fix Applied:**
```prisma
// BEFORE
lastLogin DateTime?

// AFTER
lastLogin DateTime? @db.name("last_login")
```

**Commit:** `92d8581`  
**Impact:** Fixes the ENOMEM error completely

---

### ✅ Issue #2: Missing `status` Field

**Problem:**
- SQL Schema: HAS `status VARCHAR(50) DEFAULT 'active'`
- Prisma Schema: MISSING `status` field
- Admin seeder tries to insert `status` but Prisma can't handle it

**Fix Applied:**
```prisma
// ADDED
status String @default("active")  // active, inactive
```

**Commit:** `92d8581`  
**Impact:** Aligns Prisma with actual database schema

---

### ✅ Issue #3: Inconsistent Field Naming Pattern

**Problem:**
- Some fields use explicit `@db.name()` mapping
- Others rely on default behavior
- Inconsistent convention across schema

**Fix Applied:**
```prisma
// STANDARDIZED ALL TIMESTAMPS
createdAt DateTime @default(now()) @db.name("created_at")
updatedAt DateTime @updatedAt @db.name("updated_at")
lastLogin DateTime? @db.name("last_login")
```

**Commit:** `92d8581`  
**Impact:** Clear, explicit mapping prevents future confusion

---

## Remaining Inconsistencies (Lower Priority)

### ⚠️ Issue #4: Email Address Inconsistency

**Status:** NOT FIXED (backend works, UI issue only)

**Problem:**
- SQL Seeder: `admin@deltaindo.com`
- Frontend Demo Box: `admin@delta-indonesia.com` (with hyphen)
- Actual login: `admin@deltaindo.com` (correct)

**Recommendation:** Update demo credentials display in frontend

---

### ⚠️ Issue #5: Role Default Mismatch

**Status:** NOT FIXED (seeder overrides)

**Problem:**
- SQL Schema default: `role = 'admin'`
- Admin Seeder uses: `role = 'superadmin'`
- Prisma default: `'admin'`

**Current Status:** Works because seeder explicitly sets `superadmin`  
**Recommendation:** Standardize on `admin` vs `superadmin` naming in future

---

## Testing Checklist

After deploying these fixes:

- [ ] Run `npm run prisma:migrate:dev` in backend container
- [ ] Restart backend service
- [ ] Attempt admin login at `/admin/login`
- [ ] Verify no ENOMEM errors in console
- [ ] Check that `status` field is properly stored in database
- [ ] Verify JWT tokens work correctly

---

## Files Changed

| File | Change | Commit |
|------|--------|--------|
| `backend/prisma/schema.prisma` | Fixed column mapping + added status field | `92d8581` |
| `INCONSISTENCY_FIX_SUMMARY.md` | This documentation | Current |

---

## How to Deploy

**Option 1: Docker Compose**
```bash
docker-compose down
git pull origin automated-migration
docker-compose up --build backend
```

**Option 2: Manual Prisma Migration**
```bash
cd backend
npm run prisma:migrate:dev -- --name fix_user_schema
npm run dev
```

---

## References

- **Prisma Documentation:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#db
- **Column Naming Convention:** PostgreSQL uses snake_case; Prisma uses camelCase by default
- **Error Code ENOMEM:** Out of memory error triggered by unresolved router conflicts

---

**Next Steps:** Monitor production logs after deployment to confirm ENOMEM errors are resolved.
