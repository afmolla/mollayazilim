@echo off
chcp 65001 >nul
title Molla Yazilim - Baslat
cd /d "%~dp0"

set "NO_PAUSE="
if /I "%~1"=="nopause" set "NO_PAUSE=1"

net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait -ArgumentList '%*'"
  exit /b %ERRORLEVEL%
)

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\BASLAT-SITE.ps1"
set ERR=%ERRORLEVEL%

if not defined NO_PAUSE pause
exit /b %ERR%
