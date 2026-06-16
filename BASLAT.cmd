@echo off
chcp 65001 >nul
title Molla Yazilim - Baslat
cd /d "%~dp0"

set "NO_PAUSE="
if /I "%~1"=="nopause" set "NO_PAUSE=1"

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"

echo.
echo === Site baslatiliyor ===
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\BASLAT-SITE.ps1"
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo.
  echo Build yoksa: YENIDEN-BASLAT.cmd
  echo IIS sorunu:  CANLI-DUZELT.cmd
  if not defined NO_PAUSE pause
  exit /b %ERR%
)

if not defined NO_PAUSE pause
exit /b 0
