@echo off
title LuxuryStay Hospitality - Server Launcher
echo =======================================================
echo   LuxuryStay Hospitality MERN - Starting Services
echo =======================================================
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
echo [2/3] Launching Backend API Server (Port 5001)...
start "LuxuryStay Backend (:5001)" cmd /k "npm run server"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Launching Frontend React App (Port 3000)...
start "LuxuryStay Frontend (:3000)" cmd /k "npm run client"

echo.
echo =======================================================
echo  Servers successfully initiated!
echo  - Backend API:  http://localhost:5001/api/health
echo  - Frontend Web: http://localhost:3000
echo =======================================================

