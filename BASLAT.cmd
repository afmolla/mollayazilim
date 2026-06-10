@echo off
chcp 65001 >nul
title Molla Yazilim — Baslat
cd /d "%~dp0"

echo === Molla Yazilim — Siteyi Ac ===
echo http://localhost/
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
set ERR=%ERRORLEVEL%

if %ERR%==2 (
  echo.
  echo IIS hatasi — once KUR.cmd calistirin ^(Yonetici^).
  pause
  exit /b 2
)
if %ERR% NEQ 0 (
  echo.
  echo HATA. Log: pm2 logs mollayazilim --lines 20
  pause
  exit /b 1
)

pause
exit /b 0
