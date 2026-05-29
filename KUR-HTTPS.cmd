@echo off
chcp 65001 >nul
title Mollayazilim - HTTPS (Let's Encrypt)
cd /d "%~dp0"
net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~dp0KUR-HTTPS.cmd' -Verb RunAs"
  exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KUR-HTTPS.ps1"
pause
