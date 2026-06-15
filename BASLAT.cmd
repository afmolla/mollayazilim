@echo off
chcp 65001 >nul
title Molla Yazilim — Baslat
cd /d "%~dp0"

set "NO_PAUSE="
if /I "%~1"=="nopause" set "NO_PAUSE=1"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo === Molla Yazilim — Siteyi Ac ===
echo http://mollayazilim.com/   ^(port yok^)
echo http://localhost/
echo NOT: :3000 kullanma — sadece IIS :80
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
set ERR=%ERRORLEVEL%

if %ERR%==2 (
  echo.
  echo IIS hatasi — once KUR.cmd calistirin ^(Yonetici^).
  if not defined NO_PAUSE pause
  exit /b 2
)
if %ERR% NEQ 0 (
  echo.
  echo HATA. Log: pm2 logs mollayazilim --lines 20
  if not defined NO_PAUSE pause
  exit /b 1
)

if not defined NO_PAUSE pause
exit /b 0
