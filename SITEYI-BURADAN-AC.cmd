@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Tarayicida su adresi ac:  http://localhost:3000
echo.
echo  Sunucu baslatiliyor... (durdurmak: Ctrl+C)
echo.
npm run dev
pause
