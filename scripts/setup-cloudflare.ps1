# Cloudflare Tunnel Setup Script for PicNew (Windows/PowerShell)
# Run this script with: powershell -ExecutionPolicy Bypass -File scripts/setup-cloudflare.ps1

$ErrorActionPreference = "Stop"

# ANSI Color codes for PowerShell 7+
# For older versions, we'll use simple text
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Blue
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

# Check if cloudflared is installed
function Check-Cloudflared {
    Write-Info "Checking if cloudflared is installed..."
    
    try {
        $version = cloudflared --version
        Write-Success "cloudflared is installed"
        Write-Host $version
    }
    catch {
        Write-Error-Custom "cloudflared is not installed"
        Write-Host "`nPlease install cloudflared first:"
        Write-Host "  1. Using chocolatey: choco install cloudflared"
        Write-Host "  2. Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        Write-Host "  3. Or download Windows installer: https://github.com/cloudflare/cloudflared/releases`n"
        exit 1
    }
}

# Authenticate with Cloudflare
function Authenticate-Cloudflare {
    Write-Header "Step 1: Authenticating with Cloudflare"
    
    Write-Host "This will open your browser to authorize cloudflared access to your domain."
    Write-Host "Please complete the authentication process in your browser.`n"
    
    cloudflared tunnel login
    
    Write-Success "Authentication successful"
}

# Copy certificate
function Copy-Certificate {
    Write-Header "Step 2: Copying Cloudflare Certificate"
    
    $certSource = "$env:USERPROFILE\.cloudflared\cert.pem"
    $certDestDir = "./cloudflare"
    $certDest = "./cloudflare/cert.pem"
    
    if (-not (Test-Path $certDestDir)) {
        New-Item -ItemType Directory -Path $certDestDir -Force | Out-Null
        Write-Info "Created cloudflare directory"
    }
    
    if (Test-Path $certSource) {
        Copy-Item -Path $certSource -Destination $certDest -Force
        Write-Success "Certificate copied to ./cloudflare/cert.pem"
    }
    else {
        Write-Error-Custom "Certificate not found at $certSource"
        Write-Host "Make sure you completed the authentication step above."
        exit 1
    }
}

# Create/verify config.yml
function Verify-Config {
    Write-Header "Step 3: Verifying Cloudflare Configuration"
    
    $configFile = "./cloudflare/config.yml"
    
    if (Test-Path $configFile) {
        Write-Success "config.yml already exists"
    }
    else {
        Write-Warning-Custom "config.yml not found - you'll need to create it manually"
        Write-Host "Run the following:"
        Write-Host "  cp cloudflare/config.yml.example cloudflare/config.yml"`n"
    }
}

# Get tunnel information
function Get-TunnelInfo {
    Write-Header "Step 4: Getting Tunnel Information"
    
    Write-Host "Available tunnels:"`n"
    cloudflared tunnel list
    
    Write-Host "`n"
    Write-Warning-Custom "Please note your tunnel name and token for the next step."
}

# Create .env file
function Create-EnvFile {
    Write-Header "Step 5: Creating .env File"
    
    if (Test-Path ./.env) {
        Write-Warning-Custom ".env already exists, skipping"
        return
    }
    
    $tunnelToken = Read-Host "Enter your Cloudflare Tunnel Token"
    $domain = Read-Host "Enter your domain (e.g., yourdomain.com)"
    
    $envContent = @"
# Database
DB_USER=postgres
DB_PASSWORD=change_me_to_secure_password
DB_NAME=pic_app
DB_PORT=5432

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=change_me_to_secure_jwt_secret
JWT_EXPIRY=24h

# Frontend
NEXT_PUBLIC_API_URL=https://api.$domain/api

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=$tunnelToken
CLOUDFLARE_DOMAIN=$domain
"@
    
    $envContent | Set-Content -Path ./.env -Encoding UTF8
    Write-Success ".env file created"
    Write-Warning-Custom "Please update database and JWT secrets in .env file"
}

# Verify setup
function Verify-Setup {
    Write-Header "Step 6: Verifying Setup"
    
    $checksPass = 0
    $checksTotal = 3
    
    if (Test-Path ./cloudflare) {
        Write-Success "cloudflare/ directory exists"
        $checksPass++
    }
    else {
        Write-Error-Custom "cloudflare/ directory not found"
    }
    
    if (Test-Path ./cloudflare/cert.pem) {
        Write-Success "cert.pem exists"
        $checksPass++
    }
    else {
        Write-Error-Custom "cert.pem not found"
    }
    
    if (Test-Path ./.env) {
        Write-Success ".env file exists"
        $checksPass++
    }
    else {
        Write-Error-Custom ".env file not found"
    }
    
    Write-Host "`nSetup Progress: $checksPass/$checksTotal`n"
}

# Print next steps
function Print-NextSteps {
    Write-Header "Setup Complete!"
    
    Write-Host "Next Steps:`n" -ForegroundColor Yellow
    
    Write-Host "1. Update your domain in cloudflare/config.yml:"
    Write-Host "   Replace 'yourdomain.com' with your actual domain`n"
    
    Write-Host "2. Configure public hostnames in Cloudflare Dashboard:"
    Write-Host "   - Networks > Tunnels > Select your tunnel"
    Write-Host "   - Add routes for app.yourdomain.com -> frontend:3000"
    Write-Host "   - Add routes for api.yourdomain.com -> backend:5000`n"
    
    Write-Host "3. Start your Docker services:"
    Write-Host "   docker-compose up -d`n"
    
    Write-Host "4. Verify tunnel connection:"
    Write-Host "   docker-compose logs cloudflare-tunnel`n"
    
    Write-Host "5. Test your application:"
    Write-Host "   https://app.yourdomain.com"
    Write-Host "   https://api.yourdomain.com/api/health`n"
    
    Write-Host "Documentation:" -ForegroundColor Yellow
    Write-Host "See cloudflare-setup-guide.md for detailed instructions`n"
}

# Main execution
function Main {
    Write-Header "PicNew - Cloudflare Tunnel Setup (Windows)"
    
    Check-Cloudflared
    Authenticate-Cloudflare
    Copy-Certificate
    Verify-Config
    Get-TunnelInfo
    Create-EnvFile
    Verify-Setup
    Print-NextSteps
}

# Run main function
Main
