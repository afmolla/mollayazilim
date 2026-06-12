@echo off

chcp 65001 >nul

title Molla Yazilim — HTTPS IIS Bagla

cd /d "%~dp0"



net session >nul 2>&1

if not %errorlevel%==0 (

  echo Yonetici olarak aciliyor...

  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"

  exit /b %ERRORLEVEL%

)



echo ========================================

echo   Mevcut SSL sertifikasini IIS'e bagla

echo ========================================

echo.



powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\HTTPS-BAGLA.ps1"

pause

exit /b %ERRORLEVEL%

