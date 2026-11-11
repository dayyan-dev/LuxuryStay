@echo off
title LuxuryStay Hospitality - Server Launcher
echo =====================================================================
echo           LuxuryStay Hospitality MERN Management System
echo =====================================================================
echo.
echo [1/3] Ensuring MongoDB Database is running...
tasklist /fi "imagename eq mongod.exe" 2>NUL | find /i /n "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       MongoDB is already running!
) else (
    echo       Starting MongoDB daemon on port 27017...
    start "MongoDB Database Service" /min "C:\mongodb4\mongodb-win32-x86_64-windows-4.4.29\bin\mongod.exe" --dbpath "C:\mongodb4\data" --port 27017
    timeout /t 3 /nobreak >nul
)

echo.
echo [2/3] Starting Backend Server (Port 5001)...
start "LuxuryStay Backend (Port 5001)" cmd /k "cd /d %~dp0backend && npm start"

echo.
echo [3/3] Starting Frontend Website (Port 3000)...
start "LuxuryStay Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo =====================================================================
echo   All 3 services (Database, Backend, Frontend) are now running!
echo.
echo   * Website URL:     http://localhost:3000
echo   * Restaurant URL:  http://localhost:3000/restaurant
echo   * Admin Dashboard: http://localhost:3000/login
echo.
echo   Admin Credentials:
echo   - Email:    admin@hotel.com
echo   - Password: admin123
echo =====================================================================
timeout /t 5 >nul

