@echo off
chcp 65001 >nul
title Molla Yazilim — Canli Sunucu Duzelt
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo ========================================
echo   CANLI SUNUCU DUZELT
echo   mollayazilim.com (85.95.251.204)
echo ========================================
echo.

echo [1/4] Git guncelle...
git pull
if errorlevel 1 (
  echo UYARI: git pull basarisiz, devam ediliyor...
)

echo.
echo [2/4] Bozuk HTTPS yonlendirmesini kaldir...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KALDIR-HTTPS-YONLENDIRME.ps1"

echo.
echo [3/4] Siteyi baslat...
call "%~dp0BASLAT.cmd"
if errorlevel 1 goto fail

echo.
echo [4/4] Dis erisim testi...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\DIS-ERISIM-TEST.ps1"

echo.
echo ========================================
echo   HTTP calisiyorsa: KUR-HTTPS.cmd
echo ========================================
pause
exit /b 0

:fail
echo.
echo HATA — sunucu duzeltilemedi.
pause
exit /b 1
