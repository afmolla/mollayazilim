#Requires -RunAsAdministrator
<#
  IIS reverse proxy icin ARR kurulumu (localhost :3000 olmadan calismasi icin)

  Yonetici PowerShell:
    cd C:\inetpub\wwwroot\mollayazilim\deploy
    .\INSTALL-ARR.ps1
#>
$ErrorActionPreference = "Stop"

Write-Host "ARR (Application Request Routing) kurulumu..." -ForegroundColor Cyan
Write-Host "Indir: https://www.iis.net/downloads/microsoft/application-request-routing"
Write-Host ""

$url = "https://download.microsoft.com/download/E8E6B6E2-6F3B-4C1E-9F3D-3F3E3E3E3E3E/requestRouter_amd64.msi"
# Resmi link degisebilir — winget veya elle MSI onerilir

$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
  Write-Host "winget ile URL Rewrite kontrol..."
  winget install Microsoft.IISRewriteModule --accept-package-agreements --accept-source-agreements 2>$null
}

$arrDll = "$env:ProgramFiles\IIS\Application Request Routing\requestrouter.dll"
if (-not (Test-Path $arrDll)) {
  Write-Host ""
  Write-Host "ARR henuz yuklu degil. Elle kur:" -ForegroundColor Yellow
  Write-Host "  1) https://www.iis.net/downloads/microsoft/application-request-routing"
  Write-Host "  2) MSI indir ve kur (ARR 3.0 + URL Rewrite)"
  Write-Host "  3) IIS -> Sunucu -> Application Request Routing Cache"
  Write-Host "     -> Server Proxy Settings -> Enable proxy = TRUE"
  Write-Host "  4) .\LOCALHOST-IIS-DUZELT.ps1"
  Write-Host "  5) .\LOCAL-BASLAT.ps1"
  exit 1
}

Import-Module WebAdministration -ErrorAction Stop
Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True"
Write-Host "ARR proxy acildi." -ForegroundColor Green
iisreset /restart
Write-Host "Tamam. Simdi: .\LOCAL-BASLAT.ps1"
