#!/bin/bash

# Deployment Checklist Script for La Hacienda Restaurant QR System
# This script helps verify your deployment configuration

echo "========================================="
echo "La Hacienda Deployment Checklist"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "1. Checking Frontend Configuration..."
echo "======================================="

# Check for .env.production
if [ -f "frontend/.env.production" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.production exists"
    echo "   Contents:"
    cat frontend/.env.production | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} frontend/.env.production missing"
    echo "   Creating from template..."
    cat > frontend/.env.production << EOF
VITE_API_URL=https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
VITE_APP_NAME=La Hacienda
EOF
    echo -e "${GREEN}✓${NC} Created frontend/.env.production"
fi

echo ""
echo "2. Checking Backend Configuration..."
echo "======================================="

# Check for backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"

    # Check critical variables (without showing sensitive values)
    if grep -q "SECRET_KEY=" backend/.env; then
        SECRET_KEY=$(grep "SECRET_KEY=" backend/.env | cut -d'=' -f2)
        if [ ${#SECRET_KEY} -ge 32 ]; then
            echo -e "${GREEN}✓${NC} SECRET_KEY is set and sufficiently long"
        else
            echo -e "${RED}✗${NC} SECRET_KEY is too short (should be 64+ chars)"
            echo "   Generate new one: python3 -c \"import secrets; print(secrets.token_urlsafe(64))\""
        fi
    else
        echo -e "${RED}✗${NC} SECRET_KEY not set"
    fi

    if grep -q "DATABASE_URL=" backend/.env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL is set"
    else
        echo -e "${RED}✗${NC} DATABASE_URL not set"
    fi

    if grep -q "CORS_ORIGINS=" backend/.env; then
        echo -e "${GREEN}✓${NC} CORS_ORIGINS is set"
    else
        echo -e "${YELLOW}⚠${NC} CORS_ORIGINS not set (might cause CORS issues)"
    fi
else
    echo -e "${RED}✗${NC} backend/.env missing"
    echo "   Copy from template: cp backend/.env.example backend/.env"
    echo "   Then edit with your production values"
fi

echo ""
echo "3. Checking Git Status..."
echo "======================================="

if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"

    # Check if there are uncommitted changes to deployment files
    if git diff --quiet frontend/.env.production 2>/dev/null; then
        echo -e "${GREEN}✓${NC} frontend/.env.production committed"
    else
        echo -e "${YELLOW}⚠${NC} frontend/.env.production has uncommitted changes"
        echo "   Run: git add frontend/.env.production && git commit -m 'Update production config'"
    fi
else
    echo -e "${YELLOW}⚠${NC} Not a git repository"
fi

echo ""
echo "4. Digital Ocean Configuration Reminders..."
echo "======================================="

echo -e "${YELLOW}⚠${NC} Manual steps required in Digital Ocean dashboard:"
echo ""
echo "   Frontend Component:"
echo "   - Set VITE_API_URL = https://seahorse-app-zxz5f.ondigitalocean.app/api/v1"
echo "   - After setting, trigger: Force Rebuild and Deploy"
echo ""
echo "   Backend Component:"
echo "   - Set SECRET_KEY (64+ char random string)"
echo "   - Set CORS_ORIGINS = [\"https://seahorse-app-zxz5f.ondigitalocean.app\"]"
echo "   - Set DATABASE_URL (if not auto-configured)"
echo "   - Set DEBUG = False"
echo ""

echo ""
echo "5. Pre-Deployment Checklist..."
echo "======================================="

echo "   [ ] Frontend .env.production created"
echo "   [ ] Backend .env configured with production values"
echo "   [ ] SECRET_KEY is 64+ characters"
echo "   [ ] CORS_ORIGINS includes frontend URL"
echo "   [ ] Database credentials are correct"
echo "   [ ] Code committed to git"
echo "   [ ] Digital Ocean environment variables set"
echo "   [ ] Force rebuild triggered after env var changes"
echo ""

echo "6. Post-Deployment Verification..."
echo "======================================="

echo "   After deployment, test these URLs:"
echo ""
echo "   Frontend: https://seahorse-app-zxz5f.ondigitalocean.app/restaurantqrcode-frontend"
echo "   Backend API: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/docs"
echo "   Health check: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/categories"
echo ""
echo "   Check browser console for:"
echo "   - VITE_API_URL from env: (should show the correct URL)"
echo "   - Using API_URL: (should match above)"
echo "   - No CORS errors"
echo ""

echo ""
echo "========================================="
echo "Deployment Checklist Complete!"
echo "========================================="
echo ""
echo "For detailed troubleshooting, see: DEPLOYMENT_FIXES.md"
echo ""
