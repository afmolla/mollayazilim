@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Site: http://localhost/  (IIS — port 80)
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
