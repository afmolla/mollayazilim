@echo off
chcp 65001 >nul
title Port 80 - 3000 kapat
cd /d "%~dp0"
net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~dp0PORT-80.cmd' -Verb RunAs"
  exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\PORT-80-ZORLA.ps1"
pause
