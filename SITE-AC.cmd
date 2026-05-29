@echo off
title Molla Yazilim - localhost
cd /d "%~dp0deploy"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\LOCAL-BASLAT.ps1"
echo.
echo Tarayici: http://localhost/
echo (:3000 yazma - sadece sunucu icinde kullanilir)
pause
