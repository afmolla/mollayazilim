@echo off
chcp 65001 >nul
title Molla Yazilim - Tam Duzelt (IIS + Node + Firewall)
cd /d "%~dp0"

net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo.
echo ========================================
echo   DUZELT — localhost + dis erisim
echo   IIS :80 -^> Node :3000
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\FIX-LOCALHOST.ps1"
if errorlevel 1 (
  echo.
  echo IIS duzeltme basarisiz.
  pause
  exit /b 1
)

echo.
echo Node / PM2 baslatiliyor...
call "%~dp0BASLAT.cmd"

echo.
echo Guvenlik duvari (port 80, 443)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\AC-FIREWALL.ps1"

echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ok=$true; foreach($u in @('http://127.0.0.1:3000/','http://localhost/')) { try { $r=Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 20; Write-Host '[OK]' $u '->' $r.StatusCode -ForegroundColor Green } catch { Write-Host '[HATA]' $u '->' $_.Exception.Message -ForegroundColor Red; $ok=$false } }; if($ok){ try { $ip=(Invoke-WebRequest 'https://api.ipify.org' -UseBasicParsing -TimeoutSec 8).Content.Trim(); Write-Host ''; Write-Host 'Dis test (telefon 4G): http://' $ip '/' -ForegroundColor Cyan } catch {} }; if(-not $ok){ exit 1 }"

if errorlevel 1 (
  echo.
  echo Hala calismiyorsa: pm2 logs mollayazilim --lines 30
  pause
  exit /b 1
)

echo.
echo Tamam. Tarayici: http://localhost/  (https DEGIL, http)
echo Canli: http://mollayazilim.com/
pause
