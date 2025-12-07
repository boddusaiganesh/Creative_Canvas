@echo off
echo ============================================
echo Tesco Creative Studio - Setup Script
echo ============================================
echo.

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)
echo Python found!
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found!
echo.

REM Setup Backend
echo ============================================
echo Setting up Backend...
echo ============================================
cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Creating directories...
if not exist "uploads" mkdir uploads
if not exist "exports" mkdir exports

echo Creating .env file...
if not exist ".env" (
    copy .env.example .env
    echo Please edit backend/.env and add your OPENAI_API_KEY
)

cd ..
echo Backend setup complete!
echo.

REM Setup Frontend
echo ============================================
echo Setting up Frontend...
echo ============================================
cd frontend

echo Installing Node dependencies...
call npm install

cd ..
echo Frontend setup complete!
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Edit backend/.env and add your OPENAI_API_KEY
echo 2. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& python main.py
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
pause
