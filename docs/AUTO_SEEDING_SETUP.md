# Auto-Seeding Setup for Docker PostgreSQL

This guide shows how to automatically seed data when your PostgreSQL container starts, eliminating manual seeding steps.

---

## Option 1: Using Prisma Seed Script (Recommended)

### File: `backend/package.json`

Add this to your `scripts` section:

```json
{
  "scripts": {
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "db:setup": "npm run prisma:migrate:deploy && npm run prisma:seed"
  }
}
```

### File: `backend/prisma/seed.ts`

Complete seeding file:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed PIC (Person In Charge)
    console.log('📝 Seeding PIC...');
    const picNames = [
      'Ghaida Trisnanda',
      'Yuyun',
      'Echasita',
      'Erje',
      'Nur Afidah',
      'Hafid',
      'Daniel Setiono'
    ];

    for (const name of picNames) {
      const result = await prisma.pIC.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      console.log(`  ✓ ${result.name}`);
    }
    console.log('✅ PIC seeded successfully');

    // Seed Marketing
    console.log('📝 Seeding Marketing...');
    const marketingNames = [
      'Agustyani',
      'Atikah',
      'Anik',
      'Yoppi',
      'Intang',
      'Hafid',
      'Ali M',
      'Erje',
      'Indri',
      'Bayu',
      'Yunny',
      'Eko'
    ];

    for (const name of marketingNames) {
      const result = await prisma.marketing.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      console.log(`  ✓ ${result.name}`);
    }
    console.log('✅ Marketing seeded successfully');

    // Seed Program Types
    console.log('📝 Seeding Program Types...');
    const programTypes = [
      { name: 'Reguler', description: 'Program pelatihan reguler' },
      { name: 'Inhouse', description: 'Program pelatihan di tempat klien' },
      { name: 'BNSP', description: 'Program sertifikasi BNSP' }
    ];

    for (const program of programTypes) {
      const result = await prisma.programType.upsert({
        where: { name: program.name },
        update: { description: program.description },
        create: program
      });
      console.log(`  ✓ ${result.name} - ${result.description}`);
    }
    console.log('✅ Program Types seeded successfully');

    // Log summary
    const [picCount, marketingCount, programTypeCount] = await Promise.all([
      prisma.pIC.count(),
      prisma.marketing.count(),
      prisma.programType.count()
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`  • PIC: ${picCount} records`);
    console.log(`  • Marketing: ${marketingCount} records`);
    console.log(`  • Program Types: ${programTypeCount} records`);
    console.log('\n🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

---

## Option 2: Docker Compose Auto-Seeding (Best for Containerized Setup)

### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: deltaindo_postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - deltaindo-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: deltaindo_backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      NODE_ENV: development
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "5000:5000"
    command: sh -c "npm install && npm run prisma:migrate:deploy && npm run prisma:seed && npm run dev"
    networks:
      - deltaindo-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: deltaindo_frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    networks:
      - deltaindo-network

volumes:
  postgres_data:

networks:
  deltaindo-network:
    driver: bridge
```

### File: `backend/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run migrations and seed on container start
CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run prisma:seed && npm run dev"]
```

---

## Option 3: Init Container Script (Alternative Approach)

### File: `backend/scripts/init-db.sh`

```bash
#!/bin/bash

echo "🔄 Waiting for PostgreSQL to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"
echo "🔄 Running migrations..."
npm run prisma:migrate:deploy

echo "🔄 Seeding database..."
npm run prisma:seed

echo "✅ Database initialization complete!"
npm run dev
```

### Update `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .

# Make init script executable
COPY scripts/init-db.sh /app/init-db.sh
RUN chmod +x /app/init-db.sh

RUN npx prisma generate

EXPOSE 5000

CMD ["/app/init-db.sh"]
```

---

## Option 4: Environment-Based Seeding (Conditional)

### File: `backend/prisma/seed.ts` (Enhanced)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if seeding is enabled
const SEED_DATABASE = process.env.SEED_DATABASE !== 'false';

async function main() {
  if (!SEED_DATABASE) {
    console.log('⏭️  Seeding disabled (set SEED_DATABASE=true to enable)');
    return;
  }

  console.log('🌱 Starting database seeding...');

  try {
    // Check if data already exists
    const picCount = await prisma.pIC.count();
    const marketingCount = await prisma.marketing.count();
    const programTypeCount = await prisma.programType.count();

    if (picCount > 0 && marketingCount > 0 && programTypeCount > 0) {
      console.log('ℹ️  Database already seeded. Skipping...');
      console.log(`  • PIC: ${picCount} records`);
      console.log(`  • Marketing: ${marketingCount} records`);
      console.log(`  • Program Types: ${programTypeCount} records`);
      return;
    }

    // Seed PIC
    console.log('📝 Seeding PIC...');
    const picNames = [
      'Ghaida Trisnanda',
      'Yuyun',
      'Echasita',
      'Erje',
      'Nur Afidah',
      'Hafid',
      'Daniel Setiono'
    ];

    for (const name of picNames) {
      const result = await prisma.pIC.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      console.log(`  ✓ ${result.name}`);
    }
    console.log('✅ PIC seeded');

    // Seed Marketing
    console.log('📝 Seeding Marketing...');
    const marketingNames = [
      'Agustyani', 'Atikah', 'Anik', 'Yoppi', 'Intang', 'Hafid',
      'Ali M', 'Erje', 'Indri', 'Bayu', 'Yunny', 'Eko'
    ];

    for (const name of marketingNames) {
      const result = await prisma.marketing.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      console.log(`  ✓ ${result.name}`);
    }
    console.log('✅ Marketing seeded');

    // Seed Program Types
    console.log('📝 Seeding Program Types...');
    const programTypes = [
      { name: 'Reguler', description: 'Program pelatihan reguler' },
      { name: 'Inhouse', description: 'Program pelatihan di tempat klien' },
      { name: 'BNSP', description: 'Program sertifikasi BNSP' }
    ];

    for (const program of programTypes) {
      const result = await prisma.programType.upsert({
        where: { name: program.name },
        update: { description: program.description },
        create: program
      });
      console.log(`  ✓ ${result.name}`);
    }
    console.log('✅ Program Types seeded');

    // Summary
    const [pic, marketing, programType] = await Promise.all([
      prisma.pIC.count(),
      prisma.marketing.count(),
      prisma.programType.count()
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`  • PIC: ${pic} records`);
    console.log(`  • Marketing: ${marketing} records`);
    console.log(`  • Program Types: ${programType} records`);
    console.log('\n🎉 Seeding completed!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

---

## Environment Variables

### File: `.env.local` (Frontend)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### File: `backend/.env`

```bash
DATABASE_URL=postgresql://deltaindo_user:deltaindo_pass@localhost:5432/deltaindo_db
NODE_ENV=development
SEED_DATABASE=true
```

### File: `.env` (Docker Compose)

```bash
DB_USER=deltaindo_user
DB_PASSWORD=deltaindo_pass
DB_NAME=deltaindo_db
DB_HOST=postgres
DB_PORT=5432
```

---

## Quick Start

### Using Docker Compose (Recommended)

```bash
# 1. Navigate to project root
cd /path/to/project

# 2. Start all services with auto-seeding
docker-compose up --build

# Output will show:
# ✅ PostgreSQL started
# 🔄 Running migrations...
# 🔄 Seeding database...
# ✓ PIC records created
# ✓ Marketing records created
# ✓ Program Types created
# 🎉 Seeding completed!
# ✅ Backend running on port 5000
# ✅ Frontend running on port 3000
```

### Manual Seeding (if needed)

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Disable Seeding (for existing database)

```bash
# In docker-compose.yml or .env
SEED_DATABASE=false
```

---

## Verification

### Check Docker Logs

```bash
# View all logs
docker-compose logs -f

# View only backend logs
docker-compose logs -f backend

# View only database logs
docker-compose logs -f postgres
```

### Verify Data in Database

```bash
# Connect to PostgreSQL container
docker exec -it deltaindo_postgres psql -U deltaindo_user -d deltaindo_db

# Run these queries
SELECT COUNT(*) FROM pic;
SELECT COUNT(*) FROM marketing;
SELECT COUNT(*) FROM program_type;

# View all PIC
SELECT * FROM pic ORDER BY name;

# View all Marketing
SELECT * FROM marketing ORDER BY name;

# View all Program Types
SELECT * FROM program_type;
```

### Check API Endpoints

```bash
# Test PIC endpoint
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show:
# {
#   "success": true,
#   "data": [
#     { "id": 1, "name": "Ghaida Trisnanda", ... },
#     ...
#   ]
# }
```

---

## Troubleshooting

### Seeding Not Running

```bash
# Check if service is healthy
docker-compose ps

# Restart services
docker-compose down
docker-compose up --build

# Check logs
docker-compose logs backend
```

### Database Already Seeded

The seed script includes idempotency checks. If data exists, it will:
- Skip creating duplicates
- Show existing record count
- Not fail the startup

### Reset Database

```bash
# Stop and remove containers/volumes
docker-compose down -v

# Restart fresh
docker-compose up --build
```

### Manual Reset

```bash
# Connect to database
docker exec -it deltaindo_postgres psql -U deltaindo_user -d deltaindo_db

# Clear tables
TRUNCATE pic CASCADE;
TRUNCATE marketing CASCADE;
TRUNCATE program_type CASCADE;

# Exit
\q
```

---

## Best Practices

1. **Idempotent Seeding** - Use `upsert` instead of `create` to prevent duplicate errors
2. **Health Checks** - Docker compose waits for PostgreSQL before starting backend
3. **Conditional Seeding** - Use `SEED_DATABASE` env var to control seeding
4. **Logs** - Always check Docker logs to verify seeding completed
5. **Volume Persistence** - PostgreSQL data persists in Docker volume
6. **Development** - Set `SEED_DATABASE=true` for dev environments
7. **Production** - Set `SEED_DATABASE=false` after first run

---

## Implementation Summary

| Option | Best For | Setup Time | Auto-Run |
|--------|----------|-----------|----------|
| **Option 1** | Simple projects | 5 min | Manual command |
| **Option 2** | Full Docker stack | 10 min | ✅ Automatic |
| **Option 3** | Custom init scripts | 15 min | ✅ Automatic |
| **Option 4** | Enterprise with controls | 10 min | ✅ Conditional |

**Recommended**: Use **Option 2** (Docker Compose) for your containerized setup.

---

## Next Steps

1. ✅ Choose your seeding option (recommend Option 2)
2. ✅ Update `docker-compose.yml` with auto-seeding configuration
3. ✅ Update `backend/Dockerfile` with migration/seed commands
4. ✅ Update `package.json` with seed script
5. ✅ Run `docker-compose up --build`
6. ✅ Verify in logs that seeding completed
7. ✅ Check database records

Done! Your database will now auto-seed on every container startup.

Last Updated: December 29, 2025
