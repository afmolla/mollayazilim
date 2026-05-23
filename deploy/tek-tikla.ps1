#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$poolName = "MollayazilimPool"

Write-Host ""
Write-Host "========== MOLLAYAZILIM CALISTIR ==========" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"
Write-Host ""

Set-Location $AppRoot
New-Item -ItemType Directory -Path (Join-Path $AppRoot "logs") -Force | Out-Null

function Ensure-Arr {
  $arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
  if (-not (Test-Path $arrDll)) {
    Write-Host "[1/5] ARR kuruluyor (MSI, winget gerekmez)..." -ForegroundColor Yellow
    & "$PSScriptRoot\Install-ARR-MSI.ps1"
  }
  Import-Module WebAdministration -ErrorAction Stop
  Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" `
    -filter "system.webServer/proxy" -name "enabled" -value "True"
  $appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
  & $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
  Write-Host "[OK] ARR proxy" -ForegroundColor Green
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js yok: https://nodejs.org/"
}
Write-Host "[OK] Node $(node -v)"

Ensure-Arr

# Build
if (-not (Test-Path "node_modules")) {
  Write-Host "[2/5] npm ci..."
  npm ci
}
if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "[3/5] npm run build..."
  $env:NODE_ENV = "production"
  npm run build
} else {
  Write-Host "[2-3/5] Build var" -ForegroundColor DarkGray
}

# PM2
Write-Host "[4/5] PM2 baslat..."
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  npm install -g pm2
}
$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
pm2 delete mollayazilim 2>$null | Out-Null
pm2 start $eco
pm2 save 2>$null | Out-Null
Start-Sleep -Seconds 10

try {
  $n = Invoke-WebRequest "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 30
  Write-Host "[OK] Node :3000 -> $($n.StatusCode)" -ForegroundColor Green
} catch {
  pm2 logs mollayazilim --lines 20 --nostream
  throw "Node calismiyor: $($_.Exception.Message)"
}

# IIS
Write-Host "[5/5] IIS..."
Import-Module WebAdministration -ErrorAction Stop

if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
  if ((Get-Website -Name "Default Web Site").State -eq "Started") {
    Stop-Website -Name "Default Web Site"
  }
}

if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
  if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
    New-WebAppPool -Name $poolName
    Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
  }
  New-Website -Name $siteName -PhysicalPath $AppRoot -ApplicationPool $poolName -Port 80 -HostHeader "localhost"
}

Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $AppRoot
Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $poolName
Start-WebAppPool -Name $poolName

foreach ($h in @("localhost", "127.0.0.1", "mollayazilim.com", "www.mollayazilim.com", "mollayazilim.com.tr", "www.mollayazilim.com.tr")) {
  if (-not (Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -eq "*:80:$h" })) {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $h
  }
}
if (-not (Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -eq "*:80:" })) {
  New-WebBinding -Name $siteName -Protocol http -Port 80
}

Start-Website -Name $siteName

$ok = $false
foreach ($url in @("http://localhost/", "http://127.0.0.1/")) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
    Write-Host "[OK] $url -> $($r.StatusCode)" -ForegroundColor Green
    $ok = $true
  } catch {
    Write-Host "[HATA] $url -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

if (-not $ok) {
  Write-Host ""
  Write-Host "Node ayakta ama IIS baglanamiyor. ARR proxy acik mi kontrol et." -ForegroundColor Yellow
  Write-Host "pm2 logs mollayazilim --lines 15 --nostream"
  exit 1
}

Write-Host ""
Write-Host "========== TAMAM ==========" -ForegroundColor Green
Write-Host "http://localhost/"
Write-Host ""
