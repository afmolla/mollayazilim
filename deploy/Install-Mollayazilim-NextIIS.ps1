#Requires -RunAsAdministrator
<#
  mollayazilim.com — tam site (Next.js + IIS reverse proxy).
  IIS kökü: C:\inetpub\wwwroot\mollayazilim (web.config → 127.0.0.1:3000)

  Önkoşul: URL Rewrite + ARR, ARR "Enable proxy" = true
  (KUAFOR-IIS-KURULUM.md)

  Kullanım (PowerShell Yönetici):
    cd C:\inetpub\wwwroot\mollayazilim\deploy
    .\Install-Mollayazilim-NextIIS.ps1
#>

$ErrorActionPreference = "Stop"
Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$poolName = "MollayazilimPool"
$physicalPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$hostHeader = "mollayazilim.com"

if (-not (Test-Path (Join-Path $physicalPath "web.config"))) {
  Write-Error "web.config bulunamadı: $physicalPath"
}

if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
  New-WebAppPool -Name $poolName
}

Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$poolName" -Name processModel.identityType -Value ApplicationPoolIdentity
$pool = Get-WebAppPoolState -Name $poolName -ErrorAction SilentlyContinue
if ($pool.Value -eq "Stopped") { Start-WebAppPool -Name $poolName } else { Restart-WebAppPool -Name $poolName }

$existing = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if (-not $existing) {
  New-Website -Name $siteName -PhysicalPath $physicalPath -ApplicationPool $poolName -Port 80 -HostHeader $hostHeader
  Write-Host "Site oluşturuldu: $siteName -> $physicalPath"
} else {
  Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $physicalPath
  Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $poolName
  Write-Host "Site güncellendi: $siteName -> $physicalPath"
}

$www = "www.mollayazilim.com"
$hasWww = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -like "*${www}*" }
if (-not $hasWww) {
  try {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $www
    Write-Host "Baglama: http://$www/"
  } catch {
    Write-Host "www baglamasi atlandi:" $_
  }
}

$localhost = "localhost"
$hasLocal = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -like "*:${localhost}*" }
if (-not $hasLocal) {
  try {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $localhost
    Write-Host "Baglama: http://localhost/  (port 80, :3000 yok)"
  } catch {
    Write-Host "localhost baglamasi atlandi:" $_
  }
}

foreach ($extra in @("mollayazilim.com.tr", "www.mollayazilim.com.tr")) {
  $has = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -like "*:$extra" }
  if (-not $has) {
    try {
      New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $extra
      Write-Host "Baglama: http://$extra/"
    } catch {
      Write-Host "$extra baglamasi atlandi:" $_
    }
  }
}

Write-Host ""
Write-Host "Sonraki adimlar:"
Write-Host "  1) .env.production.local (NEXT_PUBLIC_SITE_URL=https://mollayazilim.com)"
Write-Host "  2) deploy\LOCAL-BASLAT.ps1  (Node arka plan + test)"
Write-Host "  3) HTTPS binding + sertifika (IIS veya win-acme)"
Write-Host ""
Write-Host "Tarayici: http://localhost/  veya  http://$hostHeader/"
Write-Host "Not: Node 127.0.0.1:3000 sadece IIS icin; disariya acmayin."
