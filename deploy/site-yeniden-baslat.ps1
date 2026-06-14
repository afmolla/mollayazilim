#Requires -Version 5.1
<#
  Yerel / sunucu: git pull (varsa) -> build -> PM2 yeniden baslat -> saglik kontrolu.

  Kullanim:
    powershell -ExecutionPolicy Bypass -File deploy\site-yeniden-baslat.ps1
    powershell -ExecutionPolicy Bypass -File deploy\site-yeniden-baslat.ps1 -SkipGit
    powershell -ExecutionPolicy Bypass -File deploy\site-yeniden-baslat.ps1 -SkipBuild
#>
param(
  [switch]$SkipGit,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Pm2Name = if ($env:PM2_APP_NAME) { $env:PM2_APP_NAME } else { "mollayazilim" }
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
$Port = 3000

function Test-HttpOk {
  param([string]$Url, [int]$TimeoutSec = 15)
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    return @{ Ok = $true; Code = [int]$r.StatusCode }
  } catch {
    $code = $null
    try {
      if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    } catch { }
    return @{ Ok = $false; Code = $code; Error = $_.Exception.Message }
  }
}

Set-Location $AppRoot
Write-Host "=== Molla Yazilim - Siteyi yeniden baslat ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot`n"

if (-not $SkipGit -and (Test-Path (Join-Path $AppRoot ".git"))) {
  Write-Host "[1/4] Git pull..." -ForegroundColor Yellow
  git fetch origin 2>&1 | Out-Host
  git pull origin main 2>&1 | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Host "UYARI: git pull basarisiz - yerel dosyalarla devam ediliyor." -ForegroundColor DarkYellow
  } else {
    $head = (git rev-parse --short HEAD 2>$null)
    if ($head) { Write-Host "Commit: $head" -ForegroundColor Green }
  }
} else {
  Write-Host "[1/4] Git atlandi." -ForegroundColor DarkGray
}

if (-not $SkipBuild) {
  Write-Host "`n[2/4] npm run build..." -ForegroundColor Yellow
  $env:NODE_ENV = "production"
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
  Write-Host "`n[2/4] Build atlandi." -ForegroundColor DarkGray
}

Write-Host "`n[3/4] PM2 yeniden baslat..." -ForegroundColor Yellow
if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "HATA: pm2 bulunamadi. npm install -g pm2" -ForegroundColor Red
  exit 1
}

$has = cmd /c "pm2.cmd jlist" 2>$null | Select-String -Pattern $Pm2Name -Quiet
if ($has) {
  cmd /c "pm2.cmd restart $Pm2Name --update-env"
} elseif (Test-Path $Eco) {
  cmd /c "pm2.cmd start `"$Eco`" --update-env"
  cmd /c "pm2.cmd save" 2>$null
} else {
  Write-Host "HATA: PM2 app yok ve ecosystem bulunamadi: $Eco" -ForegroundColor Red
  exit 1
}

Start-Sleep -Seconds 4

Write-Host "`n[4/4] Saglik kontrolu..." -ForegroundColor Yellow
$checks = @(
  @{ Label = "API health"; Url = "http://127.0.0.1:$Port/api/health" },
  @{ Label = "Ana sayfa"; Url = "http://127.0.0.1:$Port/" },
  @{ Label = "Ambalaj demo"; Url = "http://127.0.0.1:$Port/ambalaj" }
)
$allOk = $true
foreach ($c in $checks) {
  $t = Test-HttpOk -Url $c.Url
  if ($t.Ok) {
    Write-Host "  OK  $($c.Label) - HTTP $($t.Code)" -ForegroundColor Green
  } else {
    $allOk = $false
    $detail = if ($t.Code) { "HTTP $($t.Code)" } else { $t.Error }
    Write-Host "  HATA  $($c.Label) - $detail" -ForegroundColor Red
  }
}

Write-Host ""
if ($allOk) {
  Write-Host "Tamam. IIS uzerinden: http://localhost/  ve  http://localhost/ambalaj" -ForegroundColor Green
  exit 0
}

Write-Host "Bazi kontroller basarisiz. Log: pm2 logs $Pm2Name --lines 30" -ForegroundColor Yellow
exit 2
