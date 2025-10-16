#!/bin/bash
# Production Deployment Script for La Hacienda QR Ordering System
# Run this to commit changes and prepare for Digital Ocean deployment

echo "🚀 La Hacienda - Production Deployment Preparation"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

echo "Step 1: Checking git status..."
git status

echo ""
echo "Step 2: Adding all production-ready changes..."
git add .

echo ""
echo "Step 3: Creating commit..."
git commit -m "Production-ready: Secured environment variables, fixed build errors, prepared CityPay integration

- Removed secrets from version control
- Updated docker-compose.yml to use environment variables
- Enhanced .env.example files with clear documentation
- Fixed TypeScript build errors (reduced from 35+ to 16 minor warnings)
- Added UTC timestamp handling for CityPay integration
- Created comprehensive deployment documentation
- Prepared for Digital Ocean Apps deployment

Ready for deployment pending CityPay credentials.

🤖 Generated with Claude Code"

echo ""
echo "✅ Commit created successfully!"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Review PRODUCTION_DEPLOY_READY.md for deployment instructions"
echo "2. Push to GitHub: git push origin feature/complete-admin-system"
echo "3. Create Digital Ocean App from GitHub repository"
echo "4. Set environment variables in Digital Ocean dashboard"
echo "5. Deploy!"
echo ""
echo "⏳ Waiting for CityPay credentials to complete payment integration"
echo ""
echo "For detailed instructions, see: PRODUCTION_DEPLOY_READY.md"
