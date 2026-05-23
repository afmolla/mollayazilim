#Requires -Version 5.1
<#
  VPS'te localhost:3000 çalışmıyorsa — teşhis + başlat.
  PowerShell (Yönetici önerilir):

    cd C:\inetpub\wwwroot\mollayazilim\deploy
    .\VPS-BASLAT.ps1

  İlk kurulum (klasör yoksa):
    .\VPS-BASLAT.ps1 -IlkKurulum
#>
param([switch]$IlkKurulum)

$ErrorActionPreference = "Continue"
$AppRoot = if ($env:MOLLAYAZILIM_ROOT) { $env:MOLLAYAZILIM_ROOT } else { "C:\inetpub\wwwroot\mollayazilim" }
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
    New-Item -ItemType Directory -Path "C:\inetpub\wwwroot" -Force | Out-Null
    Set-Location "C:\inetpub\wwwroot"
    git clone https://github.com/afmolla/mollyazilim.git mollayazilim
  } else {
    Write-Host "Ilk kurulum: .\VPS-BASLAT.ps1 -IlkKurulum"
    exit 1
  }
}

Set-Location $AppRoot

if ($IlkKurulum -or -not (Test-Path ".env.production.local")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env.production.local" -Force -ErrorAction SilentlyContinue
    Write-Host "Olusturuldu: .env.production.local — PANEL_PASSWORD ve SESSION_SECRET doldurun."
  }
}

# Port 3000 baska servis (Vampir API vb.)
if (Test-PortListen $Port) {
  $pid3000 = (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
  $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$pid3000" -ErrorAction SilentlyContinue).CommandLine
  if ($cmd -match "vampir|src\\index\.js" -and $cmd -notmatch "next") {
    Write-Host "Port $Port Vampir API tarafindan tutuluyor (PID $pid3000). Durduruluyor..." -ForegroundColor Yellow
    Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
  }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "HATA: Node.js yok. https://nodejs.org/ kurun." -ForegroundColor Red
  exit 1
}

Write-Host "Node: $(node -v)"

if (-not (Test-Path "node_modules")) {
  Write-Host "npm ci..."
  npm ci
}

if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "npm run build..."
  $env:NODE_ENV = "production"
  npm run build
  if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: build basarisiz." -ForegroundColor Red
    exit 1
  }
}

$env:NODE_ENV = "production"

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  pm2 describe $Pm2Name 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    pm2 restart $Pm2Name
  } else {
    pm2 delete $Pm2Name 2>$null | Out-Null
    pm2 start npm --name $Pm2Name -- start
    pm2 save
  }
  pm2 list
} else {
  Write-Host "PM2 yok — npm install -g pm2 onerilir. Simdilik arka planda start..." -ForegroundColor Yellow
  Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$AppRoot`" && set NODE_ENV=production && npm run start" -WindowStyle Minimized
  Start-Sleep 8
}

Start-Sleep 3
if (Test-PortListen $Port) {
  try {
    $r = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 30
    Write-Host "OK localhost:$Port -> HTTP $($r.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "Port acik ama HTTP hata: $_" -ForegroundColor Yellow
  }
} else {
  Write-Host "HATA: Port $Port dinlemiyor. pm2 logs $Pm2Name" -ForegroundColor Red
  exit 1
}

# IIS
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
  } else {
    Write-Host "IIS sitesi yok. Yonetici: .\Install-Mollayazilim-NextIIS.ps1"
  }
}

Write-Host ""
Write-Host "Test: http://127.0.0.1:3000/  ve  http://localhost:3000/"
