@echo off

chcp 65001 >nul

title Molla Yazilim — Sunucu Guncelle & Baslat

cd /d "%~dp0"



net session >nul 2>&1

if not %errorlevel%==0 (

  echo Yonetici olarak aciliyor...

  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"

  exit /b %ERRORLEVEL%

)



echo.

echo  ╔══════════════════════════════════════════════╗

echo  ║  MOLLA YAZILIM — Sunucu Guncelle & Baslat    ║

echo  ╚══════════════════════════════════════════════╝

echo.



echo [1/3] Git guncelle...

git pull

if errorlevel 1 echo UYARI: git pull basarisiz



echo.

echo [2/3] Site baslat (build + PM2 + IIS)...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"

if errorlevel 1 goto fail



echo.

echo [3/3] Kontrol...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\CANLI-KONTROL.ps1"



echo.

echo Tamam — https://mollayazilim.com/

echo CRM: https://crm.mollayazilim.com/login

echo.

pause

exit /b 0



:fail

echo.

echo HATA — SUNUCU-DUZELT.cmd deneyin.

pause

exit /b 1

