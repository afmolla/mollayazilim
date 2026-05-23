#Requires -RunAsAdministrator
<#
  HTTP 403.14 + Physical Path C:\inetpub\wwwroot  ->  yanlis site (Default Web Site)

  Yonetici PowerShell:
    cd C:\inetpub\wwwroot\mollayazilim\deploy
    .\FIX-LOCALHOST-403.ps1
#>
$ErrorActionPreference = "Stop"
Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$poolName = "MollayazilimPool"

Write-Host "=== localhost 403.14 duzelt ===" -ForegroundColor Cyan
Write-Host "Hedef klasor: $AppRoot"

# Default Web Site localhost / genel 80'i birak
$defaultName = "Default Web Site"
if (Get-Website -Name $defaultName -ErrorAction SilentlyContinue) {
  $def = Get-Website -Name $defaultName
  if ($def.State -eq "Started") {
    Stop-Website -Name $defaultName
    Write-Host "Durduruldu: $defaultName (wwwroot kokune dusuyordu)" -ForegroundColor Yellow
  }
}

# ARR proxy
$arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
if (Test-Path $arrDll) {
  Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" `
    -filter "system.webServer/proxy" -name "enabled" -value "True"
  $appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
  & $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
} else {
  Write-Host "ARR yok - once: .\INSTALL-ARR.ps1" -ForegroundColor Red
  exit 1
}

# mollayazilim.com sitesi
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

foreach ($domain in @("localhost", "mollayazilim.com", "www.mollayazilim.com", "mollayazilim.com.tr", "www.mollayazilim.com.tr")) {
  $has = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -eq "*:80:$domain" }
  if (-not $has) {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $domain
    Write-Host "Binding: $domain"
  }
}

Start-Website -Name $siteName

# Node
Set-Location $AppRoot
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
  Write-Host "Node baslatiliyor..."
  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 delete mollayazilim 2>$null | Out-Null
    pm2 start (Join-Path $AppRoot "deploy\ecosystem.config.cjs")
    pm2 save 2>$null | Out-Null
    Start-Sleep -Seconds 8
  } else {
    throw "Port 3000 kapali. Once: .\PM2-DUZELT.ps1"
  }
}

try {
  $w = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 30
  Write-Host "OK http://localhost/ -> HTTP $($w.StatusCode)" -ForegroundColor Green
  Write-Host "Physical path artik $AppRoot olmali (403.14 wwwroot degil)"
} catch {
  Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "pm2 logs mollayazilim --lines 20 --nostream"
  exit 1
}
