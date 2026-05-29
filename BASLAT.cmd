@echo off
chcp 65001 >nul
title Molla Yazilim — BASLAT
cd /d "%~dp0"

REM ============================================================
REM  TEK KOMUT
REM  Cift tik / BASLAT.cmd        -> siteyi ac
REM  BASLAT.cmd duzelt            -> IIS + Node + firewall
REM  BASLAT.cmd guncelle          -> git + build + duzelt
REM  BASLAT.cmd kur               -> ilk kurulum
REM  BASLAT.cmd test              -> dis erisim testi
REM  BASLAT.cmd menu              -> secim menusu
REM ============================================================

set "MODE=ac"
if not "%~1"=="" set "MODE=%~1"
if /i "%MODE%"=="1" set "MODE=ac"
if /i "%MODE%"=="2" set "MODE=duzelt"
if /i "%MODE%"=="3" set "MODE=guncelle"
if /i "%MODE%"=="4" set "MODE=kur"
if /i "%MODE%"=="5" set "MODE=test"
if /i "%MODE%"=="site" set "MODE=ac"

if /i "%MODE%"=="menu" goto :menu
if /i "%MODE%"=="ac" goto :ac
if /i "%MODE%"=="duzelt" goto :duzelt
if /i "%MODE%"=="guncelle" goto :guncelle
if /i "%MODE%"=="kur" goto :kur
if /i "%MODE%"=="test" goto :test
echo Bilinmeyen mod: %MODE%
goto :menu

:menu
echo.
echo  ========================================
echo    Molla Yazilim — BASLAT
echo    http://localhost/
echo  ========================================
echo    [1] Siteyi ac
echo    [2] Duzelt         (Yonetici)
echo    [3] Guncelle       (git + build)
echo    [4] Ilk kurulum    (Yonetici)
echo    [5] Dis erisim testi
echo.
set /p SEC="  Secim [1]: "
if "%SEC%"=="" set "SEC=1"
if "%SEC%"=="1" goto :ac
if "%SEC%"=="2" goto :duzelt
if "%SEC%"=="3" goto :guncelle
if "%SEC%"=="4" goto :kur
if "%SEC%"=="5" goto :test
echo Gecersiz.
pause
exit /b 1

:ac
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
goto :son

:duzelt
call :admin
echo.
echo === DUZELT — IIS + Node + Firewall ===
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\FIX-LOCALHOST.ps1"
if errorlevel 1 goto :hata
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
if errorlevel 1 goto :hata
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\AC-FIREWALL.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try{$a=Invoke-WebRequest 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 20;$b=Invoke-WebRequest 'http://localhost/' -UseBasicParsing -TimeoutSec 20;Write-Host '(OK) Node' $a.StatusCode 'IIS' $b.StatusCode -ForegroundColor Green;try{$ip=(Invoke-WebRequest 'https://api.ipify.org' -UseBasicParsing -TimeoutSec 8).Content.Trim();Write-Host 'Dis test:' ('http://'+$ip+'/') -ForegroundColor Cyan}catch{}}catch{Write-Host '(HATA)' $_.Exception.Message -ForegroundColor Red;exit 1}"
goto :son

:guncelle
echo.
echo === GUNCELLE — git + build ===
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\git-pull.ps1"
if errorlevel 1 (
  echo git pull olmadi — ZIP...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\GITHUB-ZIP-GUNCELLE.ps1"
  if errorlevel 1 goto :hata
)
set NODE_ENV=production
call npm run build
if errorlevel 1 goto :hata
call "%~f0" duzelt
goto :son

:kur
call :admin
echo.
echo === ILK KURULUM ===
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\Install-Mollayazilim-NextIIS.ps1"
if not exist "node_modules" (
  call npm ci
  if errorlevel 1 goto :hata
)
set NODE_ENV=production
call npm run build
if errorlevel 1 goto :hata
call "%~f0" duzelt
goto :son

:test
call :admin
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\DIS-ERISIM-TEST.ps1"
goto :son

:admin
net session >nul 2>&1
if not %errorlevel%==0 (
  echo Yonetici olarak aciliyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -ArgumentList '%MODE%' -Verb RunAs -Wait"
  exit /b %errorlevel%
)
exit /b 0

:hata
echo.
echo HATA. Log: pm2 logs mollayazilim --lines 20
pause
exit /b 1

:son
if errorlevel 1 goto :hata
echo.
echo Tamam — http://localhost/
pause
exit /b 0
