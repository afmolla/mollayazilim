@echo off
chcp 65001 >nul
title Molla Yazilim — Yeniden Baslat / Guncelle
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs -Wait -ArgumentList '%*'"
  exit /b %ERRORLEVEL%
)

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  YENIDEN BASLAT — Git + Build + PM2          ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  NOT: git push tek basina sunucuyu guncellemez.
echo  Canli sunucuda (85.95.251.204) bu dosyayi calistirin.
echo.
echo  Adimlar: git pull  ^>  npm ci  ^>  build  ^>  pm2 restart
echo  Sadece restart: YENIDEN-BASLAT.cmd --no-git --no-build
echo.

set "EXTRA="
if /I "%~1"=="--no-git" set "EXTRA=-SkipGit"
if /I "%~1"=="--no-build" set "EXTRA=-SkipBuild"
if /I "%~1"=="--hard" set "EXTRA=-HardReset"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\site-yeniden-baslat.ps1" %EXTRA%
set ERR=%ERRORLEVEL%

if %ERR%==0 (
  echo.
  echo Basarili — https://mollayazilim.com/
) else if %ERR%==2 (
  echo.
  echo UYARI: Site ayakta ama bazi URL kontrolleri basarisiz.
  echo Log: pm2 logs mollayazilim --lines 30
) else (
  echo.
  echo HATA. git pull basarisizsa: YENIDEN-BASLAT.cmd --hard
  echo Log: pm2 logs mollayazilim --lines 30
)

echo.
pause
exit /b %ERR%
