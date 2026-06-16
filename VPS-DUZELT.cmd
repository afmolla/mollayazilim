@echo off
chcp 65001 >nul
title Molla Yazilim - VPS Tamir
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo ========================================
echo   VPS TAMIR - mollayazilim.com
echo   HTTPS reset + IIS + build + SSL
echo ========================================
echo.

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\CANLI-DUZELT.ps1"
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo.
  echo Ek teshis: deploy\CANLI-KONTROL.ps1
)

pause
exit /b %ERR%
