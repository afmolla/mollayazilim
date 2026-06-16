@echo off
chcp 65001 >nul
title Molla Yazilim - Sertifika Yukle
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo ========================================
echo   SERTIFIKA AL + IIS YUKLE
echo   Let's Encrypt - mollayazilim.com
echo ========================================
echo.

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\SERTIFIKA-YUKLE.ps1"
set ERR=%ERRORLEVEL%

if %ERR% EQU 0 (
  echo.
  echo TAMAM: https://mollayazilim.com/
) else (
  echo.
  echo HATA - deploy\CANLI-KONTROL.ps1
)

pause
exit /b %ERR%
