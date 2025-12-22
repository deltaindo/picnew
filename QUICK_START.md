# Quick Start - PIC App Form Restructure

## ⚡ What Changed?

✅ **Registration form** now matches the old system (pic_app) with ALL fields
✅ **Multi-step form** (4 steps) instead of single page
✅ **Cascading dropdowns** for Province → District → Subdistrict → Village
✅ **Complete trainee data** - 20+ fields captured
✅ **Dynamic documents** - Configurable per training link

---

## 🚀 Quick Setup

### 1. Apply Database Migration

```bash
# SSH into database
docker exec -it pic_db psql -U postgres -d pic_app

# Run the migration
\i /migrations/add_complete_trainee_fields.sql
```

**Or directly:**
```bash
psql -U postgres -d pic_app < backend/prisma/migrations/add_complete_trainee_fields.sql
```

### 2. Load Location Data

⚠️ **CRITICAL**: You need to populate provinces, districts, subdistricts, villages

Options:
- Use Indonesian regional database (Indonesia_provinces.sql or similar)
- Contact database administrator for regional data file
- Or manually insert test data for testing

### 3. Restart Containers

```bash
docker-compose down
docker-compose up -d
```

### 4. Test Registration Form

1. Create a registration link in admin panel
2. Open link: `http://localhost:3000/register/YOUR_TOKEN`
3. Form should load with all fields
4. Cascading dropdowns should work
5. Try submitting a test registration

---

## 📋 Form Structure

### Step 1: 📋 Data Pribadi (Personal Data)
```
Nama Lengkap *
No. KTP *
Tempat Lahir
Tanggal Lahir
Pendidikan (dropdown)
Nama Sekolah
No. Ijazah
Tanggal Ijazah
├─ Provinsi (dropdown)
├─ Kabupaten (dropdown → depends on Provinsi)
├─ Kecamatan (dropdown → depends on Kabupaten)
├─ Kelurahan (dropdown → depends on Kecamatan)
├─ Alamat Rumah (textarea)
└─ Golongan Darah (dropdown)
```

### Step 2: 📞 Kontak & Perusahaan (Contact & Company)
```
No. WhatsApp *
Email *
Instansi (Company Name)
Bidang Usaha (Business Sector)
Alamat Perusahaan
Jabatan (Position)
No. Telp/Fax Kantor
```

### Step 3: 📄 Dokumen (Documents)
```
Surat Pernyataan (upload)
Ijazah Terakhir (upload)
KTP (upload)
Surat Keterangan Sehat (upload)
Pas Foto Berwarna (upload)
CV (upload)
Bukti Transfer (upload - conditional)

File validation: PDF, JPG, PNG (max 2MB)
```

### Step 4: ✓ Ringkasan (Summary & Submit)
```
Review all data
Final submit button
WhatsApp group link
```

---

## 🔧 API Endpoints

### Get Link with Master Data
```bash
GET /api/public/links/:token

# Returns: link details + provinces + education_levels + documents
```

### Cascading Location Dropdowns
```bash
GET /api/public/locations/districts/:province_id
GET /api/public/locations/subdistricts/:district_id
GET /api/public/locations/villages/:subdistrict_id
```

### Submit Registration
```bash
POST /api/public/registrations

Body:
{
  "link_id": "uuid",
  "nama": "John Doe",
  "ktp": "3206061234567890",
  "email": "john@example.com",
  "wa": "081234567890",
  ...[all other fields]
}
```

---

## ⚙️ Configuration

### Link Creation Modal

When creating a link, you can now:
- Select required documents (checkboxes)
- Set max registrations
- Set WhatsApp group link
- Set training dates
- Set location
- Select bidang/training/kelas

### Environment Variables

Make sure these are set:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## 🧪 Quick Test

### Test 1: Form Loads
```
1. Open http://localhost:3000/register/TEST_TOKEN
2. Should see Step 1 form
3. Should load without errors
```

### Test 2: Cascading Dropdowns
```
1. Select Jawa Barat in Provinsi
2. Kabupaten dropdown should populate
3. Select a Kabupaten
4. Kecamatan dropdown should populate
5. Select a Kecamatan
6. Kelurahan dropdown should populate
```

### Test 3: Form Submission
```
1. Fill Step 1 (all required fields marked *)
2. Click "Lanjut" (Next)
3. Fill Step 2 (wa, email required)
4. Click "Lanjut"
5. Upload at least one document (Step 3)
6. Click "Lanjut"
7. Review summary (Step 4)
8. Click "Daftar Sekarang" (Submit)
9. Should redirect to confirmation page
```

---

## ❌ Troubleshooting

### "Cannot read properties of undefined"
**Fix**: Ensure provinces table is populated
```bash
SELECT COUNT(*) FROM provinces; -- should be > 0
```

### Cascading dropdowns not working
**Fix**: Check backend logs
```bash
docker logs pic_backend
```

### Location data not loading
**Fix**: Import Indonesia regional data
```bash
psql -U postgres -d pic_app < indonesia_provinces.sql
```

### Form won't submit
**Fix**: Check browser console (F12) for errors
- Look for network tab to see API responses
- Check if all required fields are filled (* marks)

---

## 📊 Database Status

```sql
-- Check if migration applied
SELECT COUNT(*) FROM provinces;           -- should be > 0
SELECT COUNT(*) FROM education_levels;    -- should be 7
SELECT COUNT(*) FROM document_types;      -- should be 7

-- Check registrations table
\d registrations -- should show all new columns
```

---

## 🎯 Next Steps

1. ✅ Apply database migration
2. ✅ Load location data (provinces, districts, etc.)
3. ✅ Restart containers
4. ✅ Test form with cascading dropdowns
5. ⏭️  Update admin link creation modal to show document selection
6. ⏭️  Add email/WhatsApp notifications
7. ⏭️  Create admin document verification dashboard

---

## 📞 Help

**Full documentation:** See `FORM_RESTRUCTURE_GUIDE.md`

**Check logs:**
```bash
docker logs pic_backend   # Backend API
docker logs pic_frontend  # Next.js app
docker logs pic_db        # PostgreSQL
```

**Database console:**
```bash
docker exec -it pic_db psql -U postgres -d pic_app
```

---

## ✅ Verification

After setup, verify:
- [ ] No errors in browser console
- [ ] Form loads on registration link
- [ ] Step 1 displays all fields
- [ ] Cascading dropdowns work
- [ ] Step navigation works (Back/Next buttons)
- [ ] File upload accepts PDF, JPG, PNG
- [ ] Form validation works (required fields)
- [ ] Submission redirects to confirmation

**Ready to test!** 🚀
