#Requires -RunAsAdministrator
<#
  Mevcut Let's Encrypt sertifikasini IIS :443'e bagla.
  Sertifika zaten varsa (KUR-HTTPS yarisinda kaldiysa) bunu calistir.
#>
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "KUR-HTTPS.ps1") 2>$null

# Dot-sourcing loads all functions - re-define minimal set to avoid running main script
# Use direct call instead

$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$hostList = @(
  "mollayazilim.com",
  "www.mollayazilim.com",
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)

Write-Host "=== HTTPS IIS baglama ===" -ForegroundColor Cyan

# Load functions from KUR-HTTPS by parsing - simpler: inline minimal

function Get-MollaCertificate {
  $stores = @("Cert:\LocalMachine\WebHosting", "Cert:\LocalMachine\My")
  foreach ($store in $stores) {
    $cert = Get-ChildItem -Path $store -ErrorAction SilentlyContinue |
      Where-Object {
        $_.HasPrivateKey -and (
          $_.FriendlyName -eq "mollayazilim.com" -or
          $_.Subject -match "mollayazilim\.com"
        )
      } |
      Sort-Object NotAfter -Descending |
      Select-Object -First 1
    if ($cert) { return $cert }
  }
  return $null
}

function Install-IisHttpsBindings {
  param(
    [string]$SiteName,
    [string[]]$HostHeaders,
    $Cert
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
      Write-Host "  + $info" -ForegroundColor Green
    }
    try {
      $b = Get-WebBinding -Name $SiteName -Protocol https -HostHeader $hh -ErrorAction Stop
      $b.AddSslCertificate($thumb, $storeName)
      Write-Host "  [OK] $hh" -ForegroundColor Green
    } catch {
      $hp = "0.0.0.0:443:$hh"
      & netsh http delete sslcert hostnameport=$hp 2>$null | Out-Null
      & netsh http add sslcert hostnameport=$hp certhash=$thumb appid=$iisAppId certstorename=$storeName | Out-Null
      Write-Host "  [OK] netsh $hh" -ForegroundColor Green
    }
  }
}

function Add-HttpsRedirectRule {
  param([string]$ConfigPath)
  if (-not (Test-Path $ConfigPath)) { return }
  $xml = Get-Content $ConfigPath -Raw -Encoding UTF8
  if ($xml -match 'name="HttpToHttps"') { return }
  $rule = @'
        <rule name="HttpToHttps" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{HTTPS}" pattern="off" ignoreCase="true" />
            <add input="{HTTP_HOST}" pattern="^localhost$" negate="true" />
            <add input="{HTTP_HOST}" pattern="^127\.0\.0\.1$" negate="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
'@
  $xml = $xml -replace '(<rules>\s*)', "`$1`n$rule"
  Set-Content $ConfigPath $xml -Encoding UTF8
  Write-Host "[OK] HTTP->HTTPS yonlendirme eklendi" -ForegroundColor Green
}

$cert = Get-MollaCertificate
if (-not $cert) {
  Write-Host "(HATA) Sertifika bulunamadi - once KUR-HTTPS.cmd" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Sertifika: $($cert.Subject)" -ForegroundColor Green

Install-IisHttpsBindings -SiteName $siteName -HostHeaders $hostList -Cert $cert

Start-Sleep -Seconds 2
try {
  $r = Invoke-WebRequest "https://mollayazilim.com/" -UseBasicParsing -TimeoutSec 25
  Write-Host "[OK] https://mollayazilim.com/ -> $($r.StatusCode)" -ForegroundColor Green
  Add-HttpsRedirectRule -ConfigPath (Join-Path $AppRoot "web.config")
} catch {
  Write-Host "(HATA) HTTPS test: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Tamam: https://mollayazilim.com/" -ForegroundColor Green
exit 0
