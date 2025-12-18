# API Quick Start Guide

## Authentication

### Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@delta-indonesia.com",
    "name": "Admin Delta",
    "role": "admin"
  }
}
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/admin/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Training Programs

### List Training Programs
```bash
curl -X GET "http://localhost:5000/api/admin/training?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Training Program
```bash
curl -X POST http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K3 LISTRIK",
    "description": "Training keselamatan listrik",
    "bidangId": 4,
    "durationDays": 5,
    "minParticipants": 10,
    "maxParticipants": 25
  }'
```

### Update Training Program
```bash
curl -X PUT http://localhost:5000/api/admin/training/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K3 LISTRIK UPDATED",
    "status": "active"
  }'
```

### Delete Training Program
```bash
curl -X DELETE http://localhost:5000/api/admin/training/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Master Data - Bidang

### List Bidang
```bash
curl -X GET "http://localhost:5000/api/admin/bidang?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Bidang
```bash
curl -X POST http://localhost:5000/api/admin/bidang \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LISTRIK BARU",
    "description": "Bidang listrik tambahan"
  }'
```

## Master Data - Classes

### List Classes
```bash
curl -X GET "http://localhost:5000/api/admin/classes?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Class
```bash
curl -X POST http://localhost:5000/api/admin/classes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ADVANCED",
    "level": 4
  }'
```

## Master Data - Personnel Types

### List Personnel Types
```bash
curl -X GET http://localhost:5000/api/admin/personnel-types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Personnel Type
```bash
curl -X POST http://localhost:5000/api/admin/personnel-types \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "SUPERVISOR"}'
```

## Testing with Frontend

1. Visit http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@delta-indonesia.com`
   - Password: `Admin123!`
3. Navigate to training programs page
4. Create, update, delete training programs
