#Requires -RunAsAdministrator
<#
  mollayazilim.com.tr + www -> ayni IIS sitesi (mollayazilim.com)

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\Add-ComTr-Bindings.ps1
#>
$ErrorActionPreference = "Stop"
Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$domains = @(
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)

if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
  Write-Error "Once: .\Install-Mollayazilim-NextIIS.ps1"
}

foreach ($domain in $domains) {
  $exists = Get-WebBinding -Name $siteName | Where-Object { $_.bindingInformation -eq "*:80:$domain" }
  if ($exists) {
    Write-Host "Zaten var: http://$domain/" -ForegroundColor DarkGray
  } else {
    New-WebBinding -Name $siteName -Protocol http -Port 80 -HostHeader $domain
    Write-Host "Eklendi: http://$domain/" -ForegroundColor Green
  }
}

# ARR proxy (varsa)
$appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
if (Test-Path $appcmd) {
  & $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost 2>$null
}

Start-Website -Name $siteName -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "DNS (alan adi panelinde) - sunucu IP:" -ForegroundColor Cyan
try {
  $ip = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 8).Content.Trim()
  Write-Host ('  A    @  -> ' + $ip)
  Write-Host ('  A    www -> ' + $ip + '   (veya CNAME www -> mollayazilim.com.tr)')
} catch {
  Write-Host "  A kayitlarini bu sunucunun dis IP adresine yonlendir."
}

Write-Host ""
Write-Host "Sonra: .\LOCAL-BASLAT.ps1"
Write-Host "Test: http://mollayazilim.com.tr/  http://www.mollayazilim.com.tr/"
