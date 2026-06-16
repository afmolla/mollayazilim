@echo off
chcp 65001 >nul
title Molla Yazilim - Sadece HTTPS (SSL)
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo ========================================
echo   HTTPS TAMIR - Let's Encrypt
echo   HTTP calisiyor, HTTPS calismiyorsa
echo ========================================
echo.
echo Sunucuda tarayici: http://localhost/ kullan
echo Domain HTTPS duzelince: https://mollayazilim.com/
echo.

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\VPS-HTTPS-TAMIR.ps1"
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo.
  echo HATA - log icin: deploy\CANLI-KONTROL.ps1
)

echo.
pause
exit /b %ERR%
