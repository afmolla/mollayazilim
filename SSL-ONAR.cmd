@echo off
chcp 65001 >nul
title Molla Yazilim - SSL Onar
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait"
  exit /b %ERRORLEVEL%
)

echo ========================================
echo   Ana site SSL onarimi - mollayazilim.com
echo   (CRM ile karistirilmaz - SNI)
echo ========================================
echo.

call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { . '%~dp0deploy\SSL-MOLLA.ps1'; if (Repair-MollayazilimSsl) { exit 0 } else { exit 1 } }"
set ERR=%ERRORLEVEL%

if %ERR% EQU 0 (
  echo.
  echo TAMAM: https://mollayazilim.com/
) else (
  echo.
  echo HATA - SERTIFIKA-YUKLE.cmd
)

if /I not "%~1"=="nopause" pause
exit /b %ERR%
