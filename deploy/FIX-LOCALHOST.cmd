@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo FIX-LOCALHOST (Yonetici gerekir)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0FIX-LOCALHOST.ps1\"\"' -Wait"
echo.
pause
