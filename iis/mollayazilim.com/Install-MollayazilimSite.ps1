#Requires -RunAsAdministrator
<#
  IIS'te mollayazilim.com için site oluşturur (HTTP :80).
  Klasör: bu script ile aynı dizin (index.html + web.config).

  Kullanım (PowerShell Yönetici):
    cd C:\inetpub\wwwroot\kuafor\iis\mollayazilim.com
    .\Install-MollayazilimSite.ps1

  HTTPS: IIS → Siteler → mollayazilim.com → Bağlamalar → Site bağlaması ekle → https, sertifika seçin.
  veya win-acme / Let's Encrypt ile sertifika kurup bağlayın.
#>

$ErrorActionPreference = "Stop"

Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$poolName = "MollayazilimYapimPool"
$physicalPath = $PSScriptRoot
$hostHeader = "mollayazilim.com"

if (-not (Test-Path (Join-Path $physicalPath "index.html"))) {
  Write-Error "index.html bulunamadı: $physicalPath"
}

if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
  New-WebAppPool -Name $poolName
}

Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$poolName" -Name processModel.identityType -Value ApplicationPoolIdentity
Restart-WebAppPool -Name $poolName

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
    Write-Host "www bağlaması atlandı (zaten olabilir):" $_
  }
}

Write-Host ""
Write-Host "Tamam. DNS A kaydını sunucu IP'sine yönlendirin."
Write-Host "HTTPS için IIS'te bağlama ve sertifika ekleyin."
Write-Host "Test: http://$hostHeader/ (hosts dosyası ile önizleme yapılabilir)"
