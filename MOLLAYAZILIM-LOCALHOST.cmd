@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  mollayazilim.com — http://localhost:3000
echo  (Port 3000 doluysa: Vampir API kapat veya API_PORT=3100 ile baslat)
echo.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
  tasklist /FI "PID eq %%a" 2>nul | findstr /I "index.js" >nul && (
    echo  Uyari: Vampir API port 3000'de — kapatiliyor PID %%a
    taskkill /PID %%a /F >nul 2>&1
  )
)
timeout /t 2 /nobreak >nul
echo  Sunucu baslatiliyor... (Ctrl+C durdur)
start "" "http://localhost:3000"
npm run dev
pause
