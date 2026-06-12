@echo off
chcp 65001 >nul
title Molla Yazilim — Sabah baslat
cd /d "%~dp0"

echo.
echo [1/3] PM2 mollayazilim...
where pm2 >nul 2>&1
if errorlevel 1 (
  echo PM2 yok: npm install -g pm2
  pause
  exit /b 1
)
pm2 describe mollayazilim >nul 2>&1
if errorlevel 1 (
  pm2 start deploy\ecosystem-iis.config.cjs
) else (
  pm2 restart mollayazilim --update-env
)
pm2 save >nul 2>&1

echo.
echo [2/3] Port 3000 test...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 15; Write-Host ('Node OK: ' + $r.StatusCode) -ForegroundColor Green } catch { Write-Host ('Node HATA: ' + $_.Exception.Message) -ForegroundColor Red; exit 1 }"
if errorlevel 1 pause & exit /b 1

echo.
echo [3/3] IIS localhost test...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost/' -UseBasicParsing -TimeoutSec 15; Write-Host ('IIS OK: ' + $r.StatusCode) -ForegroundColor Green } catch { Write-Host ('IIS HATA: ' + $_.Exception.Message) -ForegroundColor Red; exit 1 }"

echo.
echo Tamam. Tarayici: https://mollayazilim.com/
echo Panel:     https://mollayazilim.com/panel
echo.
pause
