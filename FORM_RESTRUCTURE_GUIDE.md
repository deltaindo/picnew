# Form Restructure Guide - PIC App v2.0

## Overview

The registration form has been completely restructured to match the old system (pic_app) with expanded fields, multi-step interface, and cascading location dropdowns.

---

## Database Changes

### New Tables Created

1. **provinces** - All Indonesian provinces
2. **districts** - Districts/Kabupaten (references provinces)
3. **subdistricts** - Subdistricts/Kecamatan (references districts)
4. **villages** - Villages/Kelurahan (references subdistricts)
5. **education_levels** - Education options (SD, SMP, SMA/SMK, D3, S1, S2, S3)
6. **document_types** - Document types (Surat, Ijazah, KTP, SK, Foto, CV, Bukti Transfer)
7. **link_required_documents** - Many-to-many: which documents required for each link
8. **registration_documents** - Tracks uploaded documents for each registration

### Columns Added to registrations Table

**Personal Data:**
- `ktp` - KTP number
- `tempat_lahir` - Place of birth
- `tanggal_lahir` - Birth date
- `pendidikan` - Education level
- `nama_sekolah` - School/university name
- `no_ijazah` - Certificate number
- `tgl_ijazah` - Certificate date

**Location:**
- `province_id` - Reference to provinces table
- `district_id` - Reference to districts table
- `subdistrict_id` - Reference to subdistricts table
- `village_id` - Reference to villages table
- `alamat_rumah` - Home address
- `golongan_darah` - Blood type

**Contact:**
- `wa` - WhatsApp number

**Company:**
- `instansi` - Company/institution name
- `sektor` - Business sector
- `alamat_perusahaan` - Company address
- `jabatan` - Position/title
- `tlp_kantor` - Office phone

---

## Migration Steps

### 1. Run Database Migration

```bash
# SSH into database container
docker exec -it pic_db psql -U postgres -d pic_app

# Or run migration file
psql -U postgres -d pic_app < backend/prisma/migrations/add_complete_trainee_fields.sql
```

### 2. Populate Location Data

You need to populate the provinces, districts, subdistricts, and villages tables. Use the Indonesian regional database file provided:

```bash
# The location data should be loaded from a seeder or import script
# Contact your database administrator for Indonesia regional data
```

### 3. Restart Containers

```bash
docker-compose restart pic_backend pic_frontend
```

---

## Form Structure

### Multi-Step Form (4 Steps)

#### **Step 1: Data Pribadi (Personal Data)**
- Nama (Name) *required
- KTP Number *required
- Tempat Lahir (Place of Birth)
- Tanggal Lahir (Birth Date)
- Pendidikan (Education Level)
- Nama Sekolah (School Name)
- No. Ijazah (Certificate Number)
- Tanggal Ijazah (Certificate Date)
- **Alamat Rumah (Home Address):**
  - Provinsi (Province) - cascading dropdown
  - Kabupaten (District) - cascading dropdown
  - Kecamatan (Subdistrict) - cascading dropdown
  - Kelurahan (Village) - cascading dropdown
  - Alamat Rumah (Full Address)
  - Golongan Darah (Blood Type)

#### **Step 2: Kontak & Perusahaan (Contact & Company)**
- No. WhatsApp *required
- Email *required
- Instansi (Company/Institution)
- Bidang Usaha (Business Sector)
- Alamat Perusahaan (Company Address)
- Jabatan (Position)
- No. Telp/Fax Kantor (Office Phone)

#### **Step 3: Dokumen (Documents)**
- Dynamic document uploads based on link configuration
- Default documents:
  - Surat Pernyataan (Statement Letter)
  - Ijazah Terakhir (Latest Certificate)
  - KTP (ID Card)
  - Surat Keterangan Sehat (Health Certificate)
  - Pas Foto (Passport Photo)
  - CV (Curriculum Vitae)
  - Bukti Transfer (Payment Proof - conditional)

#### **Step 4: Ringkasan (Summary & Submit)**
- Review of entered data
- Final submission button
- WhatsApp group link (if configured)

---

## API Endpoints

### Public Endpoints

#### Get Link with All Master Data
```
GET /api/public/links/:token

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "training_name": "K3 LISTRIK",
    "class_level": "AHLI",
    "start_date": "2026-01-19",
    "end_date": "2026-01-23",
    "location": "Bekasi",
    "whatsapp_link": "https://chat.whatsapp.com/...",
    "required_documents": [
      { "id": "uuid", "name": "Surat", "description": "..." },
      ...
    ],
    "provinces": [
      { "id": 1, "name": "Jawa Barat" },
      ...
    ],
    "education_levels": [
      { "id": 1, "name": "SMA/SMK" },
      ...
    ]
  }
}
```

#### Get Districts (Cascading)
```
GET /api/public/locations/districts/:province_id

Response:
{
  "success": true,
  "data": [
    { "id": 1, "name": "Bandung" },
    { "id": 2, "name": "Bekasi" },
    ...
  ]
}
```

#### Get Subdistricts (Cascading)
```
GET /api/public/locations/subdistricts/:district_id

Response:
{
  "success": true,
  "data": [
    { "id": 1, "name": "Cibeunying Kaler" },
    ...
  ]
}
```

#### Get Villages (Cascading)
```
GET /api/public/locations/villages/:subdistrict_id

Response:
{
  "success": true,
  "data": [
    { "id": 1, "name": "Cibeunying" },
    ...
  ]
}
```

#### Submit Registration
```
POST /api/public/registrations

Body:
{
  "link_id": "uuid",
  "nama": "John Doe",
  "ktp": "3206061234567890",
  "tempat_lahir": "Bandung",
  "tanggal_lahir": "1990-01-15",
  "pendidikan": "S1",
  "nama_sekolah": "ITB",
  "no_ijazah": "123456",
  "tgl_ijazah": "2012-06-15",
  "province_id": "1",
  "district_id": "2",
  "subdistrict_id": "3",
  "village_id": "4",
  "alamat_rumah": "Jl. Sudirman No. 123",
  "golongan_darah": "O+",
  "wa": "081234567890",
  "email": "john@example.com",
  "instansi": "PT. Maju Jaya",
  "sektor": "Manufaktur",
  "alamat_perusahaan": "Jl. Gajah Mada No. 456",
  "jabatan": "Manager",
  "tlp_kantor": "02212345678"
}

Response:
{
  "success": true,
  "message": "Registration submitted successfully",
  "data": {
    "registration_id": "uuid",
    "confirmation_email": "john@example.com",
    "next_step": "Please check your email for further instructions and WhatsApp message"
  }
}
```

---

## Link Creation Modal Updates

The "Buat Link Pendaftaran" modal now includes:

1. **Bidang** (Sector) - Dropdown
2. **Training** - Dropdown (filtered by sector)
3. **Kelas** (Class Level) - Dropdown
4. **Tanggal Mulai Training** - Date picker
5. **Tanggal Selesai** - Date picker
6. **Program** - Dropdown (Inhouse/Reguler/Mitra PJK3)
7. **Link Grup Whatsapp** - Text input
8. **Tempat Pelaksanaan** (Venue) - Text input
9. **Kapasitas Pendaftar** (Max Registrations) - Number input
10. **Dokumen yang Diperlukan** (Required Documents) - Multi-select checkbox

---

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Provincial, district, subdistrict, village data populated
- [ ] Link retrieval includes all master data
- [ ] Cascading dropdowns work correctly
- [ ] Form validation works on all fields
- [ ] File upload validation (size, type)
- [ ] Form submission creates complete registration record
- [ ] All fields saved correctly to database
- [ ] Email notification sent with registration details
- [ ] WhatsApp message sent (if configured)
- [ ] Link creation modal shows all options
- [ ] Document requirements correctly set for links

---

## Form Variable Mapping

**Old System (form_fsm.php) → New System**

| Old Field | New Field | Type |
|-----------|-----------|------|
| nama | nama | text |
| ktp | ktp | text |
| tempat_lahir | tempat_lahir | text |
| tanggal_lahir | tanggal_lahir | date |
| pendidikan | pendidikan | select |
| nama_sekolah | nama_sekolah | text |
| no_ijazah | no_ijazah | text |
| tgl_ijazah | tgl_ijazah | date |
| provinsi | province_id | select (ID) |
| kabupaten | district_id | select (ID) |
| kecamatan | subdistrict_id | select (ID) |
| kelurahan | village_id | select (ID) |
| alamat_rumah | alamat_rumah | textarea |
| golongan | golongan_darah | select |
| wa | wa | text |
| email | email | email |
| instansi | instansi | text |
| sektor | sektor | text |
| alamat_perusahaan | alamat_perusahaan | text |
| jabatan | jabatan | text |
| tlp_kantor | tlp_kantor | text |
| surat, ijazah, ktp, sk, foto, cv, bukti | files (multi) | file[] |

---

## Next Steps

1. **Load Location Data** - Import Indonesian regional database
2. **Update Admin Panel** - Show document selection in link creation
3. **Add Email Templates** - Send complete registration data to trainee
4. **Add WhatsApp Integration** - Send automatic message with training details
5. **Create Document Verification UI** - Admin verification dashboard
6. **Add Notifications** - Email/SMS confirmations

---

## Known Issues & Limitations

- Location data must be manually populated (needs regional database seeder)
- File upload currently saves to local storage (needs S3/MinIO integration for production)
- Document verification workflow not yet implemented
- Email/WhatsApp notifications need configuration

---

## Support

For questions or issues, refer to:
- Backend API logs: `docker logs pic_backend`
- Database logs: `docker logs pic_db`
- Frontend console: Browser DevTools (F12)
