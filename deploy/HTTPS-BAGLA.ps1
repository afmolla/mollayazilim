#Requires -RunAsAdministrator
<#
  Mevcut Let's Encrypt sertifikasini IIS :443'e bagla (sadece mollayazilim.com hostlari).
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
. (Join-Path $PSScriptRoot "SSL-MOLLA.ps1")

Write-Host "=== HTTPS IIS baglama (mollayazilim.com) ===" -ForegroundColor Cyan

$cert = Get-MollaCertificate
if (-not $cert) {
  Write-Host "(HATA) Sertifika bulunamadi - once SERTIFIKA-YUKLE.cmd" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Sertifika: $($cert.Subject)" -ForegroundColor Green

Install-MollaHttpsBindings -Cert $cert

Start-Sleep -Seconds 2
if (Test-MollaSslCert) {
  Write-Host "[OK] https://mollayazilim.com/ TLS guvenilir" -ForegroundColor Green
  $cfg = Join-Path $AppRoot "web.config"
  if (Test-Path $cfg) {
    $xml = Get-Content $cfg -Raw -Encoding UTF8
    if ($xml -notmatch 'name="HttpToHttps"') {
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
      Set-Content $cfg $xml -Encoding UTF8
      Write-Host "[OK] HTTP->HTTPS yonlendirme eklendi" -ForegroundColor Green
    }
  }
  Write-Host ""
  Write-Host "Tamam: https://mollayazilim.com/" -ForegroundColor Green
  exit 0
}

Write-Host "(HATA) TLS test basarisiz" -ForegroundColor Red
exit 1
