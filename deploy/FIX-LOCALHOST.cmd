@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

title Molla Yazilim - IIS localhost duzelt
cd /d "%~dp0.."
set "APPROOT=%CD%"
set "SITE=mollayazilim.com"
set "POOL=MollayazilimPool"
set "APPCMD=%windir%\System32\inetsrv\appcmd.exe"
set "ARR_DLL=%ProgramFiles%\IIS\Application Request Routing\requestrouter.dll"
set "REWRITE_DLL=%windir%\System32\inetsrv\rewrite.dll"

echo === FIX localhost CMD (403 / 404 / 500) ===
echo Klasor: %APPROOT%
echo.

net session >nul 2>&1
if "%errorlevel%"=="0" goto :admin_ok
echo HATA: Bu duzeltme Yonetici CMD gerektirir.
echo Cozum: BASLAT.cmd duzelt
exit /b 2

:admin_ok

if not exist "%APPCMD%" (
  echo IIS appcmd bulunamadi. IIS ozellikleri aciliyor...
  dism /online /enable-feature /featurename:IIS-WebServerRole /all /norestart
  dism /online /enable-feature /featurename:IIS-WebServerManagementTools /all /norestart
  dism /online /enable-feature /featurename:IIS-ManagementConsole /all /norestart
)

if not exist "%APPCMD%" (
  echo HATA: IIS appcmd hala yok: %APPCMD%
  exit /b 1
)

call :ensure_arr
if errorlevel 1 exit /b 1

"%APPCMD%" set config -section:system.webServer/proxy /enabled:"True" /commit:apphost >nul
if errorlevel 1 (
  echo HATA: ARR proxy acilamadi.
  exit /b 1
)
echo [OK] ARR proxy acik

"%APPCMD%" stop site "Default Web Site" >nul 2>nul

call :ensure_pool
if errorlevel 1 exit /b 1

call :ensure_site
if errorlevel 1 exit /b 1

echo Bindings:
call :reset_binding "localhost"
call :reset_binding "127.0.0.1"
call :reset_binding "mollayazilim.com"
call :reset_binding "www.mollayazilim.com"
call :reset_binding "mollayazilim.com.tr"
call :reset_binding "www.mollayazilim.com.tr"

"%APPCMD%" start apppool /apppool.name:"%POOL%" >nul 2>nul
"%APPCMD%" start site "%SITE%" >nul 2>nul

iisreset /restart >nul

call :http_status "http://127.0.0.1:3000/" NODE_STATUS
call :http_status "http://localhost/" IIS_STATUS

echo.
echo Node :3000 status: %NODE_STATUS%
echo localhost status: %IIS_STATUS%
call :is_success "%NODE_STATUS%"
if errorlevel 1 (
  echo HATA: Node 3000 cevap vermiyor. pm2 logs mollayazilim --lines 30
  exit /b 1
)
call :is_success "%IIS_STATUS%"
if errorlevel 1 (
  echo HATA: IIS localhost hala duzelmedi. ARR/URL Rewrite kuruldu mu kontrol et.
  echo Log: pm2 logs mollayazilim --lines 30
  exit /b 1
)

echo.
echo Tamam. Ac: http://localhost/
exit /b 0

:ensure_arr
if exist "%REWRITE_DLL%" goto :arr_check
call :install_package "Microsoft.IIS.URLRewriteModule" "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D1232/IISRewrite_amd64.msi" "%TEMP%\IISRewrite_amd64.msi" "URL Rewrite"
if errorlevel 1 exit /b 1

:arr_check
if exist "%ARR_DLL%" (
  echo [OK] ARR yuklu
  exit /b 0
)
call :install_package "Microsoft.IIS.ApplicationRequestRouting" "https://go.microsoft.com/fwlink/?LinkID=615136" "%TEMP%\requestRouter_amd64.msi" "ARR"
if errorlevel 1 exit /b 1
if not exist "%ARR_DLL%" (
  echo HATA: ARR kurulamadi. Elle indir: https://www.iis.net/downloads/microsoft/application-request-routing
  exit /b 1
)
echo [OK] ARR yuklu
exit /b 0

:install_package
set "PKG_ID=%~1"
set "MSI_URL=%~2"
set "MSI_FILE=%~3"
set "PKG_NAME=%~4"
echo %PKG_NAME% kuruluyor...
where winget >nul 2>nul
if "%errorlevel%"=="0" (
  winget install --id "%PKG_ID%" -e --accept-package-agreements --accept-source-agreements
)
if "%PKG_NAME%"=="URL Rewrite" if exist "%REWRITE_DLL%" exit /b 0
if "%PKG_NAME%"=="ARR" if exist "%ARR_DLL%" exit /b 0

echo %PKG_NAME% MSI indiriliyor...
call :download "%MSI_URL%" "%MSI_FILE%"
if errorlevel 1 exit /b 1

echo %PKG_NAME% MSI kuruluyor...
msiexec /i "%MSI_FILE%" /qn /norestart
if errorlevel 3 (
  echo HATA: %PKG_NAME% MSI kurulum hatasi: %errorlevel%
  exit /b 1
)
timeout /t 3 /nobreak >nul
exit /b 0

:download
set "URL=%~1"
set "OUT=%~2"
if exist "%OUT%" del /f /q "%OUT%" >nul 2>nul
where curl.exe >nul 2>nul
if "%errorlevel%"=="0" (
  curl.exe -L --fail --connect-timeout 20 --max-time 180 -o "%OUT%" "%URL%"
) else (
  certutil -urlcache -f "%URL%" "%OUT%"
)
if not exist "%OUT%" (
  echo HATA: indirilemedi: %URL%
  exit /b 1
)
exit /b 0

:ensure_pool
"%APPCMD%" list apppool "%POOL%" >nul 2>nul
if errorlevel 1 "%APPCMD%" add apppool /name:"%POOL%" >nul
"%APPCMD%" set apppool "%POOL%" /managedRuntimeVersion:"" /processModel.identityType:ApplicationPoolIdentity >nul
exit /b %errorlevel%

:ensure_site
"%APPCMD%" list site "%SITE%" >nul 2>nul
if errorlevel 1 (
  "%APPCMD%" add site /name:"%SITE%" /bindings:http/*:80:mollayazilim.com /physicalPath:"%APPROOT%" >nul
) else (
  "%APPCMD%" set vdir "%SITE%/" /physicalPath:"%APPROOT%" >nul
)
if errorlevel 1 exit /b 1
"%APPCMD%" set app "%SITE%/" /applicationPool:"%POOL%" >nul
exit /b %errorlevel%

:reset_binding
set "HOST=%~1"
set "BIND=*:80:%HOST%"
for /f "usebackq delims=" %%S in (`"%APPCMD%" list site /text:name`) do (
  if /I not "%%S"=="%SITE%" "%APPCMD%" set site "%%S" /-bindings.[protocol='http',bindingInformation='%BIND%'] >nul 2>nul
)
"%APPCMD%" set site "%SITE%" /+bindings.[protocol='http',bindingInformation='%BIND%'] >nul 2>nul
if errorlevel 1 (
  echo   = %BIND%
) else (
  echo   + %BIND%
)
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
