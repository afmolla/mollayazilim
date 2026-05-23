#Requires -RunAsAdministrator
<#
  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\INSTALL-ARR.ps1
#>
$ErrorActionPreference = "Stop"
& "$PSScriptRoot\Install-ARR-MSI.ps1"
Import-Module WebAdministration -ErrorAction Stop
Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" -filter "system.webServer/proxy" -name "enabled" -value "True"
Write-Host "ARR proxy acik. iisreset..."
iisreset /restart
Write-Host "Tamam."
