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

$arrDll = "$env:ProgramFiles\IIS\Application Request Routing\requestrouter.dll"
if (-not (Test-Path $arrDll)) {
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    Write-Host "winget ile ARR kuruluyor..." -ForegroundColor Cyan
    winget install Microsoft.IIS.ApplicationRequestRouting `
      --accept-package-agreements --accept-source-agreements
  }
}
if (-not (Test-Path $arrDll)) {
  Write-Host "ARR yuklu degil. Yonetici PowerShell:" -ForegroundColor Yellow
  Write-Host "  winget install Microsoft.IIS.ApplicationRequestRouting"
  Write-Host "veya: https://www.iis.net/downloads/microsoft/application-request-routing"
  exit 1
}

Import-Module WebAdministration -ErrorAction Stop
Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True"
Write-Host "ARR proxy acildi." -ForegroundColor Green
iisreset /restart
Write-Host "Tamam. Simdi: .\LOCAL-BASLAT.ps1"
