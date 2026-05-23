#Requires -Version 5.1
<#
  http://localhost/ icin:
  1) Node arka planda 127.0.0.1:3000 (disariya acik degil)
  2) IIS :80 proxy (ARR gerekli — INSTALL-ARR.ps1)

  Tarayici: http://localhost/  — :3000 YAZMA
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $AppRoot

Write-Host "=== localhost (IIS :80) ===" -ForegroundColor Cyan

# PM2 veya npm start arka planda
$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 delete mollayazilim 2>$null | Out-Null
  pm2 start $eco
  pm2 save 2>$null | Out-Null
} else {
  # Eski dev kapat
  Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep 2
  if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
    $env:NODE_ENV = "production"
    npm run build
  }
  $arg = "/c cd /d `"$AppRoot`" && set NODE_ENV=production && npm run start"
  Start-Process cmd.exe -ArgumentList $arg -WindowStyle Minimized
  Write-Host "Node baslatildi (minimize pencere). PM2 onerilir: npm i -g pm2"
}

Start-Sleep -Seconds 6

# Node ic test
try {
  $n = Invoke-WebRequest "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 30
  Write-Host "Node OK (ic): $($n.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Node ayakta degil: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# IIS test
try {
  $w = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 30
  Write-Host "IIS OK: http://localhost/ -> $($w.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "IIS localhost calismiyor: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host ""
  Write-Host "Muhtemel cozum (Yonetici):"
  Write-Host "  .\INSTALL-ARR.ps1"
  Write-Host "  .\LOCALHOST-IIS-DUZELT.ps1"
  Write-Host ""
  Write-Host "Gecici: tarayicida http://127.0.0.1:3000 acilir (ARR olmadan)"
}

Write-Host ""
Write-Host "Adres: http://localhost/"
