#Requires -RunAsAdministrator
<#
  Windows Guvenlik Duvari — dis erisim portlari

  Site:     TCP 80  (mollayazilim)
  Oyun API: TCP 3100 (vampir-koylu — 3000 KULLANMA)
  SSH:      TCP 22  (uzak yonetim)

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\AC-FIREWALL.ps1
#>
$ErrorActionPreference = "Stop"

function Ensure-FirewallRule {
  param(
    [string]$DisplayName,
    [int]$Port,
    [string]$Description
  )
  $existing = Get-NetFirewallRule -DisplayName $DisplayName -ErrorAction SilentlyContinue
  if ($existing) {
    Set-NetFirewallRule -DisplayName $DisplayName `
      -Enabled True -Action Allow -Direction Inbound `
      -Profile Any -ErrorAction SilentlyContinue | Out-Null
    Write-Host "  [var] $DisplayName -> TCP $Port (tum profiller)" -ForegroundColor DarkGray
  } else {
    New-NetFirewallRule -DisplayName $DisplayName `
      -Description $Description `
      -Direction Inbound `
      -Protocol TCP `
      -LocalPort $Port `
      -Action Allow `
      -Enabled True `
      -Profile Any | Out-Null
    Write-Host "  [yeni] $DisplayName -> TCP $Port" -ForegroundColor Green
  }
  netsh advfirewall firewall delete rule name="$DisplayName" 2>$null | Out-Null
  netsh advfirewall firewall add rule name="$DisplayName" dir=in action=allow protocol=TCP localport=$Port profile=any | Out-Null
}

Write-Host "=== Guvenlik duvari portlari ===" -ForegroundColor Cyan

# Eski 3000 kurallarini kaldir (site artik 80)
$old3000 = @(
  "Mollayazilim HTTP 80",
  "Mollayazilim 3000",
  "Node 3000",
  "Next.js 3000"
)
Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object {
  $_.DisplayName -match "3000|mollayazilim.*3000"
} | ForEach-Object {
  Write-Host "  [sil] eski kural: $($_.DisplayName)" -ForegroundColor Yellow
  Remove-NetFirewallRule -Name $_.Name -ErrorAction SilentlyContinue
}
netsh advfirewall firewall delete rule name="Mollayazilim HTTP 80" protocol=TCP localport=3000 2>$null | Out-Null

# Port 3000 disariya kapali (Node sadece 127.0.0.1 — IIS :80 uzerinden giris)
$block3000 = Get-NetFirewallRule -DisplayName "Mollayazilim Block 3000" -ErrorAction SilentlyContinue
if (-not $block3000) {
  New-NetFirewallRule -DisplayName "Mollayazilim Block 3000" `
    -Description "Node ic port — site :80 uzerinden acilir" `
    -Direction Inbound -Protocol TCP -LocalPort 3000 `
    -Action Block -Enabled True -Profile Any | Out-Null
  Write-Host "  [yeni] Port 3000 dis erisim -> BLOK" -ForegroundColor Green
} else {
  Set-NetFirewallRule -DisplayName "Mollayazilim Block 3000" -Enabled True -Action Block | Out-Null
  Write-Host "  [var] Port 3000 dis erisim -> BLOK" -ForegroundColor DarkGray
}

Ensure-FirewallRule -DisplayName "Mollayazilim HTTP 80" -Port 80 `
  -Description "mollayazilim.com web sitesi"

Ensure-FirewallRule -DisplayName "Vampir Koylu API 3100" -Port 3100 `
  -Description "oyun API — video/vampir-koylu"

Ensure-FirewallRule -DisplayName "SSH 22" -Port 22 `
  -Description "uzak masaustu / git deploy"

# HTTPS (ileride sertifika)
Ensure-FirewallRule -DisplayName "Mollayazilim HTTPS 443" -Port 443 `
  -Description "SSL (IIS veya reverse proxy)"

Write-Host ""
Write-Host "Dis test (baska PC veya telefon 4G):" -ForegroundColor Cyan
try {
  $ip = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 8).Content.Trim()
  Write-Host "  Site:  http://$ip/"
  Write-Host "  API:   http://${ip}:3100/  (vampir)"
} catch {
  Write-Host "  Dis IP alinamadi — panelden bakin."
}

Write-Host ""
Write-Host "ONEMLI: Site :3000 degil :80 — tarayicida port yazma." -ForegroundColor Green
Write-Host "Tamam." -ForegroundColor Green
