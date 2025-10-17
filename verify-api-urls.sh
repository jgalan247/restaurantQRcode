#!/bin/bash

# Verification script for API URL configuration
# Checks that no hardcoded localhost URLs exist in service files

echo "========================================="
echo "API URL Configuration Verification"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo "1. Checking for hardcoded localhost URLs in service files..."
echo "============================================================="

# Check each service file
FILES=(
  "frontend/src/services/api.ts"
  "frontend/src/services/adminApi.ts"
  "frontend/src/services/promotionsApi.ts"
  "frontend/src/services/budgetBuilderService.ts"
  "frontend/src/services/invoiceService.ts"
)

HARDCODED_FOUND=0

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Check for hardcoded localhost (but exclude comments)
    MATCHES=$(grep -n "localhost:8000" "$FILE" | grep -v "^[[:space:]]*\/\/" | grep -v "^[[:space:]]*\*")

    if [ -n "$MATCHES" ]; then
      echo -e "${RED}✗${NC} $FILE contains hardcoded localhost:"
      echo "$MATCHES" | sed 's/^/   /'
      HARDCODED_FOUND=1
    else
      echo -e "${GREEN}✓${NC} $FILE - No hardcoded URLs"
    fi
  else
    echo -e "${YELLOW}⚠${NC} $FILE - File not found"
  fi
done

echo ""
echo "2. Checking for centralized config import..."
echo "============================================================="

IMPORT_PATTERN="from ['\"].*config/api.config['\"]"

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ] && [ "$FILE" != "frontend/src/services/api.ts" ]; then
    # Check if file imports from api.config
    if grep -q "$IMPORT_PATTERN" "$FILE"; then
      echo -e "${GREEN}✓${NC} $FILE imports centralized config"
    else
      echo -e "${YELLOW}⚠${NC} $FILE does not import api.config (check if needed)"
    fi
  fi
done

echo ""
echo "3. Checking environment files..."
echo "============================================================="

if [ -f "frontend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.production exists"
  echo "   Contents:"
  cat frontend/.env.production | sed 's/^/   /'
else
  echo -e "${RED}✗${NC} frontend/.env.production missing"
  echo "   This file should contain: VITE_API_URL=https://your-domain.com/api/v1"
fi

echo ""
if [ -f "frontend/.env.example" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.example exists"
else
  echo -e "${YELLOW}⚠${NC} frontend/.env.example not found"
fi

echo ""
echo "4. Checking centralized config file..."
echo "============================================================="

if [ -f "frontend/src/config/api.config.ts" ]; then
  echo -e "${GREEN}✓${NC} frontend/src/config/api.config.ts exists"

  # Check if it exports getApiUrl and API_URL
  if grep -q "export.*getApiUrl" "frontend/src/config/api.config.ts" && \
     grep -q "export.*API_URL" "frontend/src/config/api.config.ts"; then
    echo -e "${GREEN}✓${NC} Exports getApiUrl() and API_URL"
  else
    echo -e "${RED}✗${NC} Missing required exports"
  fi
else
  echo -e "${RED}✗${NC} frontend/src/config/api.config.ts missing (CRITICAL!)"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="

if [ $HARDCODED_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ All service files are using centralized configuration${NC}"
  echo -e "${GREEN}✓ No hardcoded localhost URLs found in service files${NC}"
  echo ""
  echo "Your API URL configuration is correctly centralized!"
  echo ""
  echo "Next steps:"
  echo "1. Commit changes: git add frontend/src && git commit -m 'Centralize API URL config'"
  echo "2. Push to repository: git push"
  echo "3. Deploy to Digital Ocean (will trigger automatically)"
  echo "4. Verify in production: Check browser console for 'Using API_URL:' log"
else
  echo -e "${RED}✗ Found hardcoded localhost URLs in service files${NC}"
  echo ""
  echo "Please update the files listed above to use the centralized config:"
  echo "  import { API_URL } from '../config/api.config';"
  echo "  const API_BASE = API_URL;"
fi

echo ""
echo "For detailed information, see: API_URL_FIX_SUMMARY.md"
echo ""
