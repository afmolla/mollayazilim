@echo off
chcp 65001 >nul
echo.
echo  Sunucuda http://localhost/ duzeltmesi (Yonetici gerekir)
echo.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0SUNUCU-LOCALHOST-TAM.ps1\"\"' -Wait"
pause
