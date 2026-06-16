#Requires -Version 5.1
param(
  [switch]$SkipGit,
  [switch]$SkipBuild,
  [switch]$HardReset
)

$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $AppRoot

Write-Host "=== Guncelle + baslat ===" -ForegroundColor Cyan

if (-not $SkipGit) {
  Write-Host "[1/3] git pull..." -ForegroundColor Yellow
  $gitPull = Join-Path $PSScriptRoot "git-pull.ps1"
  if ($HardReset) { & $gitPull -HardReset } else { & $gitPull }
  if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
  Write-Host "[1/3] git atlandi" -ForegroundColor DarkGray
}

if (-not $SkipBuild) {
  Write-Host "[2/3] build..." -ForegroundColor Yellow
  $env:NODE_ENV = "production"
  if (Test-Path "package-lock.json") {
    npm ci 2>$null
    if ($LASTEXITCODE -ne 0) { npm install }
  } else {
    npm install
  }
  if ($LASTEXITCODE -ne 0) { exit 1 }
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
  Write-Host "[2/3] build atlandi" -ForegroundColor DarkGray
}

Write-Host "[3/3] site baslat..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "BASLAT-SITE.ps1")
exit $LASTEXITCODE
