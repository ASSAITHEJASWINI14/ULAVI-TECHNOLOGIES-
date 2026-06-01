@echo off
title ULAVI - One-Time Setup
cd /d "%~dp0"
echo.
echo ============================================
echo   ULAVI - ONE-TIME SETUP
echo ============================================
echo.

:: ---- Frontend dependencies ----
echo [1/4] Installing frontend packages...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed. Install Node.js from https://nodejs.org
  pause
  exit /b 1
)

:: ---- Backend venv + dependencies ----
echo.
echo [2/4] Installing backend packages...
cd backend
if not exist "venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv venv
  if errorlevel 1 (
    echo ERROR: Could not create venv. Install Python 3.11+ from https://python.org
    cd ..
    pause
    exit /b 1
  )
)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo ERROR: pip install failed.
  cd ..
  pause
  exit /b 1
)
cd ..

:: ---- Backend .env ----
echo.
echo [3/4] Checking Gmail SMTP config...
if not exist "backend\.env" (
  copy backend\.env.example backend\.env >nul
  echo Created backend\.env from template.
)
findstr /C:"REPLACE_WITH" backend\.env >nul 2>&1
if not errorlevel 1 (
  echo.
  echo *** ACTION REQUIRED ***
  echo Open backend\.env and set:
  echo   SMTP_USER=your-gmail@gmail.com
  echo   SMTP_PASSWORD=your-16-char-app-password
  echo.
  echo Get App Password: https://myaccount.google.com/apppasswords
  echo.
  start notepad backend\.env
  echo Notepad opened - save the file after editing, then press any key...
  pause >nul
)

:: ---- Supabase schema check ----
echo.
echo [4/4] Checking Supabase database...
node scripts\check-supabase.mjs
echo.

echo ============================================
echo   SETUP COMPLETE
echo ============================================
echo.
echo Next: Double-click START-APP.bat to run the app
echo.
pause
