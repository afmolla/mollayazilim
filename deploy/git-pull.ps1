#Requires -Version 5.1
<#
  git pull (duzeltmeli)

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\git-pull.ps1

  Zorla esitle:
  .\git-pull.ps1 -HardReset

  git hic yok / pull imkansiz:
  .\GITHUB-ZIP-GUNCELLE.ps1
#>
param([switch]$HardReset)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/afmolla/mollayazilim.git"
$Branch = "main"
$AppRoot = "C:\inetpub\wwwroot\mollayazilim"

if ($env:MOLLAYAZILIM_ROOT -and (Test-Path $env:MOLLAYAZILIM_ROOT)) {
  $AppRoot = $env:MOLLAYAZILIM_ROOT
} elseif (Test-Path (Join-Path (Join-Path $PSScriptRoot "..") ".git")) {
  $AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

# git PATH (Administrator bazen farkli)
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  $gitExe = "C:\Program Files\Git\cmd\git.exe"
  if (Test-Path $gitExe) { $env:Path = "C:\Program Files\Git\cmd;" + $env:Path }
  else { throw "git bulunamadi. Kur: https://git-scm.com/download/win  veya: .\GITHUB-ZIP-GUNCELLE.ps1" }
}

Write-Host "=== git pull ===" -ForegroundColor Cyan
Write-Host "git: $(git --version)"
Write-Host "Klasor: $AppRoot"

if (-not (Test-Path $AppRoot)) {
  New-Item -ItemType Directory -Path $AppRoot -Force | Out-Null
}

Set-Location $AppRoot

# safe.directory (Windows Server)
git config --global --add safe.directory $AppRoot 2>$null
git config --global --add safe.directory "*" 2>$null

if (-not (Test-Path ".git")) {
  Write-Host ""
  Write-Host ".git YOK — bu klasor git reposu degil (ZIP kopyasi olabilir)." -ForegroundColor Yellow
  Write-Host "Secenek A — yeniden klonla (onerilen):"
  Write-Host "  cd C:\inetpub\wwwroot"
  Write-Host "  ren mollayazilim mollayazilim_yedek"
  Write-Host "  git clone $RepoUrl mollayazilim"
  Write-Host ""
  Write-Host "Secenek B — git olmadan ZIP:"
  Write-Host "  cd C:\inetpub\wwwroot\mollayazilim\deploy"
  Write-Host "  .\GITHUB-ZIP-GUNCELLE.ps1"
  exit 1
}

$origin = git remote get-url origin 2>$null
if ($origin -and $origin -ne $RepoUrl) {
  git remote set-url origin $RepoUrl
  Write-Host "remote -> $RepoUrl"
}

$dirty = git status --porcelain
if ($dirty -and -not $HardReset) {
  Write-Host "Yerel degisiklik var — stash..." -ForegroundColor Yellow
  git stash push -u -m "git-pull $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "fetch..."
git fetch origin $Branch 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "FETCH BASARISIZ" -ForegroundColor Red
  Write-Host "  - Internet / firewall / TLS"
  Write-Host "  - Repo private ise: GitHub Personal Access Token"
  Write-Host ""
  Write-Host "Git olmadan guncelle:"
  Write-Host "  .\GITHUB-ZIP-GUNCELLE.ps1"
  exit 1
}

git checkout $Branch 2>$null

if ($HardReset) {
  Write-Host "hard reset origin/$Branch ..."
  git reset --hard "origin/$Branch"
  git clean -fd
} else {
  git pull origin $Branch 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "PULL BASARISIZ — zorla esitle:" -ForegroundColor Yellow
    Write-Host "  .\git-pull.ps1 -HardReset"
    Write-Host "veya: .\GITHUB-ZIP-GUNCELLE.ps1"
    exit 1
  }
}

Write-Host ""
Write-Host "OK: $(git log -1 --oneline)" -ForegroundColor Green
