@echo off
chcp 65001 >nul
title Molla Yazilim - Guncelle
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait -ArgumentList '%*'"
  exit /b %ERRORLEVEL%
)

set "EXTRA="
if /I "%~1"=="--no-git" set "EXTRA=-SkipGit"
if /I "%~1"=="--no-build" set "EXTRA=-SkipBuild"
if /I "%~1"=="--hard" set "EXTRA=-HardReset"

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\site-yeniden-baslat.ps1" %EXTRA%
pause
exit /b %ERRORLEVEL%
