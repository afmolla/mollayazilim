@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo 1) Git guncelle
echo 2) localhost duzelt
echo.
cd /d "%~dp0.."
where git >nul 2>&1
if %errorlevel%==0 (
  git -c core.editor=true pull origin main --no-edit 2>nul
  if errorlevel 1 (
    echo git pull olmadi, ZIP deneniyor...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0GITHUB-ZIP-GUNCELLE.ps1"
  )
) else (
  echo git yok, ZIP ile cekiliyor...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0GITHUB-ZIP-GUNCELLE.ps1"
)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0FIX-LOCALHOST.ps1\"\"' -Wait"
echo.
pause
