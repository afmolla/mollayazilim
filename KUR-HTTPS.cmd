@echo off

chcp 65001 >nul

title Molla Yazilim — HTTPS Kurulum

cd /d "%~dp0"



net session >nul 2>&1

if not %errorlevel%==0 (

  echo Yonetici olarak aciliyor...

  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"

  exit /b %ERRORLEVEL%

)



echo ========================================

echo   HTTPS — Let's Encrypt sertifikasi

echo   https://mollayazilim.com/

echo ========================================

echo.



powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KUR-HTTPS.ps1"

set ERR=%ERRORLEVEL%



if %ERR% NEQ 0 (

  echo.

  echo HATA — HTTPS kurulamadi.

  echo Once http://mollayazilim.com/ calissin, sonra tekrar deneyin.

  pause

  exit /b %ERR%

)



echo.

echo Tamam. Tarayici: https://mollayazilim.com/

pause

exit /b 0

