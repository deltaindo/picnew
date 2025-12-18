# PIC App - Training Registration & Document Management System

**Status**: Phase 1 - Foundation Setup

## Quick Start

```bash
# Clone repository
git clone https://github.com/deltaindo/picnew.git
cd picnew

# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
cp .env.local.example .env.local

# Database setup
cd ..
docker-compose up -d
```

## Documentation

- [System Architecture](./docs/architecture.md)
- [Master Data](./docs/master-data.md)
- [Setup Guide](./docs/setup-guide.md)
- [API Reference](./docs/api-reference.md)

## Tech Stack

- Frontend: Next.js 14+
- Backend: Node.js/Express
- Database: PostgreSQL
- Storage: S3/MinIO
- Notifications: SendGrid + Twilio

## Project Structure

```
.
├── backend/
├── frontend/
├── docs/
└── docker-compose.yml
```

## Development Phases

- [x] Phase 1: Foundation & Database Setup
- [ ] Phase 2: Registration System
- [ ] Phase 3: Admin Dashboard
- [ ] Phase 4: Notifications
- [ ] Phase 5: Deploy & Polish

## License

Proprietary - Delta Indonesia
