#!/bin/bash

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 La Hacienda Admin Dashboard - Complete Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /Users/josegalan/Documents/restaurantQRcode"
    exit 1
fi

echo "📍 Running from: $(pwd)"
echo ""

# Step 1: Virtual Environment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Setting up Python virtual environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo "✅ Virtual environment activated"
echo "   Python: $(which python)"
echo ""

# Step 2: Install Dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Installing Python dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Upgrading pip..."
pip install --upgrade pip -q

echo ""
echo "Installing backend dependencies (this may take a minute)..."
cd backend
pip install -r requirements.txt -q

echo "✅ All dependencies installed successfully"
echo ""

# Verify key packages
echo "Verifying key packages:"
python -c "import fastapi; print('  ✓ FastAPI:', fastapi.__version__)"
python -c "import pydantic; print('  ✓ Pydantic:', pydantic.__version__)"
python -c "import pydantic_settings; print('  ✓ Pydantic Settings: OK')"
python -c "import sqlalchemy; print('  ✓ SQLAlchemy:', sqlalchemy.__version__)"
python -c "import jose; print('  ✓ Python-JOSE: OK')"
python -c "import passlib; print('  ✓ Passlib: OK')"
echo ""

cd ..

# Step 3: Start Database
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Starting PostgreSQL database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

echo "Starting database container..."
docker-compose up -d postgres

echo ""
echo "Waiting for database to be ready (10 seconds)..."
sleep 10

# Verify database is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Database is running"
else
    echo "⚠️  Warning: Database may not be running properly"
    echo "   Check with: docker-compose logs db"
fi
echo ""

# Step 4: Create Admin User
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Creating initial admin user"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend
python scripts/create_admin.py

echo ""
cd ..

# Step 5: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your backend is ready to run!"
echo ""
echo "📝 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  Change this after first login!"
echo ""
echo "🚀 To start the backend server:"
echo "   cd backend"
echo "   python app/main.py"
echo ""
echo "🌐 Once started, visit:"
echo "   • Health Check: http://localhost:8000/health"
echo "   • API Docs:     http://localhost:8000/docs"
echo "   • ReDoc:        http://localhost:8000/redoc"
echo ""
echo "📚 Documentation:"
echo "   • FINAL_SETUP_GUIDE.md         - Complete setup instructions"
echo "   • ADMIN_README.md              - Quick reference"
echo "   • ADMIN_DASHBOARD_IMPLEMENTATION.md - Frontend guide"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to start the server now
read -p "Would you like to start the backend server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting backend server..."
    echo "Press Ctrl+C to stop"
    echo ""
    cd backend
    python app/main.py
fi
