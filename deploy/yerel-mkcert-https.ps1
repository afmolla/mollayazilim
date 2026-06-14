#Requires -RunAsAdministrator
<#
  Yerel gelistirme (DNS baska sunucuya gidiyorsa): mkcert ile Chrome guvenilir HTTPS.
  hosts: mollayazilim.com -> 127.0.0.1 ile calisir.
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$hostList = @(
  "mollayazilim.com",
  "www.mollayazilim.com",
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)
$mkcertDir = Join-Path $PSScriptRoot "mkcert"
$mkcert = Join-Path $mkcertDir "mkcert.exe"
$mkcertUrl = "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe"
$certDir = Join-Path $AppRoot "deploy\certs"
$pfxPath = Join-Path $certDir "mollayazilim-local.pfx"
$pfxPass = "mollayazilim-local"

function Ensure-Mkcert {
  if (Test-Path $mkcert) { return $mkcert }
  Write-Host "mkcert indiriliyor..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $mkcertDir | Out-Null
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $mkcertUrl -OutFile $mkcert -UseBasicParsing -TimeoutSec 120
  if (-not (Test-Path $mkcert)) { throw "mkcert indirilemedi" }
  Write-Host "[OK] mkcert -> $mkcert" -ForegroundColor Green
  return $mkcert
}

function Install-IisHttpsBindings {
  param(
    [string]$SiteName,
    [string[]]$HostHeaders,
    [System.Security.Cryptography.X509Certificates.X509Certificate2]$Cert
  )
  Import-Module WebAdministration -ErrorAction Stop
  $thumb = $Cert.Thumbprint
  $iisAppId = "{4dc3e181-e14b-4a21-b982-7cc71b20b5a4}"
  $storeName = if (Get-ChildItem "Cert:\LocalMachine\WebHosting\$thumb" -ErrorAction SilentlyContinue) { "WebHosting" } else { "My" }

  foreach ($hh in $HostHeaders) {
    $info = "*:443:$hh"
    $has = Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue |
      Where-Object { $_.protocol -eq "https" -and $_.bindingInformation -eq $info }
    if (-not $has) {
      New-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $hh | Out-Null
      Write-Host "  + binding $info" -ForegroundColor Green
    }
    try {
      $b = Get-WebBinding -Name $SiteName -Protocol https -HostHeader $hh -ErrorAction Stop
      $b.AddSslCertificate($thumb, $storeName)
      Write-Host "  [OK] SSL: $hh" -ForegroundColor Green
    } catch {
      $hp = "0.0.0.0:443:$hh"
      & netsh http delete sslcert hostnameport=$hp 2>$null | Out-Null
      & netsh http add sslcert hostnameport=$hp certhash=$thumb appid=$iisAppId certstorename=$storeName | Out-Null
      Write-Host "  [OK] netsh SSL: $hh" -ForegroundColor Green
    }
  }
}

Set-Location $AppRoot
Write-Host "=== Yerel HTTPS (mkcert) ===" -ForegroundColor Cyan
Write-Host "Not: DNS baska sunucuya gidiyorsa Let's Encrypt http-01 yerel IIS'te calismaz." -ForegroundColor DarkYellow
Write-Host "Bu script yerel gelistirme icin guvenilir sertifika uretir.`n" -ForegroundColor DarkYellow

$mk = Ensure-Mkcert
& $mk -install 2>&1 | Out-Host

New-Item -ItemType Directory -Force -Path $certDir | Out-Null
$names = ($hostList -join " ")
Push-Location $certDir
& $mk -pkcs12 -p12file $pfxPath -p12password $pfxPass $names 2>&1 | Out-Host
Pop-Location

if (-not (Test-Path $pfxPath)) { throw "PFX olusturulamadi: $pfxPath" }

$secure = ConvertTo-SecureString -String $pfxPass -Force -AsPlainText
$imported = Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation Cert:\LocalMachine\WebHosting -Password $secure -Exportable
Write-Host "[OK] Sertifika: $($imported.Subject)" -ForegroundColor Green
Write-Host "     Thumbprint: $($imported.Thumbprint)" -ForegroundColor DarkGray

Install-IisHttpsBindings -SiteName $siteName -HostHeaders $hostList -Cert $imported

Start-Sleep -Seconds 2
try {
  # hosts aciksa mollayazilim.com -> 127.0.0.1 uzerinden dogrula
  $r = Invoke-WebRequest -Uri "https://mollayazilim.com/" -UseBasicParsing -TimeoutSec 20
  Write-Host "[OK] https://mollayazilim.com/ -> $($r.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "(UYARI) HTTPS test: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "  hosts dosyasinda 127.0.0.1 mollayazilim.com olmali (BASLAT.cmd ekler)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tamam. Chrome artik yerel sertifikaya guvenmeli (mkcert CA yuklu)." -ForegroundColor Green
exit 0
