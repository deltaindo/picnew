# Deployment Guide - Auto-Seeding Integration

## Quick Start (Development)

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/deltaindo/picnew.git
cd picnew

# Checkout new-local-version branch
git checkout new-local-version

# Start everything (auto-seeding runs automatically)
docker-compose up
```

**Expected output**:

```
🌱 Checking if database needs seeding...
📋 Starting auto-seeding process...
✅ Auto-seeding completed successfully!
🚀 PIC APP BACKEND - STARTED
✅ Ready to receive requests!
```

**Access**:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

### Option 2: Manual Setup

```bash
# 1. Setup backend
cd backend

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run migrations (if needed)
npm run prisma:migrate

# 5. Start backend (auto-seed runs automatically)
npm run dev
```

**Expected**: Server starts with auto-seeding output

### Option 3: Docker Only (Backend)

```bash
# Navigate to backend
cd backend

# Build Docker image
docker build -f Dockerfile.dev -t pic-backend:dev .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://postgres:postgres@pic_postgres/pic_app" \
  --network=pic-network \
  pic-backend:dev
```

## Verification Steps

### Step 1: Check Backend Health

```bash
curl http://localhost:5000/health
```

**Expected Response**:

```json
{
  "status": "OK",
  "timestamp": "2025-12-29T...",
  "backend": "running",
  "database": "connected"
}
```

### Step 2: Check Master Data API

```bash
# Get PIC list
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Array of 7 PIC entries
```

### Step 3: Verify Frontend Dropdowns

1. Open http://localhost:3000/admin
2. Navigate to "Buat Link Pendaftaran"
3. Check that dropdowns show:
   - **PIC**: 7 entries (Ghaida Trisnanda, Yuyun, etc.)
   - **Marketing**: 12 entries (Agustyani, Atikah, etc.)
   - **Program Type**: 3 entries (Reguler, Inhouse, MitraPJK3)

## Database Management

### Reset Auto-Seeded Data

```bash
cd backend

# Option 1: Prisma reset (deletes all data)
npm run prisma:reset

# Option 2: Manual delete and restart
# Edit backend/prisma/auto-seed.ts to add debug function
# Then restart: npm run dev
```

### Add More Data

Edit `backend/prisma/auto-seed.ts`:

```typescript
// Add to picNames array
const picNames = [
  "Ghaida Trisnanda",
  "New PIC Name", // Add here
  // ...
];
```

Restart backend:

```bash
npm run dev
```

## Production Deployment

### Prerequisites

- Node.js 18+ or Docker
- PostgreSQL 13+ (or use managed database)
- Environment variables configured

### Using Docker

```bash
# Build production image
docker build -f backend/Dockerfile -t pic-backend:latest .

# Run container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  -e PORT=5000 \
  pic-backend:latest
```

### Using Managed Services

#### Railway.app Example

```bash
# Login
railway login

# Link project
railway link

# Deploy
railway deploy
```

#### Heroku Example

```bash
# Create app
heroku create pic-app

# Set environment variables
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku new-local-version:main
```

### Environment Variables (.env.production)

```bash
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/pic_app

# Frontend URL (for CORS)
FRONTEND_URL=https://app.example.com

# JWT Secret
JWT_SECRET=your-secure-secret-key

# Optional: Auto-seed (keep true, won't duplicate)
AUTO_SEED_ENABLED=true
```

## Monitoring

### Check Seeding Status

**On Startup**:

```bash
# Watch server logs
Npm run dev

# Look for:
# ✅ Master data already exists. Skipping auto-seed.
# OR
# 🎉 Auto-seeding completed successfully!
```

**Via API**:

```bash
# Add this endpoint to check status (future enhancement)
GET /api/admin/status
```

### Database Connection Issues

```bash
# Test database connection
cd backend
npm run prisma:status

# If fails, check:
# 1. DATABASE_URL is correct
# 2. Database container is running
# 3. Network connectivity
```

## Troubleshooting

### Issue: "PrismaClient not generated"

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

### Issue: "Database connection refused"

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running:
docker-compose up pic_postgres
```

### Issue: "Auto-seed timeout"

```bash
# Increase timeout in server.js or
# Check database performance
# Run manual prisma queries
npm run prisma:studio
```

### Issue: "Duplicate data after restart"

```bash
# This shouldn't happen. If it does:
# 1. Check Prisma version
npm ls @prisma/client

# 2. Verify upsert is being used in auto-seed.ts
# 3. Check database logs
```

## Backup & Restore

### Backup Database

```bash
# PostgreSQL dump
pg_dump -h localhost -U postgres pic_app > backup.sql

# Or via Docker
docker exec pic_postgres pg_dump -U postgres pic_app > backup.sql
```

### Restore Database

```bash
# From dump
psql -h localhost -U postgres pic_app < backup.sql

# Or via Docker
cat backup.sql | docker exec -i pic_postgres psql -U postgres pic_app
```

## Performance Tips

1. **First startup**: Auto-seed adds ~100ms overhead (one-time)
2. **Subsequent startups**: Check is ~10ms (minimal overhead)
3. **Database indexing**: Already optimized in schema
4. **Connection pooling**: Consider for production

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong DATABASE_URL credentials
- [ ] Enable HTTPS in production
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS properly
- [ ] Set NODE_ENV=production
- [ ] Use environment variables (not hardcoded values)
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Monitor error logs

## Scaling

### For Multiple Instances

```bash
# Auto-seed is idempotent, so it's safe for multiple instances
# Each instance will run auto-seed, but it will:
# 1. Check if data exists
# 2. Skip if already there
# 3. Proceed normally

# Example: Start 3 instances
for i in {1..3}; do
  docker run -p $((5000+i)):5000 pic-backend:latest &
done
```

### Database Connection Pool

Add to `.env.production`:

```bash
# Prisma connection pool
DATABASE_POOL_SIZE=20
```

## Maintenance

### Regular Tasks

**Weekly**:

- Check logs for errors
- Monitor database size
- Verify backups working

**Monthly**:

- Review seed data accuracy
- Update dependencies
- Security audit

**Quarterly**:

- Database optimization
- Performance testing
- Disaster recovery drill

## Support

For deployment issues:

1. Check logs: `docker logs pic_backend`
2. Review docs: `docs/AUTO_SEEDING_SETUP.md`
3. Test endpoints: `curl http://localhost:5000/health`
4. Check database: `npm run prisma:studio`

---

**Last Updated**: December 29, 2025
**Version**: 1.0
**Status**: Production Ready ✅
