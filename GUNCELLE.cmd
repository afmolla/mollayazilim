@echo off
chcp 65001 >nul
title Molla Yazilim - Guncelle
cd /d "%~dp0"

echo.
echo ========================================
echo   Molla Yazilim - GUNCELLE
echo   Git pull + build + PM2 yeniden baslat
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\git-pull.ps1"
if errorlevel 1 (
  echo.
  echo git pull olmadi — GitHub ZIP ile cekiliyor...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\GITHUB-ZIP-GUNCELLE.ps1"
  if errorlevel 1 (
    echo.
    echo GUNCELLEME BASARISIZ.
    pause
    exit /b 1
  )
  goto :baslat
)

echo.
echo npm run build...
set NODE_ENV=production
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD BASARISIZ.
  pause
  exit /b 1
)

:baslat
echo.
echo IIS + PM2 duzeltme (Yonetici gerekir)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~dp0DUZELT.cmd' -Verb RunAs -Wait"
echo.
echo GUNCELLEME TAMAM.
echo Tarayici: http://localhost/  (http — https degil)
pause
