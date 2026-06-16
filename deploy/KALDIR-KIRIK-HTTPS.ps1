#Requires -RunAsAdministrator
<#
  Kirik / eski SSL baglantilarini temizle (ERR_CONNECTION_RESET onler).
  Port 443 acik ama sertifika bozuksa tarayici "connection reset" verir.
#>
$ErrorActionPreference = "Continue"
$SiteName = "mollayazilim.com"
$hostList = @(
  "mollayazilim.com",
  "www.mollayazilim.com",
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)

Write-Host "=== Kirik HTTPS temizligi ===" -ForegroundColor Cyan

Import-Module WebAdministration -ErrorAction Stop

Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue |
  Where-Object { $_.protocol -eq "https" } |
  ForEach-Object {
    Remove-WebBinding -Name $SiteName -Protocol https -BindingInformation $_.bindingInformation -ErrorAction SilentlyContinue
    Write-Host "  - IIS https: $($_.bindingInformation)" -ForegroundColor Yellow
  }

foreach ($hh in $hostList) {
  foreach ($prefix in @("0.0.0.0", "::")) {
    $hp = "${prefix}:443:$hh"
    cmd /c "netsh http delete sslcert hostnameport=$hp" 2>$null | Out-Null
  }
}

$kaldirRedirect = Join-Path $PSScriptRoot "KALDIR-HTTPS-YONLENDIRME.ps1"
if (Test-Path $kaldirRedirect) {
  & $kaldirRedirect
}

Write-Host "[OK] Kirik HTTPS kaldirildi - HTTP calismali" -ForegroundColor Green
exit 0
