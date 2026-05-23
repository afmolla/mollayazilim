@echo off
chcp 65001 >nul
title Molla Yazilim - Kurulum
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak yeniden aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo.
echo  Mollayazilim — PORT 80 ( :3000 yok )
echo  git gerekmez
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\tek-tikla.ps1"
echo.
pause
