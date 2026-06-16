#Requires -RunAsAdministrator
<#
  VPS: https://mollayazilim.com ERR_CONNECTION_RESET duzeltme.
  1) Kirik SSL temizle  2) Let's Encrypt al  3) IIS'e bagla  4) test
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Test-HttpsOk {
  try {
    $req = [System.Net.HttpWebRequest]::Create("https://mollayazilim.com/")
    $req.Method = "HEAD"
    $req.AllowAutoRedirect = $true
    $req.Timeout = 20000
    $resp = $req.GetResponse()
    $code = [int]$resp.StatusCode
    $resp.Close()
    return ($code -ge 200 -and $code -lt 500)
  } catch {
    return $false
  }
}

Write-Host ""
Write-Host "=== VPS HTTPS TAMIR ===" -ForegroundColor Cyan

if (Test-HttpsOk) {
  Write-Host "[OK] https://mollayazilim.com/ zaten calisiyor" -ForegroundColor Green
  & (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")
  exit 0
}

Write-Host "HTTPS calismiyor - sertifika aliniyor..." -ForegroundColor Yellow

& (Join-Path $PSScriptRoot "SERTIFIKA-YUKLE.ps1")
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "(UYARI) Let's Encrypt basarisiz - site sadece HTTP ile acilir" -ForegroundColor Yellow
  Write-Host "  http://mollayazilim.com/  (tarayicida http:// yaz)" -ForegroundColor Yellow
  & (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")
  exit 1
}

Start-Sleep -Seconds 2

if (Test-HttpsOk) {
  Write-Host ""
  Write-Host "[OK] https://mollayazilim.com/ CALISIYOR" -ForegroundColor Green
  Write-Host "[OK] Sunucuda tarayici: https://mollayazilim.com/ artik acilir" -ForegroundColor Green
  Write-Host "[OK] Telefonda yesil kilit (Let's Encrypt)" -ForegroundColor Green
  & (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")
  & (Join-Path $PSScriptRoot "HTTPS-DURUM.ps1")
  exit 0
}

Write-Host "(HATA) Sertifika alindi ama HTTPS testi basarisiz" -ForegroundColor Red
& (Join-Path $PSScriptRoot "KALDIR-KIRIK-HTTPS.ps1")
& (Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1")
exit 1
