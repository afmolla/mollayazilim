#Requires -RunAsAdministrator
<#
  PM2 + IIS + HTTP hazir mi? iisreset sonrasi veya SSL oncesi cagir.
#>
$ErrorActionPreference = "Continue"
$AppRoot = if ($env:MOLLAYAZILIM_ROOT) { $env:MOLLAYAZILIM_ROOT } else {
  (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
$SiteName = "mollayazilim.com"
$PoolName = "MollayazilimPool"
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"

function Test-HttpCode {
  param([string]$Url)
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 12 -MaximumRedirection 0
    return [int]$r.StatusCode
  } catch {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return 0
  }
}

function Wait-PortListen {
  param([int]$Port, [int]$Sec = 50)
  for ($i = 0; $i -lt $Sec; $i++) {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

Write-Host "Site ayaga kaldiriliyor (PM2 + IIS)..." -ForegroundColor Cyan

$w3 = Get-Service W3SVC -ErrorAction SilentlyContinue
if ($w3 -and $w3.Status -ne "Running") {
  Start-Service W3SVC
  Start-Sleep -Seconds 3
}

Import-Module WebAdministration -ErrorAction SilentlyContinue
if (Get-WebAppPoolState -Name $PoolName -ErrorAction SilentlyContinue) {
  if ((Get-WebAppPoolState -Name $PoolName).Value -eq "Stopped") {
    Start-WebAppPool -Name $PoolName
  }
}
Start-Website -Name $SiteName -ErrorAction SilentlyContinue

if (-not (Wait-PortListen -Port 3000 -Sec 5)) {
  Write-Host "Node :3000 yok - PM2 baslatiliyor..." -ForegroundColor Yellow
  if (Get-Command pm2.cmd -ErrorAction SilentlyContinue) {
    $has = cmd /c "pm2.cmd jlist 2>nul" | Select-String -Pattern '"mollayazilim"' -Quiet
    if ($has) {
      cmd /c "pm2.cmd restart mollayazilim --update-env" 2>$null | Out-Null
    } elseif (Test-Path $Eco) {
      cmd /c "pm2.cmd start `"$Eco`" --update-env" 2>$null | Out-Null
    }
    cmd /c "pm2.cmd save" 2>$null | Out-Null
    Start-Sleep -Seconds 4
  }
}

if (-not (Wait-PortListen -Port 80 -Sec 15)) {
  Write-Host "(UYARI) Port 80 henuz dinlemiyor" -ForegroundColor Yellow
}

$ok = $false
for ($i = 1; $i -le 25; $i++) {
  $code = Test-HttpCode "http://127.0.0.1/"
  if ($code -ge 200 -and $code -lt 500) {
    Write-Host "[OK] HTTP localhost -> $code ($i. deneme)" -ForegroundColor Green
    $ok = $true
    break
  }
  Write-Host "  HTTP bekleniyor [$i/25] (kod: $code)..." -ForegroundColor DarkYellow
  if ($i -eq 5 -and -not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
    & (Join-Path $PSScriptRoot "PM2-DUZELT.ps1") 2>$null
  }
  Start-Sleep -Seconds 3
}

if (-not $ok) {
  Write-Host "(HATA) HTTP acilmadi - once BASLAT.cmd calistirin" -ForegroundColor Red
  exit 1
}
exit 0
