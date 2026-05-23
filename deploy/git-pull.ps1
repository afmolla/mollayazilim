#Requires -Version 5.1
<#
  VPS / yerel: git pull duzeltmesi

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\git-pull.ps1

  Klasor farkli ise:
  $env:MOLLAYAZILIM_ROOT = "C:\inetpub\wwwroot\mollayazilim"
  .\git-pull.ps1
#>
$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/afmolla/mollayazilim.git"
$Branch = "main"

$candidates = @(
  $env:MOLLAYAZILIM_ROOT,
  "C:\inetpub\wwwroot\mollayazilim",
  "C:\inetpub\wwwroot\mollayazilim",
  (Resolve-Path (Join-Path $PSScriptRoot "..") -ErrorAction SilentlyContinue).Path
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

$AppRoot = $null
foreach ($c in $candidates) {
  if (Test-Path (Join-Path $c ".git")) { $AppRoot = $c; break }
  if (Test-Path (Join-Path $c "package.json")) { $AppRoot = $c; break }
}

if (-not $AppRoot) {
  $AppRoot = "C:\inetpub\wwwroot\mollayazilim"
  Write-Host "Git klasoru yok, klonlaniyor: $AppRoot"
  New-Item -ItemType Directory -Path (Split-Path $AppRoot -Parent) -Force | Out-Null
  git clone $RepoUrl $AppRoot
  if ($LASTEXITCODE -ne 0) { exit 1 }
  Write-Host "Tamam. Klasor: $AppRoot"
  exit 0
}

Set-Location $AppRoot
Write-Host "Klasor: $AppRoot"

if (-not (Test-Path ".git")) {
  Write-Host "HATA: .git yok. ZIP ile kopyalandiysa once klonlayin:" -ForegroundColor Red
  Write-Host "  cd C:\inetpub\wwwroot"
  Write-Host "  ren mollayazilim mollayazilim_eski"
  Write-Host "  git clone $RepoUrl mollayazilim"
  exit 1
}

$origin = (git remote get-url origin 2>$null)
if ($origin -ne $RepoUrl) {
  Write-Host "Remote guncelleniyor: $origin -> $RepoUrl"
  git remote set-url origin $RepoUrl
}

$dirty = git status --porcelain
if ($dirty) {
  Write-Host "Yerel degisiklik var - stash..." -ForegroundColor Yellow
  git stash push -m "git-pull.ps1 $(Get-Date -Format o)"
}

git fetch origin $Branch
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "fetch basarisiz. Olasiliklar:" -ForegroundColor Red
  Write-Host "  - Internet / firewall"
  Write-Host "  - Private repo: Personal Access Token gerekir"
  Write-Host "    git pull https://TOKEN@github.com/afmolla/mollayazilim.git main"
  exit 1
}

git checkout $Branch 2>$null
git pull origin $Branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "pull basarisiz. Deneyin:" -ForegroundColor Yellow
  Write-Host "  git reset --hard origin/$Branch"
  exit 1
}

Write-Host "OK: $(git log -1 --oneline)" -ForegroundColor Green
