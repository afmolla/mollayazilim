@echo off
chcp 65001 >nul
echo 403.14 wwwroot hatasi - mollayazilim sitesine yonlendir
cd /d "%~dp0deploy"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0deploy\FIX-LOCALHOST-403.ps1\"\"' -Wait"
pause
