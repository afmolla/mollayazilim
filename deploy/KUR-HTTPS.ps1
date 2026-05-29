#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$wacs = Join-Path $PSScriptRoot "simple-acme\wacs.exe"
if (-not (Test-Path $wacs)) {
  throw "wacs.exe yok: $wacs"
}

Import-Module WebAdministration -ErrorAction Stop
$siteName = "mollayazilim.com"
$siteId = (Get-Website -Name $siteName).Id
Write-Host "IIS site: $siteName (id=$siteId)"

New-Item -ItemType Directory -Force -Path (Join-Path $AppRoot ".well-known\acme-challenge") | Out-Null
& (Join-Path $PSScriptRoot "AC-FIREWALL.ps1")

$hosts = "mollayazilim.com,www.mollayazilim.com,mollayazilim.com.tr,www.mollayazilim.com.tr"
Write-Host "Sertifika: $hosts"

& $wacs `
  --source manual `
  --host $hosts `
  --validation filesystem `
  --webroot $AppRoot `
  --installation iis `
  --installationsiteid $siteId `
  --accepttos `
  --emailaddress "info@mollayazilim.com" `
  --friendlyname "mollayazilim.com"

if ($LASTEXITCODE -ne 0) { throw "wacs failed: $LASTEXITCODE" }
Write-Host "OK https://mollayazilim.com/"
