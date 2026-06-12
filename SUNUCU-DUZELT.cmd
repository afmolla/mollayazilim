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

echo   mollayazilim.com

echo ========================================

echo.



echo [1/5] Git guncelle...

git pull

if errorlevel 1 echo UYARI: git pull basarisiz



echo.

echo [2/5] Bozuk HTTPS yonlendirmesini kaldir...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KALDIR-HTTPS-YONLENDIRME.ps1"



echo.

echo [3/5] Siteyi baslat (PM2 + IIS)...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"

if errorlevel 1 goto fail



echo.

echo [4/5] Dis erisim testi...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\DIS-ERISIM-TEST.ps1"



echo.

echo [5/5] Canli kontrol...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\CANLI-KONTROL.ps1"



echo.

echo ========================================

echo   HTTP OK ise: KUR-HTTPS.cmd

echo   Tarayici: http://mollayazilim.com/

echo   (https:// DEGIL - henuz SSL yok)

echo ========================================

pause

exit /b 0



:fail

echo.

echo HATA — sunucu duzeltilemedi.

echo CANLI-KONTROL.cmd ciktisini gonder.

pause

exit /b 1

