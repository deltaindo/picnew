# 🚀 PIC App - Setup Instructions

## Problem You're Having

```
Database: undefined:undefined/undefined
```

This means **backend/.env is missing or not being read**.

---

## ✅ SOLUTION - 5 Minutes

### Step 1: Create .env File

```bash
cd backend
cp .env.example .env
```

### Step 2: Edit backend/.env

```bash
# Open and edit:
cat backend/.env

# Should look like:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Make sure the values match YOUR system!**

### Step 3: Verify PostgreSQL

```bash
# Check if PostgreSQL is running
psql -l

# If error, start it:
brew services start postgresql  # macOS
# OR
sudo service postgresql start   # Linux
```

### Step 4: Create Database

```bash
# Create database
createdb pic_app

# Load tables
psql pic_app < backend/database/schema.sql

# Load constraints
psql pic_app < backend/database/constraints.sql
```

### Step 5: Start Backend

```bash
cd backend
npm install
npm run dev
```

**WAIT FOR THIS MESSAGE:**
```
==================================================
PIC App Backend running on port 5000
Environment: development
Database: localhost:5432/pic_app
==================================================
```

**If you see that, you're GOOD! ✅**

### Step 6: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

### Step 7: Visit http://localhost:3000

✅ You're done!

---

## 🔍 Troubleshooting

### Error: "Failed to connect to database"

**Fix:**
```bash
# Make sure PostgreSQL is running
psql -l

# If error, start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### Error: "database \"pic_app\" does not exist"

**Fix:**
```bash
createdb pic_app
psql pic_app < backend/database/schema.sql
```

### Error: "Cannot find module 'dotenv'"

**Fix:**
```bash
cd backend
npm install
```

### Still getting "Database: undefined:undefined/undefined"

**Fix:**
```bash
# Check if .env exists
ls -la backend/.env

# If not found:
cp backend/.env.example backend/.env

# Then:
kill all node processes: pkill -f "node"
cd backend && npm run dev
```

---

## ✅ Checklist

- [ ] `backend/.env` file created (copy from .env.example)
- [ ] DB_HOST, DB_PORT, DB_USER, DB_PASSWORD set correctly
- [ ] PostgreSQL running: `psql -l` works
- [ ] Database created: `psql pic_app -c "SELECT 1"` works
- [ ] Backend running: `npm run dev` shows success message
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Frontend running: `npm run dev` from frontend folder
- [ ] Can visit: `http://localhost:3000`

---

## 📊 Expected Output

When backend starts successfully:

```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`

==================================================
PIC App Backend running on port 5000
Environment: development
Database: localhost:5432/pic_app
==================================================
```

---

## 🎯 Next Steps

1. Create training via admin panel
2. Generate registration link
3. Share link with trainees
4. Trainees fill form

---

**You're all set! 🚀**
