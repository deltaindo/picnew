# 🚀 Quick Database Migration - One Command Fix

## 🔴 Problem
```
Error: column registration_links.bidang_id does not exist
```

## ✅ Solution

### **Linux / Mac**
```bash
chmod +x scripts/migrate-db.sh && ./scripts/migrate-db.sh
```

### **Windows (PowerShell)**
```powershell
.\scripts\migrate-db.bat
```

### **Windows (Command Prompt)**
```cmd
scripts\migrate-db.bat
```

## ⏱️ Wait Time
**~5-7 minutes total**

## ✅ What It Does
1. Stops Docker containers
2. Removes old database
3. Rebuilds images
4. Starts services
5. Waits for initialization
6. Verifies schema (personnel_type_id → bidang_id)
7. Checks backend health

## 🎯 Verify Success

```bash
# Check 1: Health endpoint
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}

# Check 2: Open frontend
http://localhost:3000
# Login: admin@example.com / admin123

# Check 3: Test dropdown
# Go to "Tambah Link Pendaftaran"
# Bidang dropdown should show 13 sectors
```

## 📚 Full Guide

See **`MIGRATION_GUIDE.md`** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Manual alternative
- Technical explanation

## 🚫 Troubleshooting

If script fails:

```bash
# Check logs
docker-compose logs backend
docker-compose logs postgres

# Full reset
docker system prune -a --volumes
chmod +x scripts/migrate-db.sh
./scripts/migrate-db.sh
```

## 🚀 Start Migration Now!

**Just run one command above and wait 5-7 minutes.**

Everything else is automatic! ✅
