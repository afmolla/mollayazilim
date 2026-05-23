@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  mollayazilim — IIS ile http://localhost (port 80)
echo  Node arka planda 3000; tarayicida :3000 kullanma.
echo.
start "" "http://localhost/"
powershell -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
pause
