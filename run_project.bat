@echo off
title El Bro Syndicate - Startup Manager
echo ==============================================
echo EL BRO SYNDICATE - AUTOMATIC STARTUP MANAGER
echo ==============================================
echo.

:: Check if MongoDB port 27017 is already active
netstat -ano | findstr :27017 >nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB is already running on port 27017.
) else (
    echo [INFO] MongoDB is not running. Starting manual instance...
    if not exist "%~dp0scratch\mongodb-data" (
        mkdir "%~dp0scratch\mongodb-data"
    )
    start "MongoDB Server" cmd /c mongod --dbpath "%~dp0scratch\mongodb-data"
    echo [INFO] Waiting for MongoDB to initialize...
    timeout /t 5 >nul
)

:: Start Backend Server
echo [INFO] Starting Backend Server...
start "Backend Server" cmd /c "cd /d %~dp0backend && npm run dev"

:: Start Cloudflare Tunnel
echo [INFO] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /c "%~dp0cloudflared.exe tunnel --url http://localhost:5005"

:: Start Frontend Server
echo [INFO] Starting Frontend Dev Server...
start "Frontend Server" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ==============================================
echo [SUCCESS] Servers are running!
echo Frontend will open on: http://localhost:5173/
echo ==============================================
pause
