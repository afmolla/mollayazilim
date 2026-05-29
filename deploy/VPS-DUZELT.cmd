@echo off
chcp 65001 >nul
title Mollayazilim VPS - Tam Duzelt
cd /d "%~dp0.."

echo.
echo ========================================
echo   VPS DUZELT — git pull + IIS + Node :3000
echo   (Yonetici olarak acilir)
echo ========================================
echo.

net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-pull.ps1"
if errorlevel 1 (
  echo git pull basarisiz — mevcut kodla devam...
)

if not exist ".next\BUILD_ID" (
  echo npm run build...
  set NODE_ENV=production
  call npm run build
  if errorlevel 1 (
    echo BUILD BASARISIZ.
    pause
    exit /b 1
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SUNUCU-LOCALHOST-TAM.ps1"
if errorlevel 1 (
  echo.
  echo HATA devam ediyor. Log: pm2 logs mollayazilim --lines 30
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0AC-FIREWALL.ps1"

echo.
echo Tamam — http://localhost/  ve  http://mollayazilim.com
pause
