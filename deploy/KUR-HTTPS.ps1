#Requires -RunAsAdministrator
<#
  Let's Encrypt HTTPS — IIS site mollayazilim.com
  Kullanim (canli sunucu, Yonetici):
    cd C:\inetpub\wwwroot\mollayazilim
    KUR-HTTPS.cmd
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$wacsDir = Join-Path $PSScriptRoot "simple-acme"
$wacs = Join-Path $wacsDir "wacs.exe"
$wacsZipUrl = "https://github.com/simple-acme/simple-acme/releases/download/v2.3.6/simple-acme.v2.3.6.2257.win-x64.pluggable.zip"
$hosts = "mollayazilim.com,www.mollayazilim.com,mollayazilim.com.tr,www.mollayazilim.com.tr"

function Ensure-Wacs {
  if (Test-Path $wacs) { return $wacs }
  Write-Host "simple-acme indiriliyor..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $wacsDir | Out-Null
  $zip = Join-Path $env:TEMP "simple-acme-win-x64.pluggable.zip"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $wacsZipUrl -OutFile $zip -UseBasicParsing -TimeoutSec 120
  Expand-Archive -Path $zip -DestinationPath $wacsDir -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $wacs)) {
    throw "wacs.exe indirilemedi: $wacs"
  }
  Write-Host "[OK] wacs.exe -> $wacs" -ForegroundColor Green
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

function Test-AcmeChallengePath {
  param([string]$Root, [string]$PublicHost = "mollayazilim.com")

  $dir = Join-Path $Root ".well-known\acme-challenge"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $token = "kur-https-ping"
  $file = Join-Path $dir $token
  "ok" | Set-Content $file -Encoding ASCII -NoNewline

  $urls = @(
    "http://127.0.0.1/.well-known/acme-challenge/$token",
    "http://localhost/.well-known/acme-challenge/$token",
    "http://$PublicHost/.well-known/acme-challenge/$token"
  )

  $ok = $false
  foreach ($url in $urls) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -Headers @{ Host = $PublicHost }
      if ($r.Content.Trim() -eq "ok") {
        Write-Host "[OK] ACME yolu: $url" -ForegroundColor Green
        $ok = $true
        break
      }
    } catch {
      Write-Host "  ACME test: $url -> $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }

  Remove-Item $file -Force -ErrorAction SilentlyContinue
  if (-not $ok) {
    throw "ACME dogrulama yolu calismiyor. Once BASLAT.cmd veya KUR.cmd calistirin."
  }
}

function Add-HttpsRedirectRule {
  param([string]$ConfigPath)

  if (-not (Test-Path $ConfigPath)) { return }
  $xml = Get-Content $ConfigPath -Raw -Encoding UTF8
  if ($xml -match 'name="HttpToHttps"') {
    Write-Host "[OK] HTTP->HTTPS yonlendirme zaten var" -ForegroundColor DarkGray
    return
  }

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
  Write-Host "[OK] HTTP->HTTPS yonlendirme eklendi (localhost haric)" -ForegroundColor Green
}

Write-Host "=== HTTPS kurulumu (Let's Encrypt) ===" -ForegroundColor Cyan
Write-Host "Site: $AppRoot`n"

$httpCode = Test-SiteHttp "http://127.0.0.1/"
if ($httpCode -lt 200 -or $httpCode -ge 400) {
  Write-Host "(HATA) HTTP calismiyor (kod: $httpCode)" -ForegroundColor Red
  Write-Host "  Once: BASLAT.cmd veya KUR.cmd" -ForegroundColor Yellow
  exit 1
}
Write-Host "[OK] HTTP calisiyor ($httpCode)" -ForegroundColor Green

Import-Module WebAdministration -ErrorAction Stop
$site = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if (-not $site) {
  Write-Host "(HATA) IIS sitesi yok: $siteName" -ForegroundColor Red
  exit 1
}
$siteId = $site.Id
Write-Host "[OK] IIS site: $siteName (id=$siteId)" -ForegroundColor Green

& (Join-Path $PSScriptRoot "AC-FIREWALL.ps1")

Test-AcmeChallengePath -Root $AppRoot

$wacsExe = Ensure-Wacs
Write-Host ""
Write-Host "Sertifika aliniyor: $hosts" -ForegroundColor Cyan
Write-Host "(Let's Encrypt http-01 dogrulama - 1-2 dk surebilir)`n"

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

if ($LASTEXITCODE -ne 0) {
  Write-Host "(HATA) Sertifika alinamadi (wacs cikis: $LASTEXITCODE)" -ForegroundColor Red
  Write-Host "  DNS mollayazilim.com bu sunucuya mi bakiyor?" -ForegroundColor Yellow
  Write-Host "  Port 80 disaridan acik mi?" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "443 baglamalari:" -ForegroundColor Cyan
Get-WebBinding -Name $siteName | Where-Object { $_.protocol -eq "https" } |
  Format-Table protocol, bindingInformation -AutoSize

Add-HttpsRedirectRule -ConfigPath (Join-Path $AppRoot "web.config")

Start-Sleep -Seconds 3
try {
  $https = Invoke-WebRequest -Uri "https://mollayazilim.com/" -UseBasicParsing -TimeoutSec 30
  Write-Host "[OK] https://mollayazilim.com/ -> $($https.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "(UYARI) HTTPS test: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "  Bir kac dakika bekleyip tekrar deneyin." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tamam. Site: https://mollayazilim.com/" -ForegroundColor Green
Write-Host "Sertifika otomatik yenilenir (simple-acme gorevi)." -ForegroundColor DarkGray
exit 0
