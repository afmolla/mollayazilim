@echo off
chcp 65001 >nul
title Molla Yazilim — Ilk Kurulum
cd /d "%~dp0"

echo ========================================
echo   MOLLA YAZILIM ILK KURULUM
echo ========================================
echo.

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js yok — winget ile kuruluyor...
  winget install OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
)

where pm2 >nul 2>&1
if errorlevel 1 (
  echo PM2 kuruluyor...
  call npm install -g pm2
)

echo [1/5] IIS + site kurulumu...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\Install-Mollayazilim-NextIIS.ps1"
if errorlevel 1 goto fail

echo.
echo [2/5] npm install...
if not exist node_modules call npm ci
if errorlevel 1 call npm install
if errorlevel 1 goto fail

echo.
echo [3/5] Production build...
set NODE_ENV=production
call npm run build
if errorlevel 1 goto fail

echo.
echo [4/5] IIS + firewall...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\FIX-LOCALHOST.ps1"
if errorlevel 1 goto fail
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\AC-FIREWALL.ps1"
if errorlevel 1 goto fail

echo.
echo [5/5] HTTPS sertifikasi...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KUR-HTTPS.ps1"
set HTTPS_ERR=%ERRORLEVEL%
if %HTTPS_ERR%==2 (
  echo DNS bu makineye gitmiyor — yerel mkcert deneniyor...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\yerel-mkcert-https.ps1"
  if errorlevel 1 (
    echo UYARI: HTTPS kurulamadi — site HTTP ile calisir. Canli sunucuda KUR.cmd tekrar calistirin.
  )
) else if %HTTPS_ERR% NEQ 0 (
  echo UYARI: HTTPS kurulamadi — site HTTP ile calisir.
)

echo.
echo ========================================
echo   Kurulum tamam — site baslatiliyor
echo ========================================
call "%~dp0BASLAT.cmd"
if errorlevel 1 goto fail

echo.
echo Sonraki guncellemeler: YENIDEN-BASLAT.cmd ^(canli sunucuda^)
exit /b 0

:fail
echo.
echo HATA — kurulum tamamlanamadi.
pause
exit /b 1
