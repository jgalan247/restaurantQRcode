#!/bin/bash

echo "🎉 La Hacienda Admin Dashboard - Quick Start Script"
echo "===================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Starting PostgreSQL database..."
docker-compose up -d postgres
echo "✅ Database container started"
echo ""

echo "Waiting 5 seconds for database to be ready..."
sleep 5
echo ""

echo "Step 2: Creating initial admin user..."
cd backend
python3 scripts/create_admin.py
echo ""

echo "Step 3: Starting backend server..."
echo "Backend will start at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
python3 app/main.py
