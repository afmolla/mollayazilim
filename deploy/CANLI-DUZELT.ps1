#Requires -RunAsAdministrator
<#
  Canli sunucu duzeltme: IIS binding + HttpToHttps + PM2 + domain testi.
  YENIDEN-BASLAT sadece Node test ediyordu; domain IIS uzerinden kiriliyordu.
#>
param(
  [switch]$SkipGit,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SiteName = "mollayazilim.com"

function Test-HttpStatus {
  param(
    [string]$Url,
    [int[]]$OkCodes = @(200, 301, 302, 307, 308),
    [int]$TimeoutSec = 20,
    [switch]$NoRedirect
  )

  try {
    if ($NoRedirect) {
      $req = [System.Net.HttpWebRequest]::Create($Url)
      $req.Method = "GET"
      $req.AllowAutoRedirect = $false
      $req.Timeout = $TimeoutSec * 1000
      $resp = $req.GetResponse()
      $code = [int]$resp.StatusCode
      $loc = $resp.Headers["Location"]
      $resp.Close()
      return @{ Ok = ($OkCodes -contains $code); Code = $code; Location = $loc; Error = $null }
    }

    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    return @{ Ok = $true; Code = [int]$r.StatusCode; Location = $null; Error = $null }
  } catch {
    $code = $null
    $loc = $null
    try {
      if ($_.Exception.Response) {
        $code = [int]$_.Exception.Response.StatusCode
        $loc = $_.Exception.Response.Headers["Location"]
      }
    } catch { }
    $ok = $code -and ($OkCodes -contains $code)
    return @{ Ok = [bool]$ok; Code = $code; Location = $loc; Error = $_.Exception.Message }
  }
}

Write-Host ""
Write-Host "=== MOLLA YAZILIM CANLI DUZELT ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] IIS binding + ARR + localhost..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "FIX-LOCALHOST.ps1")
if ($LASTEXITCODE -ne 0) {
  Write-Host "(HATA) IIS duzeltme basarisiz" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "[2/6] HTTPS sertifikasi bagla (varsa)..." -ForegroundColor Yellow
$httpsScript = Join-Path $PSScriptRoot "HTTPS-BAGLA.ps1"
if (Test-Path $httpsScript) {
  & $httpsScript
  if ($LASTEXITCODE -ne 0) {
    Write-Host "(UYARI) HTTPS baglanamadi - HTTP ile devam" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "[3/6] HttpToHttps senkron..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")

Write-Host ""
Write-Host "[4/6] Yerel hosts (canli sunucuda temizlik)..." -ForegroundColor Yellow
function Test-IsProductionServer {
  try {
    $dnsIp = (Resolve-DnsName "mollayazilim.com" -Type A -ErrorAction Stop | Select-Object -First 1).IPAddress
    $publicIp = (Invoke-WebRequest "https://api.ipify.org" -UseBasicParsing -TimeoutSec 8).Content.Trim()
    return ($dnsIp -and $publicIp -and $dnsIp -eq $publicIp)
  } catch {
    return $false
  }
}

if (Test-IsProductionServer) {
  $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
  $active = Get-Content $hostsPath -ErrorAction SilentlyContinue | Where-Object {
    $_ -notmatch '^\s*#' -and $_ -match 'mollayazilim'
  }
  if ($active) {
    Write-Host "  Sunucuda yerel hosts bulundu - kaldiriliyor..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "KALDIR-YEREL-HOSTS.ps1")
  } else {
    Write-Host "  [OK] Canli sunucu - hosts temiz" -ForegroundColor DarkGray
  }
} else {
  & (Join-Path $PSScriptRoot "ENSURE-HOSTS.ps1")
}

Write-Host ""
Write-Host "[5/6] Git + build + PM2..." -ForegroundColor Yellow
$restartArgs = @()
if ($SkipGit) { $restartArgs += "-SkipGit" }
if ($SkipBuild) { $restartArgs += "-SkipBuild" }
& (Join-Path $PSScriptRoot "site-yeniden-baslat.ps1") @restartArgs
$pm2Ok = ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 2)

Write-Host ""
Write-Host "[6/6] Domain saglik kontrolu..." -ForegroundColor Yellow
Import-Module WebAdministration -ErrorAction SilentlyContinue
Start-Website -Name $SiteName -ErrorAction SilentlyContinue

$allOk = $true
$tests = @(
  @{ Label = "localhost"; Url = "http://localhost/" },
  @{ Label = "ambalaj"; Url = "http://localhost/ambalaj" },
  @{ Label = "domain HTTP"; Url = "http://mollayazilim.com/" },
  @{ Label = "domain ambalaj"; Url = "http://mollayazilim.com/ambalaj" }
)

foreach ($t in $tests) {
  $r = Test-HttpStatus -Url $t.Url -NoRedirect
  if ($r.Ok) {
    $extra = if ($r.Location) { " -> $($r.Location)" } else { "" }
    Write-Host "  [OK] $($t.Label) HTTP $($r.Code)$extra" -ForegroundColor Green
    continue
  }

  if ($t.Label -like "domain*" -and $r.Code -eq 301 -and $r.Location -like "https://*") {
    $https = Test-HttpStatus -Url $r.Location
    if ($https.Ok) {
      Write-Host "  [OK] $($t.Label) -> HTTPS $($https.Code)" -ForegroundColor Green
      continue
    }
    Write-Host "  [HATA] $($t.Label) HTTPS yonlendirme kirik -> $($https.Error)" -ForegroundColor Red
    Write-Host "         HttpToHttps kaldiriliyor..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")
    Start-Sleep -Seconds 2
    $retry = Test-HttpStatus -Url $t.Url -NoRedirect
    if ($retry.Ok -or $retry.Code -eq 200) {
      Write-Host "  [OK] $($t.Label) duzeltildi -> HTTP $($retry.Code)" -ForegroundColor Green
      continue
    }
  }

  $detail = if ($r.Code) { "HTTP $($r.Code)" } else { $r.Error }
  Write-Host "  [HATA] $($t.Label) - $detail" -ForegroundColor Red
  $allOk = $false
}

$httpsBinding = Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue |
  Where-Object { $_.protocol -eq "https" }
if ($httpsBinding) {
  $h = Test-HttpStatus -Url "https://mollayazilim.com/"
  if ($h.Ok) {
    Write-Host "  [OK] https://mollayazilim.com/ -> $($h.Code)" -ForegroundColor Green
  } else {
    Write-Host "  [UYARI] https://mollayazilim.com/ -> $($h.Error)" -ForegroundColor Yellow
  }
}

Write-Host ""
if ($allOk -and $pm2Ok) {
  Write-Host "SONUC: Site calisiyor" -ForegroundColor Green
  Write-Host "  http://mollayazilim.com/" -ForegroundColor Green
  Write-Host "  http://mollayazilim.com/ambalaj" -ForegroundColor Green
  exit 0
}

Write-Host "SONUC: Sorun var - CANLI-KONTROL.ps1 calistirin" -ForegroundColor Red
exit 1
