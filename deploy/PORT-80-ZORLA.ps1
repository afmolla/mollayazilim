#Requires -RunAsAdministrator
<#
  :3000 kapat -> port 80 ac, URL'leri duzelt, yeniden build

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\PORT-80-ZORLA.ps1
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $AppRoot

Write-Host "========== PORT 80 ZORLA (:3000 KAPAT) ==========" -ForegroundColor Cyan

# Dis IP
try {
  $ip = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 10).Content.Trim()
} catch { $ip = "85.95.251.204" }
$siteUrl = "http://$ip"
Write-Host "Site URL (port yok): $siteUrl"

# .env.production.local
$envFile = Join-Path $AppRoot ".env.production.local"
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $AppRoot ".env.example") $envFile
}
$lines = Get-Content $envFile
$found = $false
$lines = $lines | ForEach-Object {
  if ($_ -match '^NEXT_PUBLIC_SITE_URL=') {
    $found = $true
    "NEXT_PUBLIC_SITE_URL=$siteUrl"
  } else { $_ }
}
if (-not $found) { $lines += "NEXT_PUBLIC_SITE_URL=$siteUrl" }
$lines | Set-Content $envFile -Encoding UTF8
Write-Host "[OK] .env.production.local guncellendi"

# IIS kapat (W3SVC yeter — Get-Website RPC hatasi verir)
try {
  $w3 = Get-Service W3SVC -ErrorAction SilentlyContinue
  if ($w3 -and $w3.Status -eq "Running") {
    Stop-Service W3SVC -Force -ErrorAction Stop
    Write-Host "[OK] IIS (W3SVC) durduruldu" -ForegroundColor Yellow
  } else {
    Write-Host "[OK] IIS zaten kapali" -ForegroundColor DarkGray
  }
  Set-Service W3SVC -StartupType Manual -ErrorAction SilentlyContinue
} catch {
  Write-Host "IIS durdurma atlandi: $($_.Exception.Message)" -ForegroundColor DarkGray
  net stop w3svc 2>$null | Out-Null
}
Start-Sleep -Seconds 2

# 3000 ve 80 dinleyen her seyi oldur
foreach ($p in @(3000, 80)) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Port $p PID $($_.OwningProcess) durduruluyor..."
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 kill 2>$null | Out-Null
  Start-Sleep -Seconds 2
}

# Build (NEXT_PUBLIC_ build zamaninda gomulur)
Write-Host "npm run build..."
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_SITE_URL = $siteUrl
npm run build
if ($LASTEXITCODE -ne 0) { throw "build basarisiz" }

# PM2 port 80
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) { npm install -g pm2 }
$env:PORT = "80"
pm2 start (Join-Path $AppRoot "deploy\ecosystem.config.cjs") --update-env
pm2 save 2>$null | Out-Null
Start-Sleep -Seconds 15

try {
  & "$PSScriptRoot\AC-FIREWALL.ps1"
} catch {
  Write-Host "Firewall atlandi: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Kontrol
if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) {
  Write-Host "UYARI: 3000 hala acik!" -ForegroundColor Red
}
$on80 = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
if (-not $on80) {
  pm2 logs mollayazilim --lines 30 --nostream
  throw "Port 80 dinlemiyor"
}
Write-Host "[OK] Port 80 dinleniyor" -ForegroundColor Green

foreach ($u in @("http://localhost/", "http://127.0.0.1/", "$siteUrl/")) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 25
    Write-Host "[OK] $u -> $($r.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "[?] $u -> $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Site: $siteUrl/   (:3000 KULLANMA)" -ForegroundColor Green
Write-Host ""
