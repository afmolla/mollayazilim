#Requires -Version 5.1
$ErrorActionPreference = "Continue"

Write-Host "=== MOLLA YAZILIM CANLI KONTROL ===" -ForegroundColor Cyan

try {
  $dns = (Resolve-DnsName mollayazilim.com -Type A -DnsOnly -ErrorAction Stop | Select-Object -First 1).IPAddress
  Write-Host "DNS: mollayazilim.com -> $dns"
} catch {
  Write-Host "DNS HATA: $($_.Exception.Message)" -ForegroundColor Red
  $dns = "?"
}

try {
  $myIp = (Invoke-WebRequest "https://api.ipify.org" -UseBasicParsing -TimeoutSec 8).Content.Trim()
  Write-Host "Bu sunucu dis IP: $myIp"
  if ($dns -eq $myIp) { Write-Host "[OK] Bu makine CANLI sunucu" -ForegroundColor Green }
  else { Write-Host "[INFO] Bu makine canli sunucu degil (gelistirme PC?)" -ForegroundColor Yellow }
} catch {
  Write-Host "Dis IP alinamadi"
  $myIp = "?"
}

$hostsHit = Select-String -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Pattern 'mollayazilim' -ErrorAction SilentlyContinue
if ($hostsHit) {
  Write-Host "[UYARI] hosts dosyasi mollayazilim.com'u yonlendiriyor:" -ForegroundColor Yellow
  $hostsHit | ForEach-Object { Write-Host "  $($_.Line)" }
  Write-Host "  Gercek siteyi gormek icin: YEREL-HOSTS-KALDIR.cmd" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "--- Servisler ---" -ForegroundColor Cyan
Get-Service W3SVC -ErrorAction SilentlyContinue | Select Name,Status | Format-Table -AutoSize
pm2 list 2>$null
Get-NetTCPConnection -LocalPort 80,443,3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress,LocalPort,OwningProcess | Format-Table -AutoSize

$config = Join-Path (Split-Path $PSScriptRoot -Parent) "web.config"
if (Test-Path $config) {
  $wc = Get-Content $config -Raw
  if ($wc -match 'HttpToHttps') {
    Write-Host "[UYARI] web.config'te HTTP->HTTPS yonlendirme VAR (HTTPS calismiyorsa site kirilir)" -ForegroundColor Red
    Write-Host "  Cozum: deploy\KALDIR-HTTPS-YONLENDIRME.ps1" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "--- HTTP test ---" -ForegroundColor Cyan
$targets = @(
  "http://127.0.0.1/",
  "http://localhost/",
  "http://mollayazilim.com/"
)
if ($dns -and $dns -ne "?") { $targets += "http://$dns/" }

foreach ($u in $targets) {
  try {
    $req = [System.Net.HttpWebRequest]::Create($u)
    $req.Method = "GET"
    $req.AllowAutoRedirect = $false
    $req.Timeout = 15000
    $resp = $req.GetResponse()
    $code = [int]$resp.StatusCode
    $loc = $resp.Headers["Location"]
    $resp.Close()
    if ($loc) {
      Write-Host "  $u -> $code -> $loc" -ForegroundColor $(if ($code -ge 300) { "Yellow" } else { "Green" })
    } else {
      Write-Host "  $u -> $code" -ForegroundColor Green
    }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $code = [int]$resp.StatusCode
      $loc = $resp.Headers["Location"]
      Write-Host "  $u -> $code Location=$loc" -ForegroundColor Red
    } else {
      Write-Host "  $u -> $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

Write-Host ""
Write-Host "--- HTTPS test ---" -ForegroundColor Cyan
foreach ($u in @("https://mollayazilim.com/", "https://$dns/")) {
  if ($u -match 'https:///') { continue }
  try {
    $r = Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 12
    Write-Host "  $u -> $($r.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "  $u -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "OZET:" -ForegroundColor Cyan
Write-Host "  HTTP acik adres: http://mollayazilim.com/  (https DEGIL)"
Write-Host "  HTTPS icin: KUR-HTTPS.cmd (canli sunucuda)"
Write-Host "  Tarayici https'e zorluyorsa: gizli pencere + http:// yaz"
