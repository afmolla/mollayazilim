#Requires -RunAsAdministrator
<#
  localhost calisiyor ama IP ile girmiyor — teshis + firewall

  cd C:\inetpub\wwwroot\mollayazilim\deploy
  .\DIS-ERISIM-TEST.ps1
#>
$ErrorActionPreference = "Continue"

Write-Host "=== Dis erisim teshisi ===" -ForegroundColor Cyan

try {
  $publicIp = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 10).Content.Trim()
} catch { $publicIp = "?" }

$localIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notmatch "^127\." -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -First 1).IPAddress

Write-Host "Dis IP:   $publicIp"
Write-Host "Yerel IP: $localIp"
Write-Host ""

Write-Host "--- Port 80 kim dinliyor? ---" -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
  $addr = $_.LocalAddress
  $color = if ($addr -eq "0.0.0.0" -or $addr -eq "::") { "Green" } else { "Red" }
  Write-Host "  $addr`:80  PID $($_.OwningProcess)  $($proc.ProcessName)" -ForegroundColor $color
  if ($addr -eq "127.0.0.1") {
    Write-Host "  SORUN: Sadece localhost dinleniyor! PORT-80.cmd calistir." -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "--- HTTP test ---" -ForegroundColor Yellow
foreach ($u in @(
  "http://127.0.0.1/",
  "http://localhost/",
  $(if ($localIp) { "http://${localIp}/" }),
  $(if ($publicIp -ne "?") { "http://${publicIp}/" })
)) {
  if (-not $u) { continue }
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 15
    Write-Host "  OK  $u -> $($r.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "  HATA $u -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "--- Guvenlik duvari 80 ---" -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "*Mollayazilim*" -ErrorAction SilentlyContinue |
  Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize

Write-Host "Firewall aciliyor..."
& "$PSScriptRoot\AC-FIREWALL.ps1"

Write-Host ""
Write-Host "localhost OK ama dis IP HATA ise:" -ForegroundColor Cyan
Write-Host "  1) Hosting paneli (Inetmar/VPS) -> Guvenlik Duvari -> TCP 80 INBOUND ac"
Write-Host "  2) Telefon 4G ile dene: http://$publicIp/"
Write-Host "  3) pm2 restart: PORT-80.cmd (Yonetici)"
Write-Host ""
