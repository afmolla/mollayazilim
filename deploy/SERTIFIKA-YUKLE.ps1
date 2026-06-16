#Requires -RunAsAdministrator
<#
  Tek is: Let's Encrypt sertifikasi al + IIS :443'e bagla.
  HTTP zaten calisiyorsa bunu calistir.
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $AppRoot

Write-Host ""
Write-Host "=== SERTIFIKA AL + IIS YUKLE ===" -ForegroundColor Cyan
Write-Host ""

& (Join-Path $PSScriptRoot "Ensure-SiteAyakta.ps1")
if ($LASTEXITCODE -ne 0) { exit 1 }

& (Join-Path $PSScriptRoot "KUR-HTTPS.ps1")
exit $LASTEXITCODE
