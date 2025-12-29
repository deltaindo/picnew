# PicNew - Cloudflare Tunnel Setup

## Quick Start

This repository has been configured with **Cloudflare Tunnel** support for secure, external access without exposing your server's IP address.

### Choose Your Setup Method

#### 🚀 Automated Setup (Recommended)

**For macOS/Linux:**
```bash
bash scripts/setup-cloudflare.sh
```

**For Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-cloudflare.ps1
```

The script will:
- ✅ Verify cloudflared CLI is installed
- ✅ Authenticate with Cloudflare
- ✅ Copy SSL certificates
- ✅ Create configuration files
- ✅ Generate `.env` with your tunnel token

#### 📖 Manual Setup

If you prefer manual setup, follow the detailed guide: **[cloudflare-setup-guide.md](./cloudflare-setup-guide.md)**

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Your Server (Behind NAT)         │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Docker Compose Network          │ │
│  │                                    │ │
│  │  Frontend ──────────┐              │ │
│  │  (Next.js, :3000)   │              │ │
│  │                     │              │ │
│  │  Backend ───────────┤──► Cloudflare│ │
│  │  (Node.js, :5000)   │    Tunnel    │ │
│  │                     │              │ │
│  │  Database ──────────┘              │ │
│  │  (Postgres, :5432)                 │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
                    ↓
         ┌──────────────────────┐
         │  Cloudflare Tunnel   │
         │  (No port exposure)  │
         └──────────────────────┘
                    ↓
         ┌──────────────────────┐
         │  Your Domain         │
         │  yourdomain.com      │
         │  api.yourdomain.com  │
         └──────────────────────┘
                    ↓
         ┌──────────────────────┐
         │    Users Online      │
         │  Worldwide Access    │
         └──────────────────────┘
```

---

## File Structure

```
picnew/
├── docker-compose.yml           # ✨ Updated with cloudflare-tunnel service
├── .env.example                 # Environment variables template
├── .env                         # Your actual config (NOT in git)
│
├── cloudflare/
│   ├── config.yml              # Tunnel routing configuration
│   ├── cert.pem                # Cloudflare credentials (NOT in git)
│   └── .gitignore              # Keeps secrets out of git
│
├── scripts/
│   ├── setup-cloudflare.sh      # Linux/macOS setup automation
│   ├── setup-cloudflare.ps1     # Windows setup automation
│   └── README.md                # Script documentation
│
├── backend/
│   ├── src/
│   └── Dockerfile
│
├── frontend/
│   ├── pages/
│   └── Dockerfile.dev
│
├── cloudflare-setup-guide.md    # Detailed step-by-step guide
├── CLOUDFLARE_SETUP.md          # This file
└── README.md                    # Main project README
```

---

## Environment Variables

Required `.env` file variables:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=pic_app
DB_PORT=5432

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRY=24h

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Cloudflare Tunnel (from setup script)
CLOUDFLARE_TUNNEL_TOKEN=<your_tunnel_token>
CLOUDFLARE_DOMAIN=yourdomain.com
```

**⚠️ Important:** Add `.env` to `.gitignore` - never commit secrets!

```bash
# Verify .env is not tracked
echo ".env" >> .gitignore
```

---

## Starting Your Services

### 1. Build and Start Containers

```bash
# Build images and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Verify Cloudflare Connection

```bash
# Check tunnel logs
docker-compose logs cloudflare-tunnel

# Expected output:
# "Connection established"
# "Tunnel connected successfully"
```

### 3. Test Your Application

```bash
# Frontend
curl https://app.yourdomain.com

# Backend health check
curl https://api.yourdomain.com/api/health

# API endpoint
curl https://api.yourdomain.com/api/users
```

---

## Configuration Details

### docker-compose.yml Changes

New `cloudflare-tunnel` service:

```yaml
cloudflare-tunnel:
  image: cloudflare/cloudflared:latest
  container_name: pic_cloudflare_tunnel
  command: tunnel --config /etc/cloudflared/config.yml run
  environment:
    TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
  volumes:
    - ./cloudflare/config.yml:/etc/cloudflared/config.yml:ro
    - ./cloudflare/cert.pem:/etc/cloudflared/cert.pem:ro
  networks:
    - pic_network
  depends_on:
    - backend
    - frontend
  restart: unless-stopped
```

### cloudflare/config.yml

Defines routing for your services:

```yaml
ingress:
  # Frontend
  - hostname: app.yourdomain.com
    service: http://frontend:3000
  
  # Backend API
  - hostname: api.yourdomain.com
    service: http://backend:5000
  
  # Catch-all (404)
  - service: http_status:404
```

---

## Monitoring & Debugging

### View Tunnel Status

```bash
# Cloudflare tunnel logs
docker-compose logs -f cloudflare-tunnel

# All service logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Common Issues

**Tunnel shows "DEGRADED":**
```bash
# Restart the tunnel
docker-compose restart cloudflare-tunnel

# Check logs
docker-compose logs cloudflare-tunnel
```

**Backend not accessible:**
```bash
# Verify backend is running
docker-compose ps backend

# Test internal connectivity
docker-compose exec cloudflare-tunnel ping backend

# Check backend logs
docker-compose logs -f backend
```

**Certificate error:**
```bash
# Regenerate certificate
cloudflared tunnel login
cp ~/.cloudflared/cert.pem ./cloudflare/cert.pem

# Restart tunnel
docker-compose restart cloudflare-tunnel
```

---

## Security Best Practices

### ✅ DO
- ✅ Keep `.env` in `.gitignore`
- ✅ Rotate `JWT_SECRET` regularly
- ✅ Use strong database passwords
- ✅ Enable Cloudflare WAF (Web Application Firewall)
- ✅ Monitor access logs
- ✅ Use HTTPS for all external connections
- ✅ Keep Docker images updated

### ❌ DON'T
- ❌ Commit `.env` or `cert.pem` to Git
- ❌ Use default passwords
- ❌ Share tunnel tokens
- ❌ Expose Docker ports to 0.0.0.0
- ❌ Run containers as root
- ❌ Use old/outdated base images

---

## Maintenance

### Update Cloudflared

```bash
# Pull latest image
docker-compose pull cloudflare-tunnel

# Restart service
docker-compose restart cloudflare-tunnel
```

### Rotate Credentials

```bash
# Every 90 days:
cloudflared tunnel login
cp ~/.cloudflared/cert.pem ./cloudflare/cert.pem
docker-compose restart cloudflare-tunnel
```

### Backup Database

```bash
# Backup PostgreSQL data
docker-compose exec postgres pg_dump -U postgres pic_app > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres pic_app < backup.sql
```

---

## Useful Commands

```bash
# Show all running services
docker-compose ps

# View service logs (last 50 lines)
docker-compose logs --tail=50

# Follow logs in real-time
docker-compose logs -f

# Stop all services
docker-compose stop

# Start all services
docker-compose start

# Restart specific service
docker-compose restart cloudflare-tunnel

# Rebuild and restart
docker-compose up -d --build

# Remove everything (⚠️ data loss!)
docker-compose down -v

# Execute command in container
docker-compose exec backend npm run migrations

# Check network connectivity
docker-compose exec cloudflare-tunnel ping backend
```

---

## Support & Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **Troubleshooting:** See [cloudflare-setup-guide.md](./cloudflare-setup-guide.md#troubleshooting)
- **Setup Scripts:** See [scripts/README.md](./scripts/README.md)

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Tunnel won't connect | [See here](#tunnel-shows-degraded-or-down) |
| Certificate error | [See here](#certificate-error) |
| Can't reach backend | [See here](#backend-not-accessible) |
| 404 errors | Check `cloudflare/config.yml` routing |
| Slow connection | Check Cloudflare Analytics tab |
| HTTPS errors | Verify SSL/TLS mode is "Full" |

---

## What's New

### Added with Cloudflare Integration
- ✨ No open ports - Zero Trust security
- ✨ Automatic HTTPS certificates
- ✨ DDoS protection built-in
- ✨ Global CDN acceleration
- ✨ WAF (Web Application Firewall)
- ✨ Rate limiting and bot management
- ✨ Instant DNS propagation
- ✨ Free tier available

---

## Version History

**v1.0.0** (2025-12-29)
- Initial Cloudflare Tunnel integration
- Added automated setup scripts (Bash & PowerShell)
- Comprehensive documentation
- Docker Compose with tunnel service

---

**Questions?** See [cloudflare-setup-guide.md](./cloudflare-setup-guide.md) for detailed instructions.

**Last Updated:** December 29, 2025
