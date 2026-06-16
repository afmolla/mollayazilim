#Requires -Version 5.1
<#
  Sadece siteyi baslatir. Git yok, ZIP yok, build yok.
  Build yoksa: YENIDEN-BASLAT.cmd (bir kez)
  IIS sorunu: CANLI-DUZELT.cmd
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
$SiteName = "mollayazilim.com"
$Port = 3000

Set-Location $AppRoot

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "(HATA) Build yok (.next)" -ForegroundColor Red
  Write-Host "Bir kez: YENIDEN-BASLAT.cmd" -ForegroundColor Yellow
  exit 1
}

if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "(HATA) pm2 yok - npm install -g pm2" -ForegroundColor Red
  exit 1
}

Write-Host "PM2 baslatiliyor..." -ForegroundColor Cyan
$has = cmd /c "pm2.cmd jlist 2>nul" | Select-String -Pattern "mollayazilim" -Quiet
if ($has) {
  cmd /c "pm2.cmd restart mollayazilim --update-env"
} else {
  cmd /c "pm2.cmd start `"$Eco`" --update-env"
}
cmd /c "pm2.cmd save 2>nul" | Out-Null

Start-Sleep -Seconds 2

try {
  $r = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 8
  Write-Host "[OK] Node :$Port -> $($r.StatusCode)" -ForegroundColor Green
} catch {
  cmd /c "pm2.cmd logs mollayazilim --lines 12 --nostream" 2>$null
  Write-Host "(HATA) Node calismiyor" -ForegroundColor Red
  exit 1
}

Import-Module WebAdministration -ErrorAction SilentlyContinue
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
  Start-Website -Name $SiteName -ErrorAction SilentlyContinue | Out-Null
  try {
    $iis = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 8
    Write-Host "[OK] IIS http://localhost/ -> $($iis.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "[UYARI] IIS acilmadi - CANLI-DUZELT.cmd calistirin" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "http://localhost/" -ForegroundColor Green
Write-Host "http://localhost/ambalaj" -ForegroundColor Green
exit 0
