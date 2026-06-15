#Requires -Version 5.1
param([switch]$HardReset)

$RepoUrl = "https://github.com/afmolla/mollayazilim.git"
$Branch = "main"
$AppRoot = "C:\inetpub\wwwroot\mollayazilim"

if ($env:MOLLAYAZILIM_ROOT -and (Test-Path $env:MOLLAYAZILIM_ROOT)) {
  $AppRoot = $env:MOLLAYAZILIM_ROOT
} elseif (Test-Path (Join-Path (Join-Path $PSScriptRoot "..") ".git")) {
  $AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  $gitExe = "C:\Program Files\Git\cmd\git.exe"
  if (Test-Path $gitExe) { $env:Path = "C:\Program Files\Git\cmd;" + $env:Path }
  else { throw "git bulunamadi" }
}

Write-Host "=== git pull ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"
Set-Location $AppRoot

if (-not (Test-Path ".git")) {
  Write-Host ".git YOK" -ForegroundColor Yellow
  exit 1
}

if ((git status --porcelain) -and -not $HardReset) {
  Write-Host "stash..." -ForegroundColor Yellow
  git stash push -u -m "git-pull"
}

Write-Host "fetch..."
cmd /c "git fetch origin $Branch"
if ($LASTEXITCODE -ne 0) { exit 1 }
cmd /c "git checkout $Branch 2>nul"

if ($HardReset) {
  cmd /c "git reset --hard origin/$Branch"
  cmd /c "git clean -fd"
} else {
  cmd /c "git -c core.editor=true pull origin $Branch --no-edit"
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

$last = git log -1 --oneline
Write-Host ('OK: ' + $last) -ForegroundColor Green
