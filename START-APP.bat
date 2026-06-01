@echo off
title ULAVI - Starting Application
cd /d "%~dp0"

:: Quick sanity checks
if not exist "node_modules" (
  echo node_modules missing. Running SETUP-ONCE.bat first...
  call SETUP-ONCE.bat
)

if not exist "backend\venv\Scripts\python.exe" (
  echo Backend venv missing. Running SETUP-ONCE.bat first...
  call SETUP-ONCE.bat
)

findstr /C:"REPLACE_WITH" backend\.env >nul 2>&1
if not errorlevel 1 (
  echo.
  echo WARNING: Gmail SMTP is not configured yet!
  echo Edit backend\.env with your Gmail App Password for live email.
  echo Emails will be QUEUED (saved locally) until you configure SMTP.
  echo.
  timeout /t 4 >nul
)

echo Starting ULAVI Backend (port 8000)...
start "ULAVI Backend" cmd /k "cd /d "%~dp0backend" && call start-backend.bat"

timeout /t 3 >nul

echo Starting ULAVI Frontend...
start "ULAVI Frontend" cmd /k "cd /d "%~dp0" && call start-frontend.bat"

echo.
echo ============================================
echo   ULAVI is starting!
echo ============================================
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:5173  (check terminal window)
echo.
echo   Two terminal windows opened - keep them running.
echo   Open the frontend URL in your browser.
echo ============================================
echo.
timeout /t 5
