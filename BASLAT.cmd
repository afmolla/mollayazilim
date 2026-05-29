@echo off
chcp 65001 >nul
title Molla Yazilim - Node baslat (IIS :80 -> :3000)
cd /d "%~dp0"

set "PM2=pm2.cmd"
where pm2.cmd >nul 2>&1 || set "PM2=pm2"
where %PM2% >nul 2>&1 || (
  echo PM2 yok — npm install -g pm2 calistirin.
  pause
  exit /b 1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

call %PM2% jlist 2>nul | findstr /I /C:"mollayazilim" >nul 2>&1
if not errorlevel 1 (
  call %PM2% restart mollayazilim --update-env
) else (
  call %PM2% start "%~dp0deploy\ecosystem-iis.config.cjs" --update-env
)
call %PM2% save >nul 2>&1

echo.
echo [OK] http://localhost/ hazir (IIS proxy -^> Node 3000)
timeout /t 3 >nul
