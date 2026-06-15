#Requires -Version 5.1
<#
  Sunucu guncelleme: git pull -> npm ci -> build -> PM2 restart -> saglik kontrolu.
  YENIDEN-BASLAT.cmd cagirir.

  Parametreler:
    -SkipGit     git atla
    -SkipBuild   build atla (sadece pm2 restart)
    -HardReset   git pull yerine origin/main ile zorla esitle
#>
param(
  [switch]$SkipGit,
  [switch]$SkipBuild,
  [switch]$HardReset
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

function Restart-Pm2App {
  if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: pm2 bulunamadi. npm install -g pm2" -ForegroundColor Red
    exit 1
  }

  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $pid3000 = $_.OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid3000" -ErrorAction SilentlyContinue
    $cmd = if ($proc) { $proc.CommandLine } else { "" }
    if ($cmd -notmatch "next") {
      Write-Host "Port $Port temizleniyor (PID $pid3000)..." -ForegroundColor Yellow
      Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Seconds 2

  $has = cmd /c "pm2.cmd jlist" 2>$null | Select-String -Pattern $Pm2Name -Quiet
  if ($has) {
    cmd /c "pm2.cmd restart $Pm2Name --update-env"
  } elseif (Test-Path $Eco) {
    cmd /c "pm2.cmd delete $Pm2Name" 2>$null
    cmd /c "pm2.cmd start `"$Eco`" --update-env"
    cmd /c "pm2.cmd save" 2>$null
  } else {
    Write-Host "HATA: PM2 app yok ve ecosystem bulunamadi: $Eco" -ForegroundColor Red
    exit 1
  }
}

Set-Location $AppRoot
Write-Host "=== Molla Yazilim - Yeniden baslat / guncelle ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot`n"

if (-not $SkipGit) {
  Write-Host "[1/4] GitHubdan cekiliyor..." -ForegroundColor Yellow
  $gitPull = Join-Path $PSScriptRoot "git-pull.ps1"
  if ($HardReset) {
    & $gitPull -HardReset
  } else {
    & $gitPull
  }
  if ($LASTEXITCODE -ne 0) {
    Write-Host "git pull basarisiz - ZIP deneniyor..." -ForegroundColor Yellow
    $zipScript = Join-Path $PSScriptRoot "GITHUB-ZIP-GUNCELLE.ps1"
    if (Test-Path $zipScript) {
      & $zipScript
      if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: ZIP ile guncellendi" -ForegroundColor Green
      } else {
        Write-Host "HATA: git ve ZIP guncelleme basarisiz." -ForegroundColor Red
        exit 1
      }
    } else {
      Write-Host "HATA: git guncelleme basarisiz." -ForegroundColor Red
      exit 1
    }
  }
} else {
  Write-Host "[1/4] Git atlandi." -ForegroundColor DarkGray
}

if (-not $SkipBuild) {
  Write-Host "`n[2/4] npm ci + build..." -ForegroundColor Yellow
  $env:NODE_ENV = "production"
  if (Test-Path (Join-Path $AppRoot "package-lock.json")) {
    npm ci
    if ($LASTEXITCODE -ne 0) {
      Write-Host "npm ci basarisiz - npm install deneniyor..." -ForegroundColor DarkYellow
      npm install
    }
  } else {
    npm install
  }
  if ($LASTEXITCODE -ne 0) { exit 1 }
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
  Write-Host "`n[2/4] Build atlandi." -ForegroundColor DarkGray
}

Write-Host "`n[3/4] PM2 yeniden baslat..." -ForegroundColor Yellow
Restart-Pm2App

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
  Write-Host "Tamam. Canli: https://mollayazilim.com/" -ForegroundColor Green
  Write-Host "Yerel:    http://localhost/  ve  http://localhost/ambalaj" -ForegroundColor DarkGray
  exit 0
}

Write-Host "Bazi kontroller basarisiz. Log: pm2 logs $Pm2Name --lines 30" -ForegroundColor Yellow
exit 2
