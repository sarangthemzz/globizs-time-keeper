#!/bin/bash

# Globizs Setup Script
# Run this script to set up the project with all dependencies and database

set -e

echo "🚀 Globizs Setup Starting..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "DATABASE_URL=\"file:./dev.db\"
NEXTAUTH_URL=\"http://localhost:3000\"
NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"
SESSION_MAX_AGE=2592000" > .env.local
    echo "✅ Created .env.local with default values"
else
    echo "✅ .env.local already exists"
fi

# Push schema to database
npm run db:push

# Seed demo data
echo "🌱 Seeding demo data..."
npm run db:seed

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Login with:"
echo "   Email: demo@example.com"
echo "   Password: password123"
echo ""
echo "📚 For more information, see README.md"
