#Requires -RunAsAdministrator
<#
  localhost 403.14 / 404 duzeltme (PC + sunucu ayni)

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\FIX-LOCALHOST.ps1
#>
$ErrorActionPreference = "Stop"

function Test-Http {
  param([string]$Url)
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    return @{ Ok = $true; Code = $r.StatusCode; Len = $r.Content.Length }
  } catch {
    return @{ Ok = $false; Err = $_.Exception.Message }
  }
}

function Ensure-Binding {
  param([string]$Site, [string]$HostHeader)
  $info = if ($HostHeader) { "*:80:$HostHeader" } else { "*:80:" }
  $has = Get-WebBinding -Name $Site | Where-Object { $_.bindingInformation -eq $info }
  if (-not $has) {
    if ($HostHeader) {
      New-WebBinding -Name $Site -Protocol http -Port 80 -HostHeader $HostHeader | Out-Null
    } else {
      New-WebBinding -Name $Site -Protocol http -Port 80 | Out-Null
    }
    Write-Host "  + binding $info" -ForegroundColor Green
  }
}

$siteName = "mollayazilim.com"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$poolName = "MollayazilimPool"

Write-Host "=== FIX localhost (403 / 404) ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot`n"

# 1) ARR
$arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
if (-not (Test-Path $arrDll)) {
  Write-Host "ARR kuruluyor..." -ForegroundColor Yellow
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    winget install Microsoft.IIS.ApplicationRequestRouting `
      --accept-package-agreements --accept-source-agreements
  }
}
if (-not (Test-Path $arrDll)) {
  throw "ARR yok. Yonetici: winget install Microsoft.IIS.ApplicationRequestRouting"
}

Import-Module WebAdministration -ErrorAction Stop
Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" `
  -filter "system.webServer/proxy" -name "enabled" -value "True"
$appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
& $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
Write-Host "[OK] ARR proxy acik"

# 2) Default site kapat (wwwroot 403)
if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
  if ((Get-Website -Name "Default Web Site").State -eq "Started") {
    Stop-Website -Name "Default Web Site"
    Write-Host "[OK] Default Web Site durduruldu"
  }
}

# 3) Site + binding
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

Write-Host "Bindings:"
Ensure-Binding -Site $siteName -HostHeader "localhost"
Ensure-Binding -Site $siteName -HostHeader "127.0.0.1"
Ensure-Binding -Site $siteName -HostHeader "mollayazilim.com"
Ensure-Binding -Site $siteName -HostHeader "www.mollayazilim.com"
Ensure-Binding -Site $siteName -HostHeader "mollayazilim.com.tr"
Ensure-Binding -Site $siteName -HostHeader "www.mollayazilim.com.tr"
Ensure-Binding -Site $siteName -HostHeader ""   # IP ile giris (*:80:)

Start-Website -Name $siteName

# 4) Node :3000
Set-Location $AppRoot
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
  Write-Host "Node baslatiliyor (PM2)..." -ForegroundColor Yellow
  if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    throw "PM2 yok: npm install -g pm2  sonra .\PM2-DUZELT.ps1"
  }
  & "$PSScriptRoot\PM2-DUZELT.ps1"
  Start-Sleep -Seconds 3
}

$n = Test-Http "http://127.0.0.1:3000/"
if ($n.Ok) {
  Write-Host "[OK] Node :3000 -> $($n.Code) ($($n.Len) byte)" -ForegroundColor Green
} else {
  throw "Node calismiyor: $($n.Err)  ->  pm2 logs mollayazilim --lines 30 --nostream"
}

# 5) IIS test
Write-Host ""
$allOk = $true
foreach ($url in @("http://localhost/", "http://127.0.0.1/")) {
  $t = Test-Http $url
  if ($t.Ok) {
    Write-Host "[OK] $url -> $($t.Code)" -ForegroundColor Green
  } else {
    Write-Host "[HATA] $url -> $($t.Err)" -ForegroundColor Red
    $allOk = $false
  }
}

if (-not $allOk) {
  Write-Host ""
  Write-Host "Hala 404 ise:" -ForegroundColor Yellow
  Write-Host "  1) iisreset  sonra tekrar bu script"
  Write-Host "  2) pm2 logs mollayazilim --lines 30 --nostream"
  Write-Host "  3) Tarayici: http://localhost/  (http://127.0.0.1/ degil deneyebilirsin)"
  exit 1
}

Write-Host ""
Write-Host "Tamam. Ac: http://localhost/" -ForegroundColor Green
