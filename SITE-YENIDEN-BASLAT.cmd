@echo off
chcp 65001 >nul
title Molla Yazilim — Siteyi Yeniden Baslat
cd /d "%~dp0"

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  MOLLA YAZILIM — Git + Build + PM2 Restart   ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Adimlar: git pull  ^>  npm run build  ^>  pm2 restart
echo  Sadece restart icin: SITE-YENIDEN-BASLAT.cmd --no-git
echo.

set "EXTRA="
if /I "%~1"=="--no-git" set "EXTRA=-SkipGit"
if /I "%~1"=="--no-build" set "EXTRA=-SkipBuild"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\site-yeniden-baslat.ps1" %EXTRA%
set ERR=%ERRORLEVEL%

if %ERR%==0 (
  echo.
  echo Basarili.
) else if %ERR%==2 (
  echo.
  echo UYARI: Site ayakta ama bazi URL kontrolleri basarisiz.
  echo Log: pm2 logs mollayazilim --lines 30
) else (
  echo.
  echo HATA. Log: pm2 logs mollayazilim --lines 30
)

echo.
pause
exit /b %ERR%
