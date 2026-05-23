#Requires -RunAsAdministrator
<#
  VPS / sunucu: http://localhost/ calismiyorsa (PC'de calisiyor ama sunucuda degil)

  Yonetici PowerShell:
    cd C:\inetpub\wwwroot\mollayazilim\deploy
    .\SUNUCU-LOCALHOST-TAM.ps1

#>
$ErrorActionPreference = "Stop"

function Resolve-MollaRoot {
  if ($env:MOLLAYAZILIM_ROOT -and (Test-Path (Join-Path $env:MOLLAYAZILIM_ROOT "web.config"))) {
    return (Resolve-Path $env:MOLLAYAZILIM_ROOT).Path
  }
  $root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  if (Test-Path (Join-Path $root "web.config")) { return $root }
  $fixed = "C:\inetpub\wwwroot\mollayazilim"
  if (Test-Path (Join-Path $fixed "web.config")) { return $fixed }
  throw "Proje bulunamadi: C:\inetpub\wwwroot\mollayazilim"
}

function Test-PortListen {
  param([int]$P)
  return [bool](Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction SilentlyContinue)
}

function Ensure-Arr {
  $arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
  if (-not (Test-Path $arrDll)) {
    Write-Host "ARR kuruluyor (winget)..." -ForegroundColor Yellow
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) { throw "winget yok. Kur: winget install Microsoft.IIS.ApplicationRequestRouting" }
    winget install Microsoft.IIS.ApplicationRequestRouting `
      --accept-package-agreements --accept-source-agreements
  }
  if (-not (Test-Path $arrDll)) {
    throw "ARR yuklu degil. winget install Microsoft.IIS.ApplicationRequestRouting"
  }
  Import-Module WebAdministration -ErrorAction Stop
  Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" `
    -filter "system.webServer/proxy" -name "enabled" -value "True"
  $appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
  if (Test-Path $appcmd) {
    & $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
  }
  Write-Host "ARR proxy: acik" -ForegroundColor Green
}

Write-Host "=== Sunucu localhost tam duzeltme ===" -ForegroundColor Cyan

$AppRoot = Resolve-MollaRoot
$siteName = "mollayazilim.com"
$poolName = "MollayazilimPool"
$Port = 3000

Write-Host "Klasor: $AppRoot"

Ensure-Arr
Import-Module WebAdministration -ErrorAction Stop

# IIS site
if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
  & "$PSScriptRoot\Install-Mollayazilim-NextIIS.ps1"
}

Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $AppRoot
Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $poolName

if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
  New-WebAppPool -Name $poolName
  Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
}
Start-WebAppPool -Name $poolName

$extraHosts = @(
  "localhost",
  "mollayazilim.com",
  "www.mollayazilim.com",
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)
foreach ($domain in $extraHosts) {
  $has = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -eq "*:80:$domain" }
  if (-not $has) {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $domain
    Write-Host "Binding: http://$domain/" -ForegroundColor Green
  }
}

# Default site port 80 carpismasi (bos sayfa / baska site)
$defaultSite = Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
if ($defaultSite -and $defaultSite.State -eq "Started") {
  $defLocal = Get-WebBinding -Name "Default Web Site" | Where-Object {
    $_.bindingInformation -match ":80:localhost" -or $_.bindingInformation -eq "*:80:"
  }
  if ($defLocal) {
    Write-Host "Uyari: Default Web Site port 80 kullaniyor; durduruluyor..." -ForegroundColor Yellow
    Stop-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
  }
}

Start-Website -Name $siteName

# Node / PM2
Set-Location $AppRoot
$env:NODE_ENV = "production"

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "Build..." -ForegroundColor Yellow
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build basarisiz" }
}

$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 delete mollayazilim 2>$null | Out-Null
  pm2 start $eco
  pm2 save 2>$null | Out-Null
  Start-Sleep -Seconds 8
} else {
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 2
  $arg = "/c cd /d `"$AppRoot`" && set NODE_ENV=production && npm run start"
  Start-Process cmd.exe -ArgumentList $arg -WindowStyle Minimized
  Start-Sleep -Seconds 10
}

if (-not (Test-PortListen $Port)) {
  throw "Node port $Port dinlemiyor. pm2 logs mollayazilim"
}

$nodeOk = $false
try {
  $r = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 30
  Write-Host "Node (ic): HTTP $($r.StatusCode)" -ForegroundColor Green
  $nodeOk = $true
} catch {
  Write-Host "Node HTTP hata: $($_.Exception.Message)" -ForegroundColor Red
}

$iisOk = $false
try {
  $w = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 30
  Write-Host "IIS localhost: HTTP $($w.StatusCode)" -ForegroundColor Green
  $iisOk = $true
} catch {
  Write-Host "IIS localhost: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
if ($nodeOk -and $iisOk) {
  Write-Host "Tamam. Sunucuda ac: http://localhost/" -ForegroundColor Green
  Write-Host "Canli: https://mollayazilim.com  http://mollayazilim.com.tr"
} else {
  Write-Host "Hata devam ediyorsa pm2 logs mollayazilim ve IIS loglarina bakin."
  exit 1
}
