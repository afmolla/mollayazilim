#Requires -Version 5.1
<#
  git pull calismiyorsa — GitHub'dan ZIP ile guncelle (git gerekmez)

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\GITHUB-ZIP-GUNCELLE.ps1
#>
$ErrorActionPreference = "Stop"

$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Branch = "main"
$ZipUrl = "https://github.com/afmolla/mollayazilim/archive/refs/heads/$Branch.zip"
$TempZip = Join-Path $env:TEMP "mollayazilim-$Branch.zip"
$TempDir = Join-Path $env:TEMP "mollayazilim-zip-extract"

Write-Host "=== GitHub ZIP guncelleme ===" -ForegroundColor Cyan
Write-Host "Hedef: $AppRoot"

# Korunan dosyalar
$keep = @(
  (Join-Path $AppRoot ".env.production.local"),
  (Join-Path $AppRoot ".env.local")
)

if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host "Indiriliyor: $ZipUrl"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $ZipUrl -OutFile $TempZip -UseBasicParsing

Write-Host "Aciliyor..."
Expand-Archive -Path $TempZip -DestinationPath $TempDir -Force
$extracted = Get-ChildItem $TempDir -Directory | Select-Object -First 1
if (-not $extracted) { throw "ZIP bos" }

$src = $extracted.FullName
Write-Host "Kopyalaniyor: $src -> $AppRoot"

robocopy $src $AppRoot /E /XD node_modules .next .git /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) { throw "robocopy hata kodu: $LASTEXITCODE" }

Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

$verifyScript = Join-Path $PSScriptRoot "Verify-Source.ps1"
if (Test-Path $verifyScript) {
  & $verifyScript
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Set-Location $AppRoot
if (-not (Test-Path "node_modules")) {
  Write-Host "npm ci..."
  npm ci
}

if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "npm run build..."
  $env:NODE_ENV = "production"
  npm run build
}

Write-Host ""
Write-Host "ZIP guncelleme tamam." -ForegroundColor Green
Write-Host "Sonra: .\PM2-DUZELT.ps1  veya  .\FIX-LOCALHOST.ps1"
