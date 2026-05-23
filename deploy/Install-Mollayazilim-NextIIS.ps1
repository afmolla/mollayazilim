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
    Write-Host "Bağlama eklendi: http://$www/"
  } catch {
    Write-Host "www bağlaması atlandı:" $_
  }
}

Write-Host ""
Write-Host "Sonraki adımlar:"
Write-Host "  1) .env.production.local (NEXT_PUBLIC_SITE_URL=https://mollayazilim.com)"
Write-Host "  2) npm ci && npm run build"
Write-Host "  3) pm2 start npm --name mollayazilim -- start   (port 3000)"
Write-Host "  4) HTTPS binding + sertifika (IIS veya win-acme)"
Write-Host "Test (Next ayaktayken): http://$hostHeader/"
