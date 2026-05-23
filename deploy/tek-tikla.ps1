#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$poolName = "MollayazilimPool"
$nodeExe = "C:\Program Files\nodejs\node.exe"

Write-Host ""
Write-Host "========== MOLLAYAZILIM TEK TIKLA ==========" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"
Write-Host ""

Set-Location $AppRoot
New-Item -ItemType Directory -Path (Join-Path $AppRoot "logs") -Force | Out-Null

# HttpPlatformHandler
$hp = (Test-Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\HttpPlatform") -or `
      (Get-WebGlobalModule -Name "httpPlatformHandler" -ErrorAction SilentlyContinue)
if (-not $hp) {
  Write-Host "[1/6] HttpPlatformHandler kuruluyor..." -ForegroundColor Yellow
  $msi = "$env:TEMP\HttpPlatformHandler_amd64.msi"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  try {
    Invoke-WebRequest -Uri "https://download.microsoft.com/download/4/9/C/49CD28DB-5112-4C24-B909-83641E84E375/HttpPlatformHandler_amd64.msi" -OutFile $msi -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait
  } catch {
    Write-Host "MSI indirilemedi. Elle kur:" -ForegroundColor Red
    Write-Host "https://www.iis.net/downloads/microsoft/httpplatformhandler"
    throw
  }
}
Write-Host "[OK] HttpPlatformHandler" -ForegroundColor Green

if (-not (Test-Path $nodeExe)) { throw "Node yok: $nodeExe" }
Write-Host "[OK] Node: $( & $nodeExe -v )"

# PM2 kapali (IIS Node baslatir)
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 delete mollayazilim 2>$null | Out-Null
}

# Build
if (-not (Test-Path "node_modules")) {
  Write-Host "[2/6] npm ci..."
  npm ci
}
if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "[3/6] npm run build..."
  $env:NODE_ENV = "production"
  npm run build
} else {
  Write-Host "[2-3/6] Build zaten var" -ForegroundColor DarkGray
}

# IIS
Write-Host "[4/6] IIS ayari..."
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

Write-Host "[5/6] IIS yeniden baslat..."
iisreset /restart | Out-Null
Start-Sleep -Seconds 12

Write-Host "[6/6] Test..."
$ok = $false
foreach ($url in @("http://localhost/", "http://127.0.0.1/")) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45
    Write-Host "  OK $url -> $($r.StatusCode)" -ForegroundColor Green
    $ok = $true
  } catch {
    Write-Host "  HATA $url -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

if (-not $ok) {
  Write-Host ""
  Write-Host "Log: $AppRoot\logs\iis-node.log" -ForegroundColor Yellow
  if (Test-Path "$AppRoot\logs\iis-node.log") { Get-Content "$AppRoot\logs\iis-node.log" -Tail 25 }
  exit 1
}

Write-Host ""
Write-Host "========== TAMAM ==========" -ForegroundColor Green
Write-Host "Ac: http://localhost/"
Write-Host ""
