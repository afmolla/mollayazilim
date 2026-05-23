#Requires -Version 5.1
<#
  PM2 npm.cmd hatasi duzeltmesi (Windows sunucu)

  Hata: SyntaxError Unexpected token ':'  ->  npm.cmd Node ile calistirilmis

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\PM2-DUZELT.ps1
#>
$ErrorActionPreference = "Stop"

$AppRoot = if ($env:MOLLAYAZILIM_ROOT) { $env:MOLLAYAZILIM_ROOT } else {
  (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
if (-not (Test-Path (Join-Path $AppRoot "deploy\ecosystem.config.cjs"))) {
  $alt = "C:\inetpub\wwwroot\mollyazilim"
  if (Test-Path (Join-Path $alt "deploy\ecosystem.config.cjs")) { $AppRoot = $alt }
}

Set-Location $AppRoot
$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
$Pm2Name = "mollayazilim"

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  Write-Host "PM2 yok: npm install -g pm2" -ForegroundColor Red
  exit 1
}

Write-Host "=== PM2 duzelt ($AppRoot) ===" -ForegroundColor Cyan

pm2 delete $Pm2Name 2>$null | Out-Null
pm2 save --force 2>$null | Out-Null

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "Build eksik, calistiriliyor..."
  $env:NODE_ENV = "production"
  npm run build
}

pm2 start $eco
pm2 save
Start-Sleep -Seconds 6
pm2 list

try {
  $r = Invoke-WebRequest "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 20
  Write-Host "Node OK: HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Node hata: $($_.Exception.Message)" -ForegroundColor Red
  pm2 logs $Pm2Name --lines 15 --nostream
  exit 1
}

Write-Host ""
Write-Host "localhost :80 icin (Yonetici): .\SUNUCU-LOCALHOST-TAM.ps1" -ForegroundColor Yellow
Write-Host "Tarayici: http://localhost/  ( :3000 yazma )"
