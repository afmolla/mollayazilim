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

function Add-GitToPath {
  param([string]$GitExe)
  $dir = Split-Path $GitExe -Parent
  if ($dir -and ($env:Path -notlike "*$dir*")) {
    $env:Path = "$dir;$env:Path"
  }
}

function Ensure-Git {
  if (Get-Command git -ErrorAction SilentlyContinue) {
    return $true
  }

  $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
  if ($machinePath -or $userPath) {
    $env:Path = "$machinePath;$userPath"
    if (Get-Command git -ErrorAction SilentlyContinue) {
      return $true
    }
  }

  $candidates = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "C:\Git\cmd\git.exe"
  )

  foreach ($exe in $candidates) {
    if (Test-Path $exe) {
      Add-GitToPath $exe
      Write-Host "git bulundu: $exe" -ForegroundColor DarkGray
      return $true
    }
  }

  $whereOut = cmd /c "where git 2>nul"
  if ($whereOut) {
    $first = ($whereOut -split "`r?`n" | Where-Object { $_.Trim() } | Select-Object -First 1).Trim()
    if ($first -and (Test-Path $first)) {
      Add-GitToPath $first
      Write-Host "git bulundu: $first" -ForegroundColor DarkGray
      return $true
    }
  }

  $winget = "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe"
  if (-not (Test-Path $winget)) {
    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($wingetCmd) { $winget = $wingetCmd.Source }
  }

  if ($winget -and (Test-Path $winget)) {
    Write-Host "Git kuruluyor (winget)..." -ForegroundColor Yellow
    & $winget install Git.Git -e --accept-package-agreements --accept-source-agreements
    Start-Sleep -Seconds 3
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (Test-Path "C:\Program Files\Git\cmd\git.exe") {
      Add-GitToPath "C:\Program Files\Git\cmd\git.exe"
      return $true
    }
  }

  return $false
}

function Update-FromGitHubZip {
  $zipScript = Join-Path $PSScriptRoot "GITHUB-ZIP-GUNCELLE.ps1"
  if (-not (Test-Path $zipScript)) {
    return $false
  }
  Write-Host "Git yok - GitHub ZIP ile guncelleniyor..." -ForegroundColor Yellow
  & $zipScript
  return $LASTEXITCODE -eq 0
}

$bootstrap = Join-Path $PSScriptRoot "BOOTSTRAP-PATH.cmd"
if (Test-Path $bootstrap) {
  cmd /c "`"$bootstrap`""
}

if (-not (Ensure-Git)) {
  if (Update-FromGitHubZip) {
    Write-Host "OK: ZIP guncelleme tamam" -ForegroundColor Green
    exit 0
  }
  Write-Host "HATA: git bulunamadi." -ForegroundColor Red
  Write-Host "Cozum 1: https://git-scm.com/download/win kurun" -ForegroundColor Yellow
  Write-Host "Cozum 2: deploy\GITHUB-ZIP-GUNCELLE.ps1 calistirin" -ForegroundColor Yellow
  exit 1
}

Write-Host "=== git pull ===" -ForegroundColor Cyan
Write-Host "git: $(git --version)"
Write-Host "Klasor: $AppRoot"
Set-Location $AppRoot

if (-not (Test-Path ".git")) {
  Write-Host ".git YOK - ZIP guncelleme deneniyor..." -ForegroundColor Yellow
  if (Update-FromGitHubZip) {
    Write-Host "OK: ZIP guncelleme tamam" -ForegroundColor Green
    exit 0
  }
  exit 1
}

if ((git status --porcelain) -and -not $HardReset) {
  Write-Host "stash..." -ForegroundColor Yellow
  git stash push -u -m "git-pull"
}

Write-Host "fetch..."
cmd /c "git fetch origin $Branch"
if ($LASTEXITCODE -ne 0) {
  if (Update-FromGitHubZip) { exit 0 }
  exit 1
}
cmd /c "git checkout $Branch 2>nul"

if ($HardReset) {
  cmd /c "git reset --hard origin/$Branch"
  cmd /c "git clean -fd"
} else {
  cmd /c "git -c core.editor=true pull origin $Branch --no-edit"
  if ($LASTEXITCODE -ne 0) {
    if (Update-FromGitHubZip) { exit 0 }
    exit 1
  }
}

$last = git log -1 --oneline
Write-Host ('OK: ' + $last) -ForegroundColor Green
