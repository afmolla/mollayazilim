@echo off
chcp 65001 >nul
setlocal EnableExtensions

title Molla Yazilim - Siteyi ac
cd /d "%~dp0.."
set "APPROOT=%CD%"
set "ECO=%APPROOT%\deploy\ecosystem-iis.config.cjs"
set "START_SCRIPT=%APPROOT%\deploy\start-next.cjs"
set "PM2_NAME=mollayazilim"
set "PORT=3000"

echo === Siteyi ac ===
echo http://localhost/  (IIS :80 -^> Node :3000)
echo.

if not exist "%APPROOT%\.next\BUILD_ID" (
  echo Build eksik - npm run build...
  set NODE_ENV=production
  call npm run build
  if errorlevel 1 exit /b 1
)

where pm2.cmd >nul 2>nul
if errorlevel 1 (
  echo PM2 yok: npm install -g pm2
  exit /b 1
)

call pm2.cmd describe "%PM2_NAME%" >nul 2>nul
if errorlevel 1 goto :pm2_start
call pm2.cmd restart "%PM2_NAME%" --update-env
if errorlevel 1 goto :pm2_start
goto :pm2_save

:pm2_start
if exist "%ECO%" (
  echo PM2 ecosystem bulundu: %ECO%
  call pm2.cmd start "%ECO%" --update-env
) else (
  echo UYARI: %ECO% bulunamadi. Direkt start-next.cjs ile baslatiliyor...
  if not exist "%START_SCRIPT%" (
    echo HATA: %START_SCRIPT% bulunamadi. git pull origin main tekrar calistir.
    exit /b 1
  )
  set "NODE_ENV=production"
  set "PORT=%PORT%"
  set "HOSTNAME=0.0.0.0"
  call pm2.cmd start "%START_SCRIPT%" --name "%PM2_NAME%" --interpreter node --update-env
)
if errorlevel 1 exit /b 1

:pm2_save
call pm2.cmd save 2>nul

timeout /t 6 /nobreak >nul

call :http_status "http://127.0.0.1:%PORT%/" NODE_STATUS
call :is_success "%NODE_STATUS%"
if errorlevel 1 (
  echo ^(HATA^) Node port %PORT% status %NODE_STATUS%
  call pm2.cmd logs "%PM2_NAME%" --lines 15 --nostream 2>nul
  exit /b 1
)
echo ^(OK^) Node port %PORT% status %NODE_STATUS%

call :http_status "http://localhost/" IIS_STATUS
call :is_success "%IIS_STATUS%"
if not errorlevel 1 goto :open_site

echo ^(HATA^) localhost status %IIS_STATUS%
echo.
echo IIS localhost hatasi algilandi: HTTP %IIS_STATUS%
echo CMD onarimi baslatiliyor...
call "%~dp0FIX-LOCALHOST.cmd"
if errorlevel 1 exit /b 2

timeout /t 3 /nobreak >nul
call :http_status "http://localhost/" IIS_STATUS
call :is_success "%IIS_STATUS%"
if errorlevel 1 (
  echo ^(HATA^) onarim sonrasi localhost status %IIS_STATUS%
  exit /b 2
)

:open_site
echo ^(OK^) localhost status %IIS_STATUS%
echo.
echo Tarayici: http://localhost/
start "" "http://localhost/"
exit /b 0

:http_status
set "HTTP_URL=%~1"
set "HTTP_VAR=%~2"
set "HTTP_CODE=000"
where curl.exe >nul 2>nul
if "%errorlevel%"=="0" (
  for /f "delims=" %%C in ('curl.exe -L -s -o NUL -w "%%{http_code}" --connect-timeout 10 --max-time 30 "%HTTP_URL%" 2^>NUL') do set "HTTP_CODE=%%C"
) else (
  for /f "delims=" %%C in ('powershell -NoProfile -Command "try{$r=Invoke-WebRequest -Uri ''%HTTP_URL%'' -UseBasicParsing -TimeoutSec 30;[int]$r.StatusCode}catch{if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{0}}" 2^>NUL') do set "HTTP_CODE=%%C"
)
if "%HTTP_CODE%"=="" set "HTTP_CODE=000"
set "%HTTP_VAR%=%HTTP_CODE%"
exit /b 0

:is_success
set "CODE=%~1"
if "%CODE:~0,1%"=="2" exit /b 0
if "%CODE:~0,1%"=="3" exit /b 0
exit /b 1
