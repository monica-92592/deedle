#!/bin/bash

echo "🚀 Deedle Application Test Script"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL detected"
else
    echo "⚠️  PostgreSQL not found. You'll need to install PostgreSQL or use Docker."
    echo "   Docker command: docker run --name deedle-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=deedle -p 5432:5432 -d postgres:15"
fi

# Create environment file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment file..."
    cp server/env.example server/.env
    echo "✅ Environment file created. Please edit server/.env with your database credentials."
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Set up your database (PostgreSQL)"
echo "2. Edit server/.env with your database credentials"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:5173"
echo ""
echo "📊 Test with sample data:"
echo "   - Use the sample-data.csv file in the root directory"
echo "   - Upload it through the web interface"
echo ""
echo "🔗 For GitHub Pages deployment:"
echo "   - Push to GitHub repository"
echo "   - Enable GitHub Pages in repository settings"
echo "   - Deploy backend to Railway/Render/Heroku"
echo "   - Update API_URL in client/src/config/api.ts"
