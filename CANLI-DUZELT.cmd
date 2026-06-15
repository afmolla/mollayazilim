@echo off
chcp 65001 >nul
title Molla Yazilim - Canli Duzelt
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait -ArgumentList '%*'"
  exit /b %ERRORLEVEL%
)

set "NO_PAUSE="
set "EXTRA="
:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="nopause" set "NO_PAUSE=1"
if /I "%~1"=="--no-git" set "EXTRA=-SkipGit"
if /I "%~1"=="--no-build" set "EXTRA=-SkipBuild"
shift
goto parse_args
:args_done

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\CANLI-DUZELT.ps1" %EXTRA%
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo.
  echo Detay: deploy\CANLI-KONTROL.ps1
  if not defined NO_PAUSE pause
  exit /b %ERR%
)

echo.
if not defined NO_PAUSE pause
exit /b 0
