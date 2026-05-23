@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  1) git pull dene
echo  2) olmazsa GitHub ZIP
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-pull.ps1"
if errorlevel 1 (
  echo.
  echo git pull olmadi — ZIP ile cekiliyor...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0GITHUB-ZIP-GUNCELLE.ps1"
)
echo.
pause
