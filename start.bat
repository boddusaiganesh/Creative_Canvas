@echo off
echo ============================================
echo Tesco Creative Studio - Starting Services
echo ============================================
echo.

echo Starting Backend...
start "Tesco Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Tesco Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo Services Started!
echo ============================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

taskkill /FI "WindowTitle eq Tesco Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Tesco Frontend*" /F >nul 2>&1

echo Services stopped.
