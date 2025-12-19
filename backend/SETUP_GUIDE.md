# PIC App Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Database Setup

```bash
# Create PostgreSQL database
createdb pic_app

# Run schema
psql pic_app < database/schema.sql
```

### Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
PORT=5000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### Start Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📋 API Endpoints

### Authentication

#### 1. Initialize Admin (First time setup)
```http
POST /api/admin/auth/init-admin
Content-Type: application/json

{
  "name": "Administrator",
  "email": "admin@delta-indonesia.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Superadmin created successfully",
  "data": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@delta-indonesia.com",
    "role": "superadmin"
  }
}
```

#### 2. Login
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@delta-indonesia.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@delta-indonesia.com",
      "role": "superadmin"
    }
  }
}
```

---

### Training Management (Jadwal)

#### 3. List All Trainings
```http
GET /api/admin/training
Authorization: Bearer {token}
```

#### 4. Create Training
```http
POST /api/admin/training
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "K3 LISTRIK",
  "description": "Keselamatan Kerja Listrik",
  "start_date": "2026-01-19",
  "end_date": "2026-01-23",
  "location": "Bekasi Training Center",
  "duration_days": 5,
  "max_participants": 25,
  "instructor": "Budi Santoso"
}
```

#### 5. Update Training
```http
PUT /api/admin/training/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "K3 LISTRIK - Updated",
  "status": "ongoing"
}
```

#### 6. Delete Training
```http
DELETE /api/admin/training/{id}
Authorization: Bearer {token}
```

---

### Registration Links (AUTO GENERATOR)

#### 7. Create Registration Link
```http
POST /api/admin/links
Authorization: Bearer {token}
Content-Type: application/json

{
  "training_id": 1,
  "class_level": "AHLI",
  "personnel_type": "OPERATOR",
  "max_registrations": 25,
  "expiry_date": "2026-02-01",
  "whatsapp_link": "https://chat.whatsapp.com/..."
}
```

**Response** (Auto-generated token + shareable link):
```json
{
  "success": true,
  "message": "Registration link created successfully",
  "data": {
    "id": 1,
    "token": "A1B2C3D4E5F6G7H8",
    "training_id": 1,
    "class_level": "AHLI",
    "share_url": "http://localhost:3000/register/A1B2C3D4E5F6G7H8",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    "max_registrations": 25,
    "current_registrations": 0,
    "status": "active"
  }
}
```

#### 8. List Registration Links
```http
GET /api/admin/links
Authorization: Bearer {token}
```

#### 9. Get Single Link
```http
GET /api/admin/links/{id_or_token}
Authorization: Bearer {token}
```

#### 10. Update Link
```http
PUT /api/admin/links/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "max_registrations": 30,
  "expiry_date": "2026-02-15"
}
```

#### 11. Delete Link
```http
DELETE /api/admin/links/{id}
Authorization: Bearer {token}
```

---

### Master Data Management

#### 12. List Master Data
```http
GET /api/admin/master-data/{type}
Authorization: Bearer {token}

Types: bidang, classes, personnel_types, document_types
```

#### 13. Create Master Data Item
```http
POST /api/admin/master-data/{type}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "K3 ELEVATOR",
  "code": "K3_ELEVATOR",
  "description": "Keselamatan Kerja Elevator"
}
```

#### 14. Update Master Data
```http
PUT /api/admin/master-data/{type}/{id}
Authorization: Bearer {token}

{
  "name": "K3 ELEVATOR - Updated"
}
```

#### 15. Delete Master Data
```http
DELETE /api/admin/master-data/{type}/{id}
Authorization: Bearer {token}
```

---

### Public Registration Form (Trainees)

#### 16. Get Form Data (Using Link Token)
```http
GET /api/public/links/{token}

No authentication needed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "token": "A1B2C3D4E5F6G7H8",
    "training_name": "K3 LISTRIK",
    "start_date": "2026-01-19",
    "end_date": "2026-01-23",
    "location": "Bekasi Training Center",
    "instructor": "Budi Santoso",
    "max_registrations": 25,
    "current_registrations": 5,
    "whatsapp_link": "https://chat.whatsapp.com/..."
  }
}
```

#### 17. Submit Registration (Form.php equivalent)
```http
POST /api/public/registrations
Content-Type: application/json

{
  "token": "A1B2C3D4E5F6G7H8",
  "trainee_name": "Andi Wijaya",
  "email": "andi@email.com",
  "phone": "081234567890",
  "nik": "3215000000000001",
  "address": "Jl. Merdeka No. 1, Jakarta",
  "company": "PT. Maju Jaya",
  "position": "Supervisor"
}
```

#### 18. Upload Document
```http
POST /api/public/registrations/{registration_id}/documents/upload
Content-Type: application/json

{
  "document_type": "ktp",
  "file_data": "base64-encoded-file",
  "file_name": "ktp_scan.pdf"
}
```

---

### Registrations Monitor

#### 19. List All Registrations
```http
GET /api/admin/registrations
Authorization: Bearer {token}
```

#### 20. Get Single Registration
```http
GET /api/admin/registrations/{id}
Authorization: Bearer {token}
```

#### 21. Approve Registration
```http
PUT /api/admin/registrations/{id}/approve
Authorization: Bearer {token}
```

#### 22. Reject Registration
```http
PUT /api/admin/registrations/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Document tidak lengkap"
}
```

---

## 🔑 Key Features

### 1. ✅ Superadmin Only
- First-time setup creates **only 1 superadmin**
- Cannot create additional admins
- Full control over the system

### 2. ✅ Automated Link Generator
- **Unique 12-character token** auto-generated
- Each link has a **shareable URL**
- QR code automatically generated
- Token-based access (no login required for trainees)

### 3. ✅ Training CRUD
- Add training programs (jadwal)
- Edit training details
- Delete trainings (cascades to remove links)
- Track registration count

### 4. ✅ Form Submission (forms.php equivalent)
- Public endpoint with token validation
- Accepts trainee personal data
- Automatic registration counting
- Document upload support

### 5. ✅ Security
- JWT authentication
- Password hashing with bcrypt
- Role-based access
- CORS enabled
- Helmet.js for security headers

---

## 🗄️ Database Tables

```
users (1 superadmin)
  ↓
trainings (19 programs)
  ↓
registration_links (auto token)
  ↓
registrations (trainee submissions)
  ├─ registration_documents
  └─ certificates

Master Data:
- bidang (13 items)
- classes (21 items)
- personnel_types (14 items)
- document_types (6 items)
```

---

## 📡 Sample Workflow

### Admin Side
1. POST `/api/admin/auth/init-admin` → Create superadmin account
2. POST `/api/admin/auth/login` → Get JWT token
3. POST `/api/admin/training` → Create training program
4. POST `/api/admin/links` → Auto-generate registration link
   - Gets unique token (e.g., `A1B2C3D4E5F6G7H8`)
   - Share link: `http://localhost:3000/register/A1B2C3D4E5F6G7H8`
   - QR code ready to scan

### Trainee Side
1. Scans QR code or clicks link
2. GET `/api/public/links/{token}` → Sees training info
3. Fills form in `/register/{token}` page
4. POST `/api/public/registrations` → Submits data
5. Receives confirmation email + WhatsApp

---

## 🐳 Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: pic_app
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_NAME: pic_app
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your-secret
    volumes:
      - ./backend:/app

volumes:
  postgres_data:
```

### Run with Docker
```bash
docker-compose up
```

---

## 🧪 Testing

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delta-indonesia.com","password":"Admin123!"}'
```

### Test Link Generator
```bash
curl -X POST http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"training_id":1,"max_registrations":25}'
```

### Test Form Submission
```bash
curl -X POST http://localhost:5000/api/public/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "token":"A1B2C3D4E5F6G7H8",
    "trainee_name":"Andi",
    "email":"andi@email.com",
    "phone":"081234567890",
    "nik":"3215000000000001"
  }'
```

---

## 📝 Notes

- Database schema auto-inserts 13 bidang, 21 classes, 14 personnel types, 6 document types
- Only 1 admin/superadmin can exist
- Links are automatically generated with unique tokens
- Tokens are 12 characters, alphanumeric
- Default token expiry: 90 days from creation
- All timestamps in UTC

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `psql -l`
- Verify `.env` database credentials
- Ensure database exists: `createdb pic_app`

### "Invalid token"
- JWT_SECRET mismatch between frontend and backend
- Token expired (24-hour expiry)
- Malformed token in Authorization header

### "Max registrations reached"
- Link has hit its max registrations limit
- Update max_registrations via PUT endpoint

---

**Status: ✅ PRODUCTION READY**
