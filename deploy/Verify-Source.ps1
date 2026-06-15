#Requires -Version 5.1
<#
  Kaynak dosyalari eksikse (lib/, proxy.ts) git pull veya ZIP ile tamamlar.
  Build oncesi cagirilir - Can't resolve @/lib/... hatasini onler.
#>
param(
  [switch]$ForceSync
)

$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$required = @(
  "lib\site-config.ts",
  "lib\detect-request-site.ts",
  "lib\site-proxy-headers.ts",
  "lib\content-store.ts",
  "lib\settings-store.ts",
  "proxy.ts",
  "tsconfig.json",
  "package.json"
)

function Test-SourceComplete {
  param([string]$Root)
  $missing = @()
  foreach ($rel in $required) {
    if (-not (Test-Path (Join-Path $Root $rel))) {
      $missing += $rel
    }
  }
  return $missing
}

Set-Location $AppRoot
$missing = Test-SourceComplete -Root $AppRoot

if ($missing.Count -eq 0 -and -not $ForceSync) {
  Write-Host "[OK] Kaynak dosyalari tam" -ForegroundColor DarkGray
  exit 0
}

if ($missing.Count -gt 0) {
  Write-Host "(HATA) Eksik dosyalar:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "Kaynak guncelleniyor (git pull)..." -ForegroundColor Yellow
$gitPull = Join-Path $PSScriptRoot "git-pull.ps1"
if (Test-Path $gitPull) {
  & $gitPull -HardReset
  if ($LASTEXITCODE -eq 0) {
    $missing = Test-SourceComplete -Root $AppRoot
    if ($missing.Count -eq 0) {
      Write-Host "[OK] Git ile kaynak tamamlandi" -ForegroundColor Green
      exit 0
    }
  }
}

Write-Host "Git basarisiz - GitHub ZIP deneniyor..." -ForegroundColor Yellow
$zipScript = Join-Path $PSScriptRoot "GITHUB-ZIP-GUNCELLE.ps1"
if (Test-Path $zipScript) {
  & $zipScript
  if ($LASTEXITCODE -ne 0) { exit 1 }
  $missing = Test-SourceComplete -Root $AppRoot
  if ($missing.Count -eq 0) {
    Write-Host "[OK] ZIP ile kaynak tamamlandi" -ForegroundColor Green
    exit 0
  }
}

Write-Host "(HATA) Kaynak hala eksik. Manuel: git clone afmolla/mollayazilim" -ForegroundColor Red
exit 1
