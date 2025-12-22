# Indonesian Regions Seeder - Quick Start Guide

## 📍 What's Included

A comprehensive seeder for Indonesian administrative regions:
- **34 Provinces** (Provinsi)
- **514 Regencies/Cities** (416 Kabupaten + 98 Kota)
- **7,277 Districts** (Kecamatan)
- **83,763 Villages** (8,498 Kelurahan + 75,265 Desa)

**Total: 91,588 administrative region records**

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have:
- Node.js 16+ installed
- PostgreSQL database running
- `DATABASE_URL` environment variable configured

### 2. Run Seeders

**Option A: Run all seeders (recommended first time)**
```bash
cd backend
npm run prisma:seed
```

This will:
1. Create admin user
2. Seed training sectors (Bidang)
3. Seed training classes
4. Seed personnel types
5. Seed training programs
6. **Seed all Indonesian regions** ✨

**Option B: Run regions seeder only**
```bash
cd backend
npx ts-node prisma/seeders/indonesian-regions.ts
```

### 3. Monitor Progress

The seeder will output progress like this:

```
🌱 Starting Indonesian Regions Seeding...

📋 Fetching provinces...
✓ Found 34 provinces

🏗️  Seeding Province: ACEH (11)
   📋 Found 23 regencies/cities
   ✓ Processed regency: KAB. ACEH SELATAN
   ...
   ✓ Seeded 23 regencies/cities for ACEH

✅ Indonesian Regions Seeding Complete!
═════════════════════════════════════════════════════════════════
📊 Statistics:
   • Provinces:        34
   • Regencies/Cities: 514
   • Districts:        7,277
   • Villages:         83,763
   • Total Records:    91,588
═════════════════════════════════════════════════════════════════
```

⏱️ **Estimated Time:** 15-30 minutes (depending on network)

## 📦 Database Schema

The seeder creates 4 tables:

### Province Table
```typescript
model Province {
  id        Int       @id @default(autoincrement())
  code      String    @unique  // e.g., "11"
  name      String    @unique  // e.g., "ACEH"
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  regencies Regency[]
}
```

### Regency Table
```typescript
model Regency {
  id          Int       @id @default(autoincrement())
  code        String    @unique  // e.g., "11.01"
  name        String             // e.g., "KAB. ACEH SELATAN"
  type        String             // "regency" or "city"
  provinceId  Int
  province    Province  @relation(fields: [provinceId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  districts   District[]
}
```

### District Table
```typescript
model District {
  id        Int       @id @default(autoincrement())
  code      String    @unique  // e.g., "11.01.01"
  name      String             // e.g., "Bakongan"
  regencyId Int
  regency   Regency   @relation(fields: [regencyId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  villages  Village[]
}
```

### Village Table
```typescript
model Village {
  id        Int       @id @default(autoincrement())
  code      String    @unique  // e.g., "11.01.01.2001"
  name      String             // e.g., "Keude Bakongan"
  type      String             // "village" or "urban_village"
  districtId Int
  district  District  @relation(fields: [districtId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## 📝 Usage Examples

### Query All Provinces
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all provinces
const provinces = await prisma.province.findMany();
provinces.forEach(p => console.log(`${p.code} - ${p.name}`));
```

### Get Regencies by Province
```typescript
// Get regencies in ACEH (code: 11)
const acehRegencies = await prisma.regency.findMany({
  where: {
    province: { code: '11' }
  }
});

forEach(acehRegencies).forEach(r => {
  console.log(`${r.code} - ${r.name} (${r.type})`);
});
```

### Get Districts by Regency
```typescript
// Get districts in KAB. ACEH SELATAN (code: 11.01)
const aceahSelatanDistricts = await prisma.district.findMany({
  where: {
    regency: { code: '11.01' }
  }
});

aceahSelatanDistricts.forEach(d => {
  console.log(`${d.code} - ${d.name}`);
});
```

### Get Villages by District
```typescript
// Get villages in Bakongan district (code: 11.01.01)
const bakonganVillages = await prisma.village.findMany({
  where: {
    district: { code: '11.01.01' }
  }
});

bakonganVillages.forEach(v => {
  console.log(`${v.code} - ${v.name} (${v.type})`);
});
```

### Search Regions
```typescript
// Search for Jakarta
const jakarta = await prisma.province.findFirst({
  where: {
    name: { contains: 'JAKARTA', mode: 'insensitive' }
  }
});

// Search for villages with "Barat" in name
const baratVillages = await prisma.village.findMany({
  where: {
    name: { contains: 'Barat', mode: 'insensitive' }
  }
});
```

### Get Full Hierarchy
```typescript
// Get province with all its regencies, districts, and villages
const fullHierarchy = await prisma.province.findUnique({
  where: { code: '11' }, // ACEH
  include: {
    regencies: {
      include: {
        districts: {
          include: {
            villages: true
          }
        }
      }
    }
  }
});
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/picnew"

# Optional: API configuration
GEONESIA_API_BASE="https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data"
GEONESIA_API_TIMEOUT=30000  # 30 seconds
```

### Package.json Scripts

Add these convenience scripts:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "regions:seed": "ts-node prisma/seeders/indonesian-regions.ts",
    "regions:clear": "prisma db execute --stdin < scripts/clear-regions.sql"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## ⚠️ Troubleshooting

### Issue: "connect ECONNREFUSED 127.0.0.1:5432"
**Solution:** Make sure PostgreSQL is running and DATABASE_URL is correct.

### Issue: "Cannot find module 'ts-node'"
**Solution:** Install dev dependencies: `npm install --save-dev ts-node typescript`

### Issue: Timeout or very slow seeding
**Solutions:**
- Check your internet connection
- The Geonesia API might be experiencing rate limiting
- Try running again after a few minutes
- Increase timeout in environment variables

### Issue: "HTTP 429: Too Many Requests"
**Solution:** The API is rate-limited. Wait 5-10 minutes and try again.

### Issue: Some regions not seeded
**Solution:** This is normal due to API availability. You can:
- Run the seeder again (it will only insert missing regions)
- Check logs for which regions failed
- The upsert operation ensures no duplicates

### Issue: Need to re-seed everything

**Clear all regions:**
```bash
npx prisma db execute --stdin << 'EOF'
TRUNCATE "Village" CASCADE;
TRUNCATE "District" CASCADE;
TRUNCATE "Regency" CASCADE;
TRUNCATE "Province" CASCADE;
EOF
```

Then re-run: `npm run prisma:seed`

## 📊 Data Statistics

| Level | Name | Count |
|-------|------|-------|
| 1 | Provinces | 34 |
| 2 | Regencies (Kabupaten) | 416 |
| 2 | Cities (Kota) | 98 |
| 3 | Districts (Kecamatan) | 7,277 |
| 4 | Urban Villages (Kelurahan) | 8,498 |
| 4 | Rural Villages (Desa) | 75,265 |
| **TOTAL** | **All Regions** | **91,588** |

## 📚 Data Source

**Geonesia API** - Indonesian Regional Data
- GitHub: https://github.com/rezzvy/geonesia-api
- Documentation: https://rezzvy.github.io/geonesia-api/
- License: Open Source
- Data Source: Official Ministry of Interior (Kementerian Dalam Negeri) codes

## 🤝 Support

For issues or questions:
1. Check the [Seeders README](./backend/prisma/seeders/README.md)
2. Review the seeder code: [indonesian-regions.ts](./backend/prisma/seeders/indonesian-regions.ts)
3. Open an issue with seeding details

## ✅ Verification Checklist

After seeding, verify with:

```bash
# Check if tables are populated
npx prisma studio

# Or use SQL directly
psql -c "SELECT COUNT(*) FROM \"Province\";"
psql -c "SELECT COUNT(*) FROM \"Regency\";"
psql -c "SELECT COUNT(*) FROM \"District\";"
psql -c "SELECT COUNT(*) FROM \"Village\";"
```

Expected counts:
- Province: 34
- Regency: 514
- District: 7,277
- Village: ~83,763

---

**Happy seeding! 🌱**
