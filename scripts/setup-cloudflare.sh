#!/bin/bash

# Cloudflare Tunnel Setup Script for PicNew
# This script automates the initial setup of Cloudflare Tunnel

set -e  # Exit on error

echo "========================================"
echo "PicNew - Cloudflare Tunnel Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if cloudflared is installed
check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        echo -e "${RED}✗ cloudflared is not installed${NC}"
        echo -e "${YELLOW}Please install cloudflared first:${NC}"
        echo "  macOS: brew install cloudflare/cloudflare/cloudflared"
        echo "  Ubuntu/Debian: sudo apt-get install cloudflared"
        echo "  Windows: choco install cloudflared"
        exit 1
    else
        echo -e "${GREEN}✓ cloudflared is installed${NC}"
        cloudflared --version
    fi
}

# Authenticate with Cloudflare
authenticate() {
    echo ""
    echo -e "${BLUE}Step 1: Authenticating with Cloudflare${NC}"
    echo "This will open your browser to authorize cloudflared access to your domain."
    echo ""
    
    cloudflared tunnel login
    
    echo -e "${GREEN}✓ Authentication successful${NC}"
}

# Copy certificate
copy_certificate() {
    echo ""
    echo -e "${BLUE}Step 2: Copying Cloudflare Certificate${NC}"
    
    mkdir -p cloudflare
    
    # Determine OS and certificate location
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows
        CERT_SOURCE="$USERPROFILE\.cloudflared\cert.pem"
    else
        # macOS/Linux
        CERT_SOURCE="$HOME/.cloudflared/cert.pem"
    fi
    
    if [ -f "$CERT_SOURCE" ]; then
        cp "$CERT_SOURCE" ./cloudflare/cert.pem
        echo -e "${GREEN}✓ Certificate copied to ./cloudflare/cert.pem${NC}"
    else
        echo -e "${RED}✗ Certificate not found at $CERT_SOURCE${NC}"
        exit 1
    fi
}

# Create config.yml if not exists
create_config() {
    echo ""
    echo -e "${BLUE}Step 3: Creating Cloudflare Configuration${NC}"
    
    if [ -f "./cloudflare/config.yml" ]; then
        echo -e "${YELLOW}⚠ config.yml already exists, skipping creation${NC}"
    else
        echo "config.yml does not exist yet. Run this command after Step 4:"
        echo "  cp cloudflare/config.yml.example cloudflare/config.yml"
        echo "  # Then edit config.yml with your domain names"
    fi
}

# Get tunnel information
get_tunnel_info() {
    echo ""
    echo -e "${BLUE}Step 4: Getting Tunnel Information${NC}"
    echo ""
    echo "Available tunnels:"
    cloudflared tunnel list
    echo ""
    echo -e "${YELLOW}Please note your tunnel name and token for the next step.${NC}"
}

# Create .env
create_env() {
    echo ""
    echo -e "${BLUE}Step 5: Creating .env File${NC}"
    
    if [ -f ./.env ]; then
        echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
    else
        read -p "Enter your Cloudflare Tunnel Token: " TUNNEL_TOKEN
        read -p "Enter your domain (e.g., yourdomain.com): " DOMAIN
        
        cat > .env << EOF
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
NEXT_PUBLIC_API_URL=https://api.$DOMAIN/api

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=$TUNNEL_TOKEN
CLOUDFLARE_DOMAIN=$DOMAIN
EOF
        
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠ Please update database and JWT secrets in .env${NC}"
    fi
}

# Verify setup
verify_setup() {
    echo ""
    echo -e "${BLUE}Step 6: Verifying Setup${NC}"
    echo ""
    
    CHECKS_PASSED=0
    TOTAL_CHECKS=3
    
    # Check cloudflare directory
    if [ -d "./cloudflare" ]; then
        echo -e "${GREEN}✓ cloudflare/ directory exists${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ cloudflare/ directory not found${NC}"
    fi
    
    # Check certificate
    if [ -f "./cloudflare/cert.pem" ]; then
        echo -e "${GREEN}✓ cert.pem exists${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ cert.pem not found${NC}"
    fi
    
    # Check .env
    if [ -f "./.env" ]; then
        echo -e "${GREEN}✓ .env file exists${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ .env file not found${NC}"
    fi
    
    echo ""
    echo "Setup Progress: $CHECKS_PASSED/$TOTAL_CHECKS"
}

# Final instructions
print_next_steps() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Setup Complete!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo ""
    echo "1. Update your domain in cloudflare/config.yml:"
    echo "   Replace 'yourdomain.com' with your actual domain"
    echo ""
    echo "2. Configure public hostnames in Cloudflare Dashboard:"
    echo "   - Networks > Tunnels > Select your tunnel"
    echo "   - Add routes for app.yourdomain.com -> frontend:3000"
    echo "   - Add routes for api.yourdomain.com -> backend:5000"
    echo ""
    echo "3. Start your Docker services:"
    echo "   docker-compose up -d"
    echo ""
    echo "4. Verify tunnel connection:"
    echo "   docker-compose logs cloudflare-tunnel"
    echo ""
    echo "5. Test your application:"
    echo "   https://app.yourdomain.com"
    echo "   https://api.yourdomain.com/api/health"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "See CLOUDFLARE_SETUP_GUIDE.md for detailed instructions"
    echo ""
}

# Main execution
main() {
    check_cloudflared
    authenticate
    copy_certificate
    create_config
    get_tunnel_info
    create_env
    verify_setup
    print_next_steps
}

# Run main function
main
