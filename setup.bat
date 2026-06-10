@echo off
REM Globizs Setup Script for Windows
REM Run this script to set up the project with all dependencies and database

echo.
echo 🚀 Globizs Setup Starting...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

echo.
echo 🗄️  Setting up database...

REM Create .env.local if it doesn't exist
if not exist .env.local (
    (
        echo DATABASE_URL="file:./dev.db"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="your-secret-key-change-in-production"
        echo SESSION_MAX_AGE=2592000
    ) > .env.local
    echo ✅ Created .env.local with default values
) else (
    echo ✅ .env.local already exists
)

REM Push schema to database
call npm run db:push

REM Seed demo data
echo 🌱 Seeding demo data...
call npm run db:seed

echo.
echo ✅ Setup Complete!
echo.
echo 🎯 Next Steps:
echo 1. Start the development server: npm run dev
echo 2. Open http://localhost:3000
echo 3. Login with:
echo    Email: demo@example.com
echo    Password: password123
echo.
echo 📚 For more information, see README.md
echo.
pause
