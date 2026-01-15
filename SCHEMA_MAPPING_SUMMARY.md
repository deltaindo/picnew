# Schema Mapping Summary

## Overview

Implemented proper camelCase/snake_case naming convention separation for the PicNew database:
- **Application (Frontend/Backend)**: camelCase field names via Prisma Client
- **Database (PostgreSQL)**: snake_case column and table names

## How It Works

Prisma's `@map` and `@@map` directives handle automatic conversion:

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  createdAt DateTime  @default(now()) @map("created_at")  // Maps to: created_at
  updatedAt DateTime  @updatedAt @map("updated_at")      // Maps to: updated_at
  
  @@map("users")  // Table name in PostgreSQL: users
}
```

## Seeders Updated

### 1. **backend/prisma/schema.prisma** ✅
   - Added `@map()` to all timestamp fields: `createdAt`, `updatedAt`, `lastLogin`, etc.
   - Added `@map()` to all foreign key fields: `provinceId` → `province_id`, `bidangId` → `bidang_id`, etc.
   - Added `@@map()` to all table models for snake_case table names
   - Maintains camelCase field names in Prisma models for type-safe access

### 2. **backend/prisma/seed.ts** ✅
   - No code changes needed (Prisma Client handles mapping automatically)
   - Uses camelCase field names when creating/upserting records
   - Example: `{ email, password, name, role, phone }` works as-is

### 3. **backend/prisma/seeders/admin-user-seed.sql** ✅
   - Updated to use snake_case column names: `created_at`, `updated_at`, `status`
   - Reflects actual PostgreSQL column names from schema mapping

### 4. **backend/prisma/seeders/indonesian-regions.ts** ✅
   - No changes needed (already uses Prisma Client with camelCase)
   - Prisma Client automatically maps: `provinceId` → `province_id`, `regencyId` → `regency_id`, etc.

### 5. **backend/prisma/seeders/index.ts** ✅
   - Seed data interfaces remain unchanged (camelCase)
   - Used only for reference and testing, not database operations

## PostgreSQL Table & Column Mappings

### Tables (@@map)
```
Model          → PostgreSQL Table
---            → ---
User           → users
Province       → provinces
Regency        → regencies
District       → districts
Village        → villages
Bidang         → bidangs
TrainingProgram → training_programs
TrainingClass  → training_classes
PersonnelType  → personnel_types
DocumentType   → document_types
EquipmentType  → equipment_types
PIC            → pics
Marketing      → marketings
ProgramType    → program_types
RegistrationLink → registration_links
RequiredDocument → required_documents
Registration   → registrations
TraineeDocument → trainee_documents
Certificate    → certificates
Notification   → notifications
AuditLog       → audit_logs
```

### Common Field Mappings (@map)
```
Model Field     → PostgreSQL Column
---            → ---
createdAt      → created_at
updatedAt      → updated_at
lastLogin      → last_login
provinceId     → province_id
regencyId      → regency_id
districtId     → district_id
bidangId       → bidang_id
trainingProgramId → training_program_id
trainingClassId → training_class_id
personnelTypeId → personnel_type_id
createdByAdminId → created_by_admin_id
picId          → pic_id
marketingId    → marketing_id
programTypeId  → program_type_id
registrationLinkId → registration_link_id
registrationId → registration_id
uniqueToken    → unique_token
maxRegistrations → max_registrations
currentRegistrations → current_registrations
expiryDate     → expiry_date
waGroupLink    → wa_group_link
submissionStatus → submission_status
tanggalPelaksanaan → tanggal_pelaksanaan
tanggalSelesai → tanggal_selesai
submittedAt    → submitted_at
birthDate      → birth_date
bloodType      → blood_type
educationLevel → education_level
companyName    → company_name
jobTitle       → job_title
fullName       → full_name
filePath       → file_path
fileName       → file_name
fileSize       → file_size
mimeType       → mime_type
uploadStatus   → upload_status
uploadedAt     → uploaded_at
certificateNumber → certificate_number
trainingNameId → training_name_id
trainingNameEn → training_name_en
issueDate      → issue_date
validityYears  → validity_years
pdfFilePath    → pdf_file_path
verificationCode → verification_code
issuedAt       → issued_at
sentAt         → sent_at
entityType     → entity_type
entityId       → entity_id
ipAddress      → ip_address
durationDays   → duration_days
minParticipants → min_participants
maxParticipants → max_participants
displayName    → display_name
isRequired     → is_required
```

## Running Seeders

```bash
# Run main seeder (Bidang, Programs, Personnel, etc.)
npx prisma db seed

# Or run specific seeder
node backend/prisma/seed.ts

# Run Indonesian regions seeder separately
node backend/prisma/seeders/indonesian-regions.ts

# Run admin user SQL seeder (if TypeScript fails)
psql -U postgres -d pic_app -f backend/prisma/seeders/admin-user-seed.sql
```

## Benefits

✅ **Type Safety**: TypeScript/Prisma gets camelCase for modern code conventions
✅ **Database Conventions**: PostgreSQL gets snake_case for SQL best practices
✅ **Automatic Mapping**: No manual conversion needed in code
✅ **Consistency**: All models follow same naming pattern
✅ **Backward Compatible**: Existing TypeScript/JavaScript code works unchanged

## Notes

- **Foreign Key Fields**: RelationFields (model relationships) remain camelCase in Prisma.
  The underlying scalar FK columns (e.g., `provinceId`) are mapped to `province_id` in DB.
- **Unique Constraints**: Compound unique constraints use snake_case in comments but camelCase in Prisma where clauses.
- **Indexes**: All indexes continue to work automatically with mapped column names.
- **SQL Migrations**: Any raw SQL queries must use snake_case column/table names.

## Commits

1. `feat: add @map/@@map for camelCase (app) to snake_case (PostgreSQL) conversion`
2. `fix: update admin-user-seed.sql to use snake_case column names from schema mapping`
3. `fix: update seed.ts to use snake_case column names for direct SQL inserts and Prisma Client with camelCase`
4. `fix: indonesian-regions.ts already works with Prisma Client camelCase mapping`
