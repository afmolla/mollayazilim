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

Set-Location $AppRoot
$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
$Pm2Name = "mollayazilim"

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  Write-Host "PM2 yok: npm install -g pm2" -ForegroundColor Red
  exit 1
}

Write-Host "=== PM2 duzelt ($AppRoot) ===" -ForegroundColor Cyan

# pm2.ps1 stderr uyarisi olmasin diye cmd uzerinden (No process found = normal)
cmd /c "pm2.cmd delete $Pm2Name 2>nul"
cmd /c "pm2.cmd save --force 2>nul"

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "Build eksik, calistiriliyor..."
  $env:NODE_ENV = "production"
  npm run build
}

cmd /c "pm2.cmd start `"$eco`" --update-env"
cmd /c "pm2.cmd save"
Start-Sleep -Seconds 6
cmd /c "pm2.cmd list"

try {
  $r = Invoke-WebRequest "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 20
  Write-Host "Node OK: HTTP $($r.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Node hata: $($_.Exception.Message)" -ForegroundColor Red
  cmd /c "pm2.cmd logs $Pm2Name --lines 15 --nostream"
  exit 1
}

Write-Host ""
Write-Host "localhost :80 icin (Yonetici): .\SUNUCU-LOCALHOST-TAM.ps1" -ForegroundColor Yellow
Write-Host "Tarayici: http://localhost/  ( :3000 yazma )"
