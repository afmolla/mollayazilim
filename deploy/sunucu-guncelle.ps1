#Requires -Version 5.1
<#
  GitHub'dan çek → build → PM2 yeniden başlat (mollayazilim.com).

  İlk kurulum (bir kez):
    cd C:\inetpub\wwwroot
    git clone https://github.com/afmolla/mollayazilim.git mollayazilim
    cd mollayazilim
    copy .env.example .env.production.local
    notepad .env.production.local
    npm ci
    npm run build
    npm install -g pm2
    pm2 start deploy\ecosystem-iis.config.cjs
    pm2 save

  Her güncelleme (PC'de push sonrası sunucuda):
    powershell -ExecutionPolicy Bypass -File C:\inetpub\wwwroot\mollayazilim\deploy\sunucu-guncelle.ps1

  Otomatik: Görev Zamanlayıcı (5 dk) veya GitHub Actions (deploy-mollayazilim.yml)
#>

$ErrorActionPreference = "Stop"
$AppRoot = if ($env:MOLLAYAZILIM_ROOT) { $env:MOLLAYAZILIM_ROOT } else { Split-Path $PSScriptRoot -Parent }
$Pm2Name = if ($env:PM2_APP_NAME) { $env:PM2_APP_NAME } else { "mollayazilim" }

Set-Location $AppRoot
Write-Host "==> $AppRoot"

if (Test-Path (Join-Path $AppRoot ".git")) {
  git fetch origin
  git pull origin main
} else {
  Write-Warning ".git yok — atlanıyor (ZIP ile kopyalandıysa elle güncelleyin)"
}

$env:NODE_ENV = "production"
npm ci
npm run build

$pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
$eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
if ($pm2 -and (Test-Path $eco)) {
  # Port 3000 baska servis tutuyorsa temizle (Vampir API vb.)
  Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $pid3000 = $_.OwningProcess
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid3000" -ErrorAction SilentlyContinue
    $cmd = if ($proc) { $proc.CommandLine } else { "" }
    if ($cmd -notmatch "next") {
      Write-Host "Port 3000 temizleniyor (PID $pid3000)..." -ForegroundColor Yellow
      Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Seconds 2
  pm2 delete $Pm2Name 2>$null | Out-Null
  pm2 start $eco
  pm2 save
  Write-Host "PM2: $Pm2Name — ecosystem-iis.config.cjs port 3000"
} elseif ($pm2) {
  pm2 restart $Pm2Name
  Write-Host "PM2: $Pm2Name restart"
} else {
  Write-Host "PM2 yok — elle: cd $AppRoot && npm run start"
}

Write-Host "Tamam. Test: http://localhost/  veya  https://mollayazilim.com"
