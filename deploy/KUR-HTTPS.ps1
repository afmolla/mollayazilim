#Requires -RunAsAdministrator
<#
  Let's Encrypt HTTPS — IIS site mollayazilim.com
  Kullanim (VPS/RDP, Yonetici):
    cd C:\inetpub\wwwroot\mollayazilim
    .\KUR-HTTPS.cmd
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$wacsDir = Join-Path $PSScriptRoot "simple-acme"
$wacs = Join-Path $wacsDir "wacs.exe"
$wacsZipUrl = "https://github.com/simple-acme/simple-acme/releases/download/v2.3.6/simple-acme.v2.3.6.2257.win-x64.pluggable.zip"

function Ensure-Wacs {
  if (Test-Path $wacs) { return $wacs }
  Write-Host "simple-acme indiriliyor..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $wacsDir | Out-Null
  $zip = Join-Path $env:TEMP "simple-acme-win-x64.pluggable.zip"
  Invoke-WebRequest -Uri $wacsZipUrl -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath $wacsDir -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $wacs)) {
    throw "wacs.exe indirilemedi: $wacs"
  }
  Write-Host "OK wacs.exe -> $wacs" -ForegroundColor Green
  return $wacs
}

function Test-SiteHttp {
  param([string]$Url)
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 0
    return [int]$r.StatusCode
  } catch {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return 0
  }
}

Write-Host "=== HTTPS kurulumu (Let's Encrypt) ===" -ForegroundColor Cyan
Write-Host "Site kok: $AppRoot"

$httpCode = Test-SiteHttp "http://127.0.0.1/"
if ($httpCode -lt 200 -or $httpCode -ge 400) {
  Write-Host "UYARI: localhost HTTP $httpCode — once Node + IIS calistir:" -ForegroundColor Yellow
  Write-Host "  cd $AppRoot && BASLAT.cmd duzelt"
  throw "HTTP calismadan HTTPS sertifikasi alinamaz."
}

Import-Module WebAdministration -ErrorAction Stop
$site = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if (-not $site) {
  throw "IIS sitesi yok: $siteName — once deploy\Install-Mollayazilim-NextIIS.ps1"
}
$siteId = $site.Id
Write-Host "IIS site: $siteName (id=$siteId)"

New-Item -ItemType Directory -Force -Path (Join-Path $AppRoot ".well-known\acme-challenge") | Out-Null
& (Join-Path $PSScriptRoot "AC-FIREWALL.ps1")

$wacsExe = Ensure-Wacs
$hosts = "mollayazilim.com,www.mollayazilim.com,mollayazilim.com.tr,www.mollayazilim.com.tr"
Write-Host "Sertifika aliniyor: $hosts" -ForegroundColor Cyan

& $wacsExe `
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

Write-Host ""
Write-Host "443 baglamasi:" -ForegroundColor Cyan
Get-WebBinding -Name $siteName | Where-Object { $_.protocol -eq "https" } | Format-Table protocol, bindingInformation -AutoSize

Start-Sleep -Seconds 2
try {
  $https = Invoke-WebRequest -Uri "https://mollayazilim.com/" -UseBasicParsing -TimeoutSec 25
  Write-Host "OK https://mollayazilim.com/ -> $($https.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "HTTPS test: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "DNS ve hosting panelinde 443 acik mi kontrol et." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tamam. Tarayici: https://mollayazilim.com/" -ForegroundColor Green
