#Requires -RunAsAdministrator
<#
  Let's Encrypt HTTPS — IIS site mollayazilim.com
  Kullanim: KUR.cmd adim 5 (Yonetici) veya deploy\KUR-HTTPS.ps1
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$siteName = "mollayazilim.com"
$wacsDir = Join-Path $PSScriptRoot "simple-acme"
$wacs = Join-Path $wacsDir "wacs.exe"
$wacsZipUrl = "https://github.com/simple-acme/simple-acme/releases/download/v2.3.6/simple-acme.v2.3.6.2257.win-x64.pluggable.zip"
$hosts = "mollayazilim.com,www.mollayazilim.com,mollayazilim.com.tr,www.mollayazilim.com.tr"

function Remove-BadMollaCerts {
  $stores = @("Cert:\LocalMachine\WebHosting", "Cert:\LocalMachine\My")
  $removed = 0
  foreach ($store in $stores) {
    Get-ChildItem $store -ErrorAction SilentlyContinue | Where-Object {
      $_.Subject -match "mollayazilim\.com" -and (
        $_.Issuer -match "YR1|Root YR" -or $_.Issuer -eq $_.Subject
      )
    } | ForEach-Object {
      Write-Host "  - Sahte sertifika kaldiriliyor: $($_.Subject)" -ForegroundColor Yellow
      Remove-Item $_.PSPath -Force
      $removed++
    }
  }
  if ($removed -gt 0) {
    Write-Host "[OK] $removed sahte sertifika temizlendi" -ForegroundColor Green
  }
}

function Test-IsProductionServer {
  try {
    $dnsIp = (Resolve-DnsName "mollayazilim.com" -Type A -ErrorAction Stop | Select-Object -First 1).IPAddress
    $publicIp = (Invoke-WebRequest "https://api.ipify.org" -UseBasicParsing -TimeoutSec 10).Content.Trim()
    return ($dnsIp -and $publicIp -and $dnsIp -eq $publicIp)
  } catch {
    return $false
  }
}

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

function Get-AcmeWebroot {
  param([string]$Root)
  return Join-Path $Root "public"
}

function Test-AcmeChallengePath {
  param([string]$Root, [string]$PublicHost = "mollayazilim.com")

  $token = "kur-https-ping"
  $dirs = @(
    (Join-Path $Root ".well-known\acme-challenge"),
    (Join-Path $Root "public\.well-known\acme-challenge")
  )
  foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    "ok" | Set-Content (Join-Path $dir $token) -Encoding ASCII -NoNewline
  }

  $tests = @(
    @{ Url = "http://127.0.0.1/.well-known/acme-challenge/$token"; Host = "127.0.0.1" },
    @{ Url = "http://127.0.0.1/.well-known/acme-challenge/$token"; Host = $PublicHost },
    @{ Url = "http://localhost/.well-known/acme-challenge/$token"; Host = "localhost" },
    @{ Url = "http://$PublicHost/.well-known/acme-challenge/$token"; Host = $PublicHost }
  )

  $ok = $false
  foreach ($t in $tests) {
    try {
      $r = Invoke-WebRequest -Uri $t.Url -UseBasicParsing -TimeoutSec 15 -Headers @{ Host = $t.Host }
      if ($r.Content.Trim() -eq "ok") {
        Write-Host "[OK] ACME yolu: $($t.Url) (Host: $($t.Host))" -ForegroundColor Green
        $ok = $true
        break
      }
      Write-Host "  ACME test: $($t.Url) -> beklenen 'ok', gelen '$($r.Content.Trim())'" -ForegroundColor DarkYellow
    } catch {
      Write-Host "  ACME test: $($t.Url) (Host: $($t.Host)) -> $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }

  foreach ($dir in $dirs) {
    Remove-Item (Join-Path $dir $token) -Force -ErrorAction SilentlyContinue
  }
  if (-not $ok) {
    throw "ACME dogrulama yolu calismiyor. web.config guncel mi? pm2 restart mollayazilim"
  }
}

function Get-MollaCertificate {
  $stores = @("Cert:\LocalMachine\WebHosting", "Cert:\LocalMachine\My")
  foreach ($store in $stores) {
    $cert = Get-ChildItem -Path $store -ErrorAction SilentlyContinue |
      Where-Object {
        $_.HasPrivateKey -and (
          $_.FriendlyName -eq "mollayazilim.com" -or
          $_.Subject -match "mollayazilim\.com"
        ) -and $_.Issuer -notmatch "CN=mollayazilim\.com"
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
    [System.Security.Cryptography.X509Certificates.X509Certificate2]$Cert
  )

  Import-Module WebAdministration -ErrorAction Stop
  $thumb = $Cert.Thumbprint
  $iisAppId = "{4dc3e181-e14b-4a21-b982-7cc71b20b5a4}"

  $storeName = "WebHosting"
  if (-not (Get-ChildItem "Cert:\LocalMachine\WebHosting\$thumb" -ErrorAction SilentlyContinue)) {
    $storeName = "My"
  }

  Write-Host "IIS HTTPS binding kuruluyor (store: $storeName)..." -ForegroundColor Cyan

  foreach ($hh in $HostHeaders) {
    $info = "*:443:$hh"
    $has = Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue |
      Where-Object { $_.protocol -eq "https" -and $_.bindingInformation -eq $info }

    if (-not $has) {
      New-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $hh | Out-Null
      Write-Host "  + binding $info" -ForegroundColor Green
    }

    $bound = $false
    try {
      $binding = Get-WebBinding -Name $SiteName -Protocol https -HostHeader $hh -ErrorAction Stop
      $binding.AddSslCertificate($thumb, $storeName)
      $bound = $true
      Write-Host "  [OK] SSL: $hh" -ForegroundColor Green
    } catch {
      Write-Host "  AddSslCertificate atlandi ($hh): $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    if (-not $bound) {
      $hp = "0.0.0.0:443:$hh"
      & netsh http delete sslcert hostnameport=$hp 2>$null | Out-Null
      $out = & netsh http add sslcert hostnameport=$hp certhash=$thumb appid=$iisAppId certstorename=$storeName 2>&1
      if ($LASTEXITCODE -ne 0) {
        Write-Host "  (HATA) netsh $hh : $out" -ForegroundColor Red
        return $false
      }
      Write-Host "  [OK] netsh SSL: $hh" -ForegroundColor Green
    }
  }
  return $true
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

Remove-BadMollaCerts

if (-not (Test-IsProductionServer)) {
  try {
    $dnsIp = (Resolve-DnsName "mollayazilim.com" -Type A -ErrorAction Stop | Select-Object -First 1).IPAddress
    $publicIp = (Invoke-WebRequest "https://api.ipify.org" -UseBasicParsing -TimeoutSec 10).Content.Trim()
    Write-Host "(HATA) mollayazilim.com DNS bu makineye gitmiyor." -ForegroundColor Red
    Write-Host "  DNS IP   : $dnsIp" -ForegroundColor Yellow
    Write-Host "  Bu makine: $publicIp" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Let's Encrypt http-01 dogrulamasi internetten $dnsIp adresine gider." -ForegroundColor Yellow
    Write-Host "Yerel IIS icin secenekler:" -ForegroundColor Cyan
    Write-Host "  1) DNS A kaydini bu makinenin IP'sine al, firewall 80/443 ac, KUR.cmd tekrar calistirin" -ForegroundColor White
    Write-Host "  2) Yerel gelistirme: KUR.cmd mkcert adimini otomatik dener" -ForegroundColor White
    exit 2
  } catch {
    Write-Host "(HATA) DNS kontrolu basarisiz: $($_.Exception.Message)" -ForegroundColor Red
    exit 2
  }
}

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

$acmeWebroot = Get-AcmeWebroot -Root $AppRoot
New-Item -ItemType Directory -Force -Path (Join-Path $acmeWebroot ".well-known\acme-challenge") | Out-Null
Write-Host "[OK] ACME webroot: $acmeWebroot" -ForegroundColor Green

$hostList = $hosts -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }

& $wacsExe `
  --source manual `
  --host $hosts `
  --validation filesystem `
  --webroot $acmeWebroot `
  --store certificatestore `
  --storename WebHosting `
  --installation iis `
  --installationsiteid $siteId `
  --accepttos `
  --emailaddress "info@mollayazilim.com" `
  --friendlyname "mollayazilim.com"

if ($LASTEXITCODE -ne 0) {
  Write-Host "(HATA) Sertifika alinamadi (wacs cikis: $LASTEXITCODE)" -ForegroundColor Red
  exit 1
}

$cert = Get-MollaCertificate
if (-not $cert) {
  Write-Host "(HATA) Sertifika store'da bulunamadi" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Sertifika: $($cert.Subject)" -ForegroundColor Green
Write-Host "     Thumbprint: $($cert.Thumbprint)" -ForegroundColor DarkGray

$httpsBindings = @(Get-WebBinding -Name $siteName -ErrorAction SilentlyContinue | Where-Object { $_.protocol -eq "https" })
if ($httpsBindings.Count -eq 0) {
  Write-Host "wacs IIS binding atlandi - elle baglaniyor..." -ForegroundColor Yellow
  & $wacsExe --install --installation iis --installationsiteid $siteId 2>&1 | Out-Host
  $httpsBindings = @(Get-WebBinding -Name $siteName -ErrorAction SilentlyContinue | Where-Object { $_.protocol -eq "https" })
}

if ($httpsBindings.Count -eq 0) {
  if (-not (Install-IisHttpsBindings -SiteName $siteName -HostHeaders $hostList -Cert $cert)) {
    Write-Host "(HATA) IIS HTTPS binding kurulamadi" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "443 baglamalari:" -ForegroundColor Cyan
Get-WebBinding -Name $siteName | Where-Object { $_.protocol -eq "https" } |
  Format-Table protocol, bindingInformation -AutoSize

Start-Sleep -Seconds 3
$httpsOk = $false
try {
  $https = Invoke-WebRequest -Uri "https://mollayazilim.com/" -UseBasicParsing -TimeoutSec 30
  Write-Host "[OK] https://mollayazilim.com/ -> $($https.StatusCode)" -ForegroundColor Green
  $httpsOk = $true
} catch {
  Write-Host "(HATA) HTTPS test: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  HTTP->HTTPS yonlendirme EKLENMEDI (site kirilmasin diye)" -ForegroundColor Yellow
  exit 1
}

if ($httpsOk) {
  Add-HttpsRedirectRule -ConfigPath (Join-Path $AppRoot "web.config")
}

Write-Host ""
Write-Host "Tamam. Site: https://mollayazilim.com/" -ForegroundColor Green
Write-Host "Sertifika otomatik yenilenir (simple-acme gorevi)." -ForegroundColor DarkGray
exit 0
