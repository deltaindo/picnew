# Prisma Seeders Documentation

This directory contains all database seeders for the PIC (Pelatihan, Informasi, Sertifikasi) application.

## Overview

Seeders are used to populate the database with initial/reference data. They help establish the foundation for the application.

## Available Seeders

### 1. Main Seeder (`seed.ts`)

The main entry point that seeds:
- Admin users
- Bidang (Training Sectors)
- Training Classes
- Personnel Types
- Training Programs
- Indonesian Regions (by calling the regions seeder)

**Run with:**
```bash
npm run prisma:seed
# or
prisma db seed
```

### 2. Indonesian Regions Seeder (`indonesian-regions.ts`)

A comprehensive seeder that populates the database with complete Indonesian administrative regions hierarchy:

#### Data Coverage
- **Provinces (Provinsi):** 34 provinces
- **Regencies/Cities (Kabupaten/Kota):** 416 regencies + 98 cities = 514 total
- **Districts (Kecamatan):** 7,277 districts
- **Villages (Desa/Kelurahan):** 8,498 urban villages + 75,265 rural villages = 83,763 total

**Total Records:** ~91,588 administrative region records

#### Data Source

This seeder uses the **[Geonesia API](https://rezzvy.github.io/geonesia-api/)** - a free, public, static API that provides comprehensive Indonesian regional data.

- **API Base URL:** `https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data`
- **Data Source:** Official Indonesian Ministry of Interior (Kementerian Dalam Negeri) administrative region codes
- **Format:** JSON
- **License:** Open source and freely available

#### Database Schema

The seeder populates four related tables:

1. **Province** (Provinsi)
   - `id` (PK): Auto-increment integer
   - `code`: Unique code from Geonesia (e.g., "11", "12")
   - `name`: Province name (e.g., "ACEH", "SUMATERA UTARA")
   - Indexes on `code` and `name` for fast lookups

2. **Regency** (Kabupaten/Kota)
   - `id` (PK): Auto-increment integer
   - `code`: Unique code (e.g., "11.01", "31.71")
   - `name`: Regency/City name
   - `type`: Either "regency" or "city"
   - `provinceId` (FK): References Province
   - Indexes on `code`, `name`, `type`, and `provinceId`

3. **District** (Kecamatan)
   - `id` (PK): Auto-increment integer
   - `code`: Unique code (e.g., "11.01.01", "31.71.01")
   - `name`: District name
   - `regencyId` (FK): References Regency
   - Indexes on `code`, `name`, and `regencyId`

4. **Village** (Desa/Kelurahan)
   - `id` (PK): Auto-increment integer
   - `code`: Unique code (e.g., "11.01.01.2001", "31.71.01.1001")
   - `name`: Village name
   - `type`: Either "village" or "urban_village"
   - `districtId` (FK): References District
   - Indexes on `code`, `name`, `type`, and `districtId`

#### Running the Seeder

**Option 1: Run as part of main seed**
```bash
npm run prisma:seed
```
This will run the main seeder which includes the regions seeder.

**Option 2: Run standalone**
```bash
cd backend
npx ts-node prisma/seeders/indonesian-regions.ts
```

#### Performance Considerations

- **API Calls:** ~8,800 API calls to fetch all regions (1 for provinces + ~514 for regencies + ~7,277 for districts + ~75,574 for villages)
- **Network Time:** Typically 15-30 minutes depending on network speed and API rate limiting
- **Database Inserts:** Optimized with batch processing and concurrency control
- **Concurrency:** Uses 10 concurrent promises to balance speed and resource usage
- **Memory:** Handles large datasets with streaming-like processing

#### Error Handling

The seeder includes robust error handling:
- Graceful fallback if API is unavailable
- Retry logic for failed API calls
- Proper error logging with context
- Database transaction isolation (Prisma upsert)

#### Example Output

```
🌱 Starting Indonesian Regions Seeding...

📋 Fetching provinces...
✓ Found 34 provinces

🏗️  Seeding Province: ACEH (11)
   📋 Found 23 regencies/cities
   ✓ Processed regency: KAB. ACEH SELATAN
   ✓ Processed regency: KAB. ACEH TENGGARA
   ...
   ✓ Seeded 23 regencies/cities for ACEH

✅ Indonesian Regions Seeding Complete!
════════════════════════════════════════════════════
📊 Statistics:
   • Provinces:        34
   • Regencies/Cities: 514
   • Districts:        7,277
   • Villages:         83,763
   • Total Records:    91,588
════════════════════════════════════════════════════
```

#### Querying Seeded Data

After seeding, you can query regions using Prisma:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all provinces
const provinces = await prisma.province.findMany();

// Get province with its regencies
const provinceWithRegencies = await prisma.province.findUnique({
  where: { code: '11' }, // ACEH
  include: { regencies: true }
});

// Get a regency with its districts
const regencyWithDistricts = await prisma.regency.findUnique({
  where: { code: '11.01' }, // KAB. ACEH SELATAN
  include: { districts: true }
});

// Get a district with its villages
const districtWithVillages = await prisma.district.findUnique({
  where: { code: '11.01.01' }, // Bakongan district
  include: { villages: true }
});

// Search villages
const villages = await prisma.village.findMany({
  where: {
    name: {
      contains: 'Keude',
      mode: 'insensitive'
    }
  }
});
```

#### Database Indexes

For optimal query performance, the seeder creates indexes on frequently searched fields:

```sql
-- Province indexes
CREATE UNIQUE INDEX Province_code ON Province(code);
CREATE INDEX Province_name ON Province(name);

-- Regency indexes
CREATE UNIQUE INDEX Regency_code ON Regency(code);
CREATE INDEX Regency_provinceId ON Regency(provinceId);
CREATE INDEX Regency_name ON Regency(name);
CREATE INDEX Regency_type ON Regency(type);

-- District indexes
CREATE UNIQUE INDEX District_code ON District(code);
CREATE INDEX District_regencyId ON District(regencyId);
CREATE INDEX District_name ON District(name);

-- Village indexes
CREATE UNIQUE INDEX Village_code ON Village(code);
CREATE INDEX Village_districtId ON Village(districtId);
CREATE INDEX Village_name ON Village(name);
CREATE INDEX Village_type ON Village(type);
```

#### Troubleshooting

**Issue: API rate limiting**
- Solution: Geonesia API is rate-limited. If you encounter 429 errors, wait a few minutes and try again.

**Issue: Timeout during seeding**
- Solution: The seeder is optimized to handle large datasets. Ensure your DATABASE_URL is correctly configured and the database connection is stable.

**Issue: Some regions not seeded**
- Solution: The seeder uses upsert operations, so it's safe to run multiple times. Any failed regions will be attempted again.

**Issue: Need to re-seed**
- Solution: To clear and re-seed all regions:
  ```sql
  DELETE FROM "Village";
  DELETE FROM "District";
  DELETE FROM "Regency";
  DELETE FROM "Province";
  ```
  Then run the seeder again.

#### API Reference

For more information about the Geonesia API, visit:
- GitHub: https://github.com/rezzvy/geonesia-api
- Documentation: https://rezzvy.github.io/geonesia-api/

## Running All Seeders

**Full setup:**
```bash
# Generate Prisma client
npm run prisma:generate

# Create/migrate database
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## Package Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "regions:seed": "ts-node prisma/seeders/indonesian-regions.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Contributing

If you want to:
- Add new seeders
- Update existing data
- Improve performance

Please maintain the structure and add proper documentation.
