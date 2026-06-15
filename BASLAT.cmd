@echo off
chcp 65001 >nul
title Molla Yazilim - Baslat
cd /d "%~dp0"

set "NO_PAUSE="
set "EXTRA="
:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="nopause" set "NO_PAUSE=1"
if /I "%~1"=="--no-git" set "EXTRA=--no-git"
if /I "%~1"=="--no-build" set "EXTRA=--no-build"
shift
goto parse_args
:args_done

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait -ArgumentList '%*'"
  exit /b %ERRORLEVEL%
)

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
call "%~dp0CANLI-DUZELT.cmd" %EXTRA% nopause
set ERR=%ERRORLEVEL%

if %ERR% NEQ 0 (
  echo.
  echo HATA. CANLI-DUZELT.cmd veya YENIDEN-BASLAT.cmd deneyin
  if not defined NO_PAUSE pause
  exit /b %ERR%
)

if not defined NO_PAUSE pause
exit /b 0
