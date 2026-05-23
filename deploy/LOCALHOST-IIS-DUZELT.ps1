#Requires -RunAsAdministrator
<#
  localhost bos / 404 veya 500 duzeltmesi

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\LOCALHOST-IIS-DUZELT.ps1
#>
$ErrorActionPreference = "Stop"
Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$poolName = "MollayazilimPool"

$physicalPath = if ($env:MOLLAYAZILIM_ROOT -and (Test-Path $env:MOLLAYAZILIM_ROOT)) {
  (Resolve-Path $env:MOLLAYAZILIM_ROOT).Path
} else {
  (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

Write-Host "=== localhost IIS duzelt ===" -ForegroundColor Cyan

# Site yolu
if (Get-Website -Name $siteName -ErrorAction SilentlyContinue) {
  Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $physicalPath
  Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $poolName
  Start-Website -Name $siteName
} else {
  & "$PSScriptRoot\Install-Mollayazilim-NextIIS.ps1"
}

# localhost binding
$hasLocal = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -like "*:80:localhost" }
if (-not $hasLocal) {
  New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader "localhost"
  Write-Host "Binding eklendi: http://localhost/"
}

# Pool
if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
  New-WebAppPool -Name $poolName
  Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
}
Start-WebAppPool -Name $poolName

# ARR proxy (modul yuklu ise)
$proxyPath = "IIS:\Sites\$siteName"
try {
  Set-WebConfigurationProperty -pspath $proxyPath -filter "system.webServer/proxy" -name "enabled" -value "True" -ErrorAction SilentlyContinue
} catch { }

$appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
if (Test-Path $appcmd) {
  & $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost 2>$null
}

Write-Host ""
Write-Host "Node arka planda calismali (port 3000 - sadece sunucu icinde):"
Write-Host "  cd $physicalPath\deploy"
Write-Host "  .\LOCAL-BASLAT.ps1"
Write-Host ""
Write-Host "Tarayici: http://localhost/  ( :3000 yazma )"
Write-Host ""
& "$PSScriptRoot\Add-ComTr-Bindings.ps1" -ErrorAction SilentlyContinue

Write-Host "ARR yoksa kur: https://www.iis.net/downloads/microsoft/application-request-routing"
Write-Host "veya Web Platform Installer -> URL Rewrite + Application Request Routing"
