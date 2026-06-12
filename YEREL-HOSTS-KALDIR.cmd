@echo off

chcp 65001 >nul

title Molla Yazilim — Yerel hosts kaldir

cd /d "%~dp0"



net session >nul 2>&1

if not %errorlevel%==0 (

  echo Yonetici olarak aciliyor...

  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"

  exit /b %ERRORLEVEL%

)



echo.

echo Yerel hosts satirlari kaldiriliyor...

echo (mollayazilim.com gercek sunucuya gidecek: 85.95.251.204)

echo.



powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KALDIR-YEREL-HOSTS.ps1"

pause

