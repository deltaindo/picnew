# PicNew Setup Scripts

Automated scripts for setting up Cloudflare Tunnel integration.

## Available Scripts

### 1. **setup-cloudflare.sh** (Linux/macOS)

Automated setup script for Unix-like systems.

**Requirements:**
- Bash 4.0+
- `cloudflared` CLI installed
- Cloudflare account with a domain

**Usage:**
```bash
bash scripts/setup-cloudflare.sh
```

**What it does:**
- ✅ Verifies `cloudflared` is installed
- ✅ Authenticates with Cloudflare (opens browser)
- ✅ Downloads and copies SSL certificate
- ✅ Creates tunnel configuration
- ✅ Generates `.env` file
- ✅ Validates setup

**Installation of cloudflared (if needed):**

**macOS:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Ubuntu/Debian:**
```bash
sudo apt-get install cloudflared
```

**Fedora/RHEL:**
```bash
sudo dnf install cloudflared
```

---

### 2. **setup-cloudflare.ps1** (Windows/PowerShell)

Automated setup script for Windows systems.

**Requirements:**
- PowerShell 5.0+
- `cloudflared` CLI installed
- Cloudflare account with a domain

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-cloudflare.ps1
```

**Or run from PowerShell directly:**
```powershell
.\scripts\setup-cloudflare.ps1
```

**What it does:**
- ✅ Verifies `cloudflared` is installed
- ✅ Authenticates with Cloudflare (opens browser)
- ✅ Downloads and copies SSL certificate
- ✅ Creates tunnel configuration
- ✅ Generates `.env` file
- ✅ Validates setup

**Installation of cloudflared (if needed):**

**Using Chocolatey:**
```powershell
choco install cloudflared
```

**Or download directly:**
https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

---

## Step-by-Step Walkthrough

Both scripts follow these steps:

### Step 1: Check Installation
Verifies that `cloudflared` CLI is installed on your system.

### Step 2: Authenticate with Cloudflare
- Opens your browser
- You select your domain
- Authorizes `cloudflared` to manage tunnels

### Step 3: Copy Certificate
- Downloads the authentication certificate
- Places it in `./cloudflare/cert.pem`

### Step 4: Get Tunnel Information
- Lists your available Cloudflare tunnels
- Shows tunnel names and IDs

### Step 5: Create .env File
- Prompts for Tunnel Token
- Prompts for Domain
- Creates `.env` with all required variables

### Step 6: Verify Setup
Checks that all required files exist:
- `cloudflare/` directory
- `cloudflare/cert.pem` file
- `.env` file

---

## Manual Setup (Alternative)

If you prefer not to use scripts, follow the detailed manual guide:

**[cloudflare-setup-guide.md](../cloudflare-setup-guide.md)**

---

## Troubleshooting Scripts

### On macOS/Linux:

**Script not executable:**
```bash
chmod +x scripts/setup-cloudflare.sh
bash scripts/setup-cloudflare.sh
```

**cloudflared not found:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Permission denied:**
```bash
sudo bash scripts/setup-cloudflare.sh
```

### On Windows:

**Script execution disabled:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

**cloudflared not found:**
```powershell
choco install cloudflared
# or download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

**Certificate path issues:**
Ensure your user profile directory is accessible:
```powershell
Test-Path $env:USERPROFILE\.cloudflared\cert.pem
```

---

## After Running Setup

### 1. Update Configuration

Edit `cloudflare/config.yml`:
```bash
vim cloudflare/config.yml
# or
code cloudflare/config.yml
```

Replace `yourdomain.com` with your actual domain.

### 2. Secure Your Secrets

Verify `.env` is in `.gitignore`:
```bash
grep ".env" .gitignore
```

If missing:
```bash
echo ".env" >> .gitignore
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Connection

```bash
docker-compose logs cloudflare-tunnel
```

Look for:
```
Connection established
Tunnel connected successfully
```

---

## Environment Variables Explained

The script creates a `.env` file with:

| Variable | Purpose | Example |
|----------|---------|----------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `secure_password_123` |
| `DB_NAME` | Database name | `pic_app` |
| `DB_PORT` | Database port | `5432` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Backend API port | `5000` |
| `JWT_SECRET` | JWT signing secret | `random_secure_string` |
| `JWT_EXPIRY` | Token expiration time | `24h` |
| `NEXT_PUBLIC_API_URL` | Frontend API endpoint | `https://api.yourdomain.com/api` |
| `CLOUDFLARE_TUNNEL_TOKEN` | Tunnel authentication | (auto-populated) |
| `CLOUDFLARE_DOMAIN` | Your domain | `yourdomain.com` |

---

## Script Comparison

| Feature | Bash | PowerShell |
|---------|------|------------|
| OS Support | Linux/macOS | Windows |
| Colored Output | Yes | Yes |
| Interactive | Yes | Yes |
| Automatic | Yes | Yes |
| Error Handling | Yes | Yes |
| User Prompts | Yes | Yes |

---

## Support

If scripts fail, see:
- [cloudflare-setup-guide.md](../cloudflare-setup-guide.md) - Detailed manual steps
- [CLOUDFLARE_SETUP.md](../CLOUDFLARE_SETUP.md) - Quick reference
- [Cloudflare Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

**Last Updated:** December 29, 2025
