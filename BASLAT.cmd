@echo off
chcp 65001 >nul
title Molla Yazilim - Node baslat (IIS :80 -> :3000)
cd /d "%~dp0"
where pm2 >nul 2>&1
if errorlevel 1 (
  echo PM2 yok — npm install -g pm2 calistirin.
  pause
  exit /b 1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
pm2 delete mollayazilim >nul 2>&1
pm2 start "%~dp0deploy\ecosystem-iis.config.cjs" --update-env
pm2 save
echo.
echo [OK] http://localhost/ hazir (IIS proxy -> Node 3000)
timeout /t 3 >nul
