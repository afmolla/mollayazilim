#Requires -Version 5.1
<#
  VPS: localhost:3000 teshis + baslat.

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\VPS-BASLAT.ps1

  Ilk kurulum:
  .\VPS-BASLAT.ps1 -IlkKurulum
#>
param([switch]$IlkKurulum)

$ErrorActionPreference = "Continue"
$AppRoot = if ($env:MOLLAYAZILIM_ROOT) {
  $env:MOLLAYAZILIM_ROOT
} else {
  (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
$Pm2Name = "mollayazilim"
$Port = 3000

function Test-PortListen {
  param([int]$P)
  $c = Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction SilentlyContinue
  return [bool]$c
}

Write-Host "=== Mollayazilim VPS baslat ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"

if (-not (Test-Path $AppRoot)) {
  Write-Host "HATA: Klasor yok: $AppRoot" -ForegroundColor Red
  if ($IlkKurulum) {
    $www = "C:\inetpub\wwwroot"
    New-Item -ItemType Directory -Path $www -Force | Out-Null
    Set-Location $www
    $folderName = Split-Path $AppRoot -Leaf
    git clone https://github.com/afmolla/mollayazilim.git $folderName
    $AppRoot = Join-Path $www $folderName
  }
  else {
    Write-Host "Ilk kurulum: .\VPS-BASLAT.ps1 -IlkKurulum"
    exit 1
  }
}

Set-Location $AppRoot

$envFile = Join-Path $AppRoot ".env.production.local"
$envExample = Join-Path $AppRoot ".env.example"
if (($IlkKurulum) -or (-not (Test-Path $envFile))) {
  if (Test-Path $envExample) {
    Copy-Item $envExample $envFile -Force
    Write-Host "Olusturuldu: .env.production.local - PANEL_PASSWORD ve SESSION_SECRET doldurun."
  }
}

if (Test-PortListen $Port) {
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) {
    $pid3000 = $conn.OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid3000" -ErrorAction SilentlyContinue
    $cmd = if ($proc) { $proc.CommandLine } else { "" }
    if (($cmd -match "vampir") -or (($cmd -match "src\\index\.js") -and ($cmd -notmatch "next"))) {
      Write-Host "Port $Port baska servis (PID $pid3000). Durduruluyor..." -ForegroundColor Yellow
      Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 2
    }
  }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "HATA: Node.js yok. https://nodejs.org/ kurun." -ForegroundColor Red
  exit 1
}

Write-Host "Node: $(node -v)"

if (-not (Test-Path (Join-Path $AppRoot "node_modules"))) {
  Write-Host "npm ci..."
  npm ci
}

$buildId = Join-Path $AppRoot ".next\BUILD_ID"
$nextBin = Join-Path $AppRoot "node_modules\next\dist\bin\next"
if ((-not (Test-Path $buildId)) -or (-not (Test-Path $nextBin))) {
  Write-Host "npm run build (production)..."
  $env:NODE_ENV = "production"
  npm run build
  if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: build basarisiz. Yukaridaki npm hatasini duzeltin." -ForegroundColor Red
    exit 1
  }
}
if (-not (Test-Path $buildId)) {
  Write-Host "HATA: .next\BUILD_ID yok - build tamamlanmadi." -ForegroundColor Red
  exit 1
}

$env:NODE_ENV = "production"

$eco = Join-Path $AppRoot "deploy\ecosystem.config.cjs"
if (-not (Test-Path $eco)) {
  Write-Host "HATA: ecosystem.config.cjs yok: $eco" -ForegroundColor Red
  exit 1
}

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 delete $Pm2Name 2>$null | Out-Null
  pm2 start $eco
  pm2 save
  Start-Sleep -Seconds 6
  pm2 list

  $online = $false
  try {
    $list = pm2 jlist 2>$null | ConvertFrom-Json
    $app = $list | Where-Object { $_.name -eq $Pm2Name } | Select-Object -First 1
    if ($app -and $app.pm2_env.status -eq "online") { $online = $true }
  }
  catch { }

  if (-not $online) {
    Write-Host "" 
    Write-Host "PM2 errored - son loglar:" -ForegroundColor Red
    pm2 logs $Pm2Name --lines 35 --nostream 2>$null
    Write-Host ""
    Write-Host "Elle dene: cd $AppRoot ; npm run start" -ForegroundColor Yellow
    exit 1
  }
}
else {
  Write-Host "PM2 yok - npm install -g pm2 onerilir. Arka planda start..." -ForegroundColor Yellow
  $arg = "/c cd /d `"$AppRoot`" && set NODE_ENV=production && npm run start"
  Start-Process -FilePath "cmd.exe" -ArgumentList $arg -WindowStyle Minimized
  Start-Sleep -Seconds 10
}

Start-Sleep -Seconds 2
if (Test-PortListen $Port) {
  try {
    $url = "http://127.0.0.1:$Port/"
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
    Write-Host "OK localhost:$Port -> HTTP $($r.StatusCode)" -ForegroundColor Green
  }
  catch {
    Write-Host "Port acik ama HTTP hata: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}
else {
  Write-Host "HATA: Port $Port dinlemiyor. pm2 logs $Pm2Name" -ForegroundColor Red
  exit 1
}

if (Get-Module WebAdministration -ListAvailable) {
  Import-Module WebAdministration -ErrorAction SilentlyContinue
  $site = Get-Website -Name "mollayazilim.com" -ErrorAction SilentlyContinue
  if ($site) {
    $pp = $site.physicalPath
    if ($pp -ne $AppRoot) {
      Write-Host "IIS yolu guncelleniyor: $pp -> $AppRoot"
      Set-ItemProperty "IIS:\Sites\mollayazilim.com" -Name physicalPath -Value $AppRoot
    }
    Start-Website -Name "mollayazilim.com" -ErrorAction SilentlyContinue
    Write-Host "IIS: mollayazilim.com -> $AppRoot"
  }
  else {
    Write-Host "IIS sitesi yok. Yonetici: .\Install-Mollayazilim-NextIIS.ps1"
  }
}

Write-Host ""
Write-Host "Test: http://localhost/  (IIS)"
