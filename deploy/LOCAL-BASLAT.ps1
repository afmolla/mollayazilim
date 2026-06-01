#Requires -Version 5.1
<#
  http://localhost/ — site ac (BASLAT.cmd cagirir)
  PM2 + Node :3000 + IIS test + tarayici
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
$Pm2Name = "mollayazilim"
$Port = 3000

function Get-HttpStatusCodeFromError {
  param($ErrorRecord)
  try {
    if ($ErrorRecord.Exception.Response -and $ErrorRecord.Exception.Response.StatusCode) {
      return [int]$ErrorRecord.Exception.Response.StatusCode
    }
  } catch { }
  return $null
}

Set-Location $AppRoot
Write-Host "=== Siteyi ac ===" -ForegroundColor Cyan
Write-Host "http://localhost/  (IIS :80 -> Node :3000)`n"

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "Build eksik - npm run build..." -ForegroundColor Yellow
  $env:NODE_ENV = "production"
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $procId = $_.OwningProcess
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
  $cmd = if ($proc) { $proc.CommandLine } else { "" }
  if ($cmd -notmatch "next" -and $cmd -notmatch "start-next") {
    Write-Host "Port $Port temizleniyor (PID $procId)..." -ForegroundColor Yellow
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 1

if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "PM2 yok: npm install -g pm2" -ForegroundColor Red
  exit 1
}

$has = cmd /c "pm2.cmd jlist" 2>$null | Select-String -Pattern $Pm2Name -Quiet
if ($has) {
  cmd /c "pm2.cmd restart $Pm2Name --update-env"
} else {
  cmd /c "pm2.cmd start `"$Eco`" --update-env"
}
cmd /c "pm2.cmd save" 2>$null
Start-Sleep -Seconds 6

$nodeOk = $false
$iisOk = $false
try {
  $n = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 30
  Write-Host "(OK) Node port $Port status $($n.StatusCode)" -ForegroundColor Green
  $nodeOk = $true
} catch {
  Write-Host "(HATA) Node port $Port - $($_.Exception.Message)" -ForegroundColor Red
  cmd /c "pm2.cmd logs $Pm2Name --lines 15 --nostream" 2>$null
}

try {
  $w = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 30
  Write-Host "(OK) localhost status $($w.StatusCode)" -ForegroundColor Green
  $iisOk = $true
} catch {
  $statusCode = Get-HttpStatusCodeFromError $_
  if ($statusCode) {
    Write-Host "(HATA) localhost status $statusCode - $($_.Exception.Message)" -ForegroundColor Red
  } else {
    Write-Host "(HATA) localhost - $($_.Exception.Message)" -ForegroundColor Red
  }
  Write-Host ""
  Write-Host "Cozum: BASLAT.cmd duzelt otomatik baslatilacak (Yonetici)" -ForegroundColor Yellow
}

if (-not $nodeOk) { exit 1 }

if ($iisOk) {
  Write-Host ""
  Write-Host "Tarayici: http://localhost/" -ForegroundColor Green
  Start-Process "http://localhost/"
  exit 0
}

exit 2
