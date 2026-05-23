@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === mollayazilim — IIS modu ===
echo  Tarayici: http://localhost/   (PORT 3000 YAZMA)
echo.
echo  1) Node arka planda baslatiliyor (127.0.0.1:3000 - sadece IIS icin)
echo  2) IIS http://localhost acacak
echo.
start "" "http://localhost/"
powershell -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
echo.
echo  localhost bos / 404 ise YONETICI PowerShell:
echo    cd %~dp0deploy
echo    .\LOCALHOST-IIS-DUZELT.ps1
echo.
pause
