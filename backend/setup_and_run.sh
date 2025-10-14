#!/bin/bash

echo "🎉 La Hacienda Backend Setup Script"
echo "===================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "Creating Python virtual environment..."
    cd ..
    python3 -m venv venv
    cd backend
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

echo ""
echo "Activating virtual environment..."
source ../venv/bin/activate

echo ""
echo "Installing/updating Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure Docker is running"
echo "2. Start the database: docker-compose up -d postgres"
echo "3. Wait 5 seconds for DB to be ready"
echo "4. Create admin user: python scripts/create_admin.py"
echo "5. Start the server: python app/main.py"
