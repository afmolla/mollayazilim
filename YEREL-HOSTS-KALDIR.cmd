@echo off
REM Sunucuda veya PC'de mollayazilim.com -> 127.0.0.1 hosts satirlarini kaldir
call "%~dp0deploy\BOOTSTRAP-PATH.cmd"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\KALDIR-YEREL-HOSTS.ps1"
pause
