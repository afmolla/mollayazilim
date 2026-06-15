@echo off
REM Yonetici CMD'de PATH eksik kalir; bilinen kurulum yollarini ekle.

if exist "C:\Program Files\Git\cmd\git.exe" (
  set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"
)
if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
  set "PATH=C:\Program Files (x86)\Git\cmd;C:\Program Files (x86)\Git\bin;%PATH%"
)
if exist "C:\Program Files\nodejs\node.exe" (
  set "PATH=C:\Program Files\nodejs;%PATH%"
)
if exist "%APPDATA%\npm" (
  set "PATH=%APPDATA%\npm;%PATH%"
)
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe" (
  set "PATH=%LOCALAPPDATA%\Microsoft\WindowsApps;%PATH%"
)

exit /b 0
