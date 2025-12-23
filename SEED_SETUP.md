# 🌱 Database Seeding Setup Guide

## Overview

This guide explains how to seed your database with initial master data and manage it through the admin panel.

## What Gets Seeded

When you run the seeder, it automatically creates:

### Master Data (All Editable via Admin Panel)

1. **Bidang/Sektor** (13 sectors)
   - PAA (PESAWAT ANGKAT DAN ANGKUT)
   - AK3U (KEAHLIAN K3 UMUM)
   - ELEVATOR DAN ESKALATOR
   - LISTRIK
   - PENANGGULANGAN KEBAKARAN
   - BEKERJA PADA KETINGGIAN
   - PESAWAT TENAGA DAN PRODUKSI
   - KONSTRUKSI DAN BANGUNAN
   - PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN
   - LINGKUNGAN KERJA DAN BAHAN BERBAHAYA
   - KESEHATAN KERJA
   - PENGELASAN
   - SISTEM MANAJEMEN K3

2. **Kelas/Training Classes** (12 classes)
   - AHLI
   - SUPERVISI SCAFFOLDING
   - TEKNISI SCAFFOLDING
   - TEKNISI
   - KELAS A, B, C, D
   - OPERATOR
   - PETUGAS
   - UTAMA
   - MADYA

3. **Jenis Personel/Personnel Types** (6 types)
   - OPERATOR
   - JURU
   - TEKNISI
   - AHLI K3
   - SUPERVISI
   - PETUGAS

4. **Tipe Dokumen/Document Types** (8 types)
   - SURAT PERMOHONAN
   - IJAZAH / DIPLOMA
   - KTP / IDENTITAS
   - SURAT KETERANGAN
   - FOTO
   - BUKTI KERJA
   - SERTIFIKAT KEAHLIAN
   - SURAT REKOMENDASI

5. **Program Pelatihan/Training Programs** (5 programs)
   - AHLI K3 UMUM (16 days)
   - K3 LISTRIK (5 days)
   - K3 KONSTRUKSI (5 days)
   - K3 ELEVATOR ESKALATOR (5 days)
   - K3 KEBAKARAN (3 days)

### Admin Account

**Email:** `admin@delta-indonesia.com`  
**Password:** `Admin123!`

## 🚀 How to Seed

### Option 1: Automatic Seeding (During Docker Build)

If you have `"prisma generate && prisma db push && prisma db seed"` in your `package.json` scripts, it runs automatically.

### Option 2: Manual Seeding (After Containers Start)

```bash
# Enter the backend container
docker-compose exec backend sh

# Run the seed command
npm run seed
```

### Option 3: Direct Database Migration

```bash
# Push schema to database
npx prisma db push

# Run seeder
npx prisma db seed
```

## 📝 Editing Master Data

All seeded data is **fully editable** through the admin panel:

1. **Login** at `http://localhost:3000/admin/login`
   - Email: `admin@delta-indonesia.com`
   - Password: `Admin123!`

2. **Go to** Master Data section (left sidebar)

3. **Select category** from tabs:
   - 🏢 Bidang/Sektor
   - 📚 Kelas
   - 👔 Jenis Personel
   - 📄 Tipe Dokumen

4. **Add/Edit/Delete** items as needed

## 🔧 What Can You Do?

### ✅ Fully Supported

- ✅ **View** all master data
- ✅ **Add** new items (Bidang, Kelas, Personnel Types, Document Types)
- ✅ **Delete** items (if not referenced by other records)
- ✅ **Search** through items

### ❌ Not Yet Supported (Backend Ready)

- ❌ Update/Edit existing items (backend ready, frontend UI pending)

## 🗂️ Table Names (PascalCase)

The actual database tables are:

```sql
Bidang              -- Sectors
TrainingClass       -- Classes
PersonnelType       -- Personnel Types
DocumentType        -- Document Types
TrainingProgram     -- Training Programs
```

## 🔄 Resetting Database

If you need to reset and reseed:

```bash
# Reset database and reapply schema
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create it fresh
# 3. Apply all migrations
# 4. Run the seed automatically
```

## 📊 Seed Data Statistics

After seeding, you'll have:

- **1 Admin User**
- **13 Bidang/Sectors**
- **12 Training Classes**
- **6 Personnel Types**
- **8 Document Types**
- **5 Training Programs**
- **34 Indonesian Provinces** (optional, auto-seeded)
- **514+ Regencies/Cities** (optional, auto-seeded)
- **7,277+ Districts** (optional, auto-seeded)
- **75,574+ Villages** (optional, auto-seeded)

## 🐛 Troubleshooting

### "Table does not exist" error

```bash
# Make sure migrations are applied first
npx prisma db push

# Then run seed
npx prisma db seed
```

### "Unique constraint violated" error

This means the seed data was already applied. Run:

```bash
npx prisma migrate reset
```

### Docker not starting

```bash
# Rebuild images
docker-compose down
docker-compose up --build
```

## 📚 References

- [Prisma Seeding Docs](https://www.prisma.io/docs/guides/database/seed-database)
- [Master Data Routes](backend/routes/master-data.js)
- [Seed Script](backend/prisma/seed.ts)
- [Database Schema](backend/prisma/schema.prisma)

## ✨ Features

### Master Data Admin Panel

- **Dynamic CRUD**: Add, view, and delete master data items
- **Search & Filter**: Browse through large datasets easily
- **Real-time Validation**: Prevents duplicate entries
- **Responsive Design**: Works on desktop and mobile
- **Role-based Access**: Admin-only authentication

---

**Last Updated:** December 23, 2025  
**Status:** ✅ Production Ready
