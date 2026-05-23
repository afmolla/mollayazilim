#Requires -RunAsAdministrator
<#
  Site dogrudan PORT 80 — IIS/ARR yok, :3000 yok

  CALISTIR.cmd ile calistir
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Port = 80

Write-Host ""
Write-Host "========== MOLLAYAZILIM — PORT 80 ==========" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"
Write-Host ""

Set-Location $AppRoot

# Tam cozum: PORT-80-ZORLA (env + build + 80)
& "$PSScriptRoot\PORT-80-ZORLA.ps1"
exit $LASTEXITCODE

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js yok: https://nodejs.org/"
}
Write-Host "[OK] Node $(node -v)"

# Port 80 icin IIS kapat (http.sys portu birakir)
Write-Host "[1/4] IIS durduruluyor (port 80 Node icin)..."
$w3 = Get-Service W3SVC -ErrorAction SilentlyContinue
if ($w3 -and $w3.Status -eq "Running") {
  Stop-Service W3SVC -Force
  Set-Service W3SVC -StartupType Manual
  Write-Host "  W3SVC durduruldu" -ForegroundColor Yellow
}
Get-Website -ErrorAction SilentlyContinue | ForEach-Object { Stop-Website -Name $_.Name -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# Eski :3000 process
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Build
if (-not (Test-Path "node_modules")) {
  Write-Host "[2/4] npm ci..."
  npm ci
}
if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "[3/4] npm run build..."
  $env:NODE_ENV = "production"
  npm run build
} else {
  Write-Host "[2-3/4] Build var" -ForegroundColor DarkGray
}

# PM2 port 80
Write-Host "[4/4] PM2 port $Port..."
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  npm install -g pm2
}
$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
pm2 delete mollayazilim 2>$null | Out-Null
pm2 start $eco
pm2 save 2>$null | Out-Null
Start-Sleep -Seconds 12

# Guvenlik duvari (80 ac, eski 3000 kurallarini temizle)
Write-Host "Guvenlik duvari port 80 + 3100 (API)..."
& "$PSScriptRoot\AC-FIREWALL.ps1"

$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  pm2 logs mollayazilim --lines 25 --nostream
  throw "Port $Port dinlemiyor. pm2 logs mollayazilim"
}

$ok = $false
foreach ($url in @("http://localhost/", "http://127.0.0.1/")) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
    Write-Host "[OK] $url -> HTTP $($r.StatusCode)" -ForegroundColor Green
    $ok = $true
  } catch {
    Write-Host "[HATA] $url -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

if (-not $ok) {
  pm2 logs mollayazilim --lines 20 --nostream
  exit 1
}

Write-Host ""
Write-Host "========== TAMAM — PORT 80 ==========" -ForegroundColor Green
Write-Host "http://localhost/     (:3000 YOK)"
Write-Host "http://mollayazilim.com/"
Write-Host ""
