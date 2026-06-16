#Requires -Version 5.1
# Sunucu yeniden basladi - siteyi ac. Git/build yok.
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
$SiteName = "mollayazilim.com"
$PoolName = "MollayazilimPool"
$Port = 3000

Set-Location $AppRoot

function Wait-PortListen {
  param([int]$P, [int]$Sec = 40)
  for ($i = 0; $i -lt $Sec; $i++) {
    if (Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction SilentlyContinue) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Start-Pm2Site {
  if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: pm2 yok" -ForegroundColor Red
    return $false
  }
  cmd /c "pm2.cmd resurrect" 2>$null | Out-Null
  Start-Sleep -Seconds 2
  $has = cmd /c "pm2.cmd jlist 2>nul" | Select-String -Pattern '"mollayazilim"' -Quiet
  if ($has) {
    cmd /c "pm2.cmd restart mollayazilim --update-env" 2>$null | Out-Null
  } else {
    cmd /c "pm2.cmd start `"$Eco`" --update-env" 2>$null | Out-Null
  }
  cmd /c "pm2.cmd save" 2>$null | Out-Null
  if (Wait-PortListen -P $Port) { return $true }
  cmd /c "pm2.cmd delete mollayazilim" 2>$null | Out-Null
  cmd /c "pm2.cmd start `"$Eco`" --update-env" 2>$null | Out-Null
  cmd /c "pm2.cmd save" 2>$null | Out-Null
  return (Wait-PortListen -P $Port)
}

function Start-IisSite {
  try {
    Import-Module WebAdministration -ErrorAction Stop
    $w3 = Get-Service W3SVC -ErrorAction SilentlyContinue
    if ($w3 -and $w3.Status -ne "Running") { Start-Service W3SVC; Start-Sleep 2 }
    if (Get-WebAppPoolState -Name $PoolName -ErrorAction SilentlyContinue) {
      $st = (Get-WebAppPoolState -Name $PoolName).Value
      if ($st -eq "Stopped") { Start-WebAppPool -Name $PoolName }
      else { Restart-WebAppPool -Name $PoolName }
    }
    if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
      Start-Website -Name $SiteName -ErrorAction SilentlyContinue | Out-Null
    }
    return $true
  } catch {
    return $false
  }
}

Write-Host "Baslatiliyor..." -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "HATA: build yok" -ForegroundColor Red
  exit 1
}

if (-not (Start-Pm2Site)) {
  cmd /c "pm2.cmd logs mollayazilim --lines 15 --nostream" 2>$null
  Write-Host "HATA: Node baslamadi" -ForegroundColor Red
  exit 1
}

Start-IisSite | Out-Null
$syncScript = Join-Path $PSScriptRoot "Sync-HttpToHttps.ps1"
if (Test-Path $syncScript) {
  try { & $syncScript 2>$null } catch { }
}
Start-Sleep -Seconds 1

$ok = $false
try {
  $r = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 12
  if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $ok = $true }
} catch { }

if (-not $ok) {
  Start-IisSite | Out-Null
  Start-Sleep -Seconds 2
  try {
    $r = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 12
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $ok = $true }
  } catch { }
}

if (-not $ok) {
  Write-Host "HATA: Site acilmadi" -ForegroundColor Red
  exit 1
}

Write-Host "CALISIYOR" -ForegroundColor Green
Write-Host "http://localhost/"
Write-Host "http://mollayazilim.com/"
exit 0
