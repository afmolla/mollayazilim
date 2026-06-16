#Requires -RunAsAdministrator
<#
  Yerel gelistirme: mollayazilim.com -> 127.0.0.1 (port 80, :3000 yok)
  Canli sunucuda (DNS = bu makinenin IP) hosts eklenmez.
#>
$ErrorActionPreference = "Continue"

function Test-IsProductionServer {
  try {
    $dnsIp = (Resolve-DnsName "mollayazilim.com" -Type A -ErrorAction Stop | Select-Object -First 1).IPAddress
    $publicIp = (Invoke-WebRequest "https://api.ipify.org" -UseBasicParsing -TimeoutSec 8).Content.Trim()
    return ($dnsIp -and $publicIp -and $dnsIp -eq $publicIp)
  } catch {
    return $false
  }
}

if (Test-IsProductionServer) {
  Write-Host "[OK] Canli sunucu - hosts degisikligi gerekmez" -ForegroundColor DarkGray
  exit 0
}

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$marker = "# mollayazilim-local"
$entries = @(
  "127.0.0.1 mollayazilim.com",
  "127.0.0.1 www.mollayazilim.com",
  "127.0.0.1 mollayazilim.com.tr",
  "127.0.0.1 www.mollayazilim.com.tr"
)

$content = Get-Content $hostsPath -ErrorAction Stop
$domains = @("mollayazilim.com", "www.mollayazilim.com", "mollayazilim.com.tr", "www.mollayazilim.com.tr")

function Test-HostsActive {
  param([string]$Domain)
  foreach ($line in $content) {
    if ($line -match '^\s*#') { continue }
    $parts = ($line -split '\s+') | Where-Object { $_ }
    if ($parts.Count -ge 2 -and $parts[1] -eq $Domain) { return $true }
  }
  return $false
}

$missing = $domains | Where-Object { -not (Test-HostsActive $_) }

if (-not $missing) {
  Write-Host "[OK] hosts zaten ayarli - mollayazilim.com -> 127.0.0.1" -ForegroundColor DarkGray
  exit 0
}

$toAdd = New-Object System.Collections.Generic.List[string]
if ($content -notmatch [regex]::Escape($marker)) {
  $toAdd.Add("")
  $toAdd.Add($marker)
}
foreach ($line in $entries) {
  $domain = ($line -split '\s+', 2)[1]
  if (-not (Test-HostsActive $domain)) {
    $toAdd.Add($line)
    Write-Host "  + $line" -ForegroundColor Green
  }
}

if ($toAdd.Count -eq 0) {
  Write-Host "[OK] hosts zaten ayarli - mollayazilim.com -> 127.0.0.1" -ForegroundColor DarkGray
  exit 0
}

$written = $false
for ($try = 1; $try -le 5; $try++) {
  try {
    [System.IO.File]::AppendAllLines($hostsPath, $toAdd)
    $written = $true
    break
  } catch {
    Write-Host "  hosts yazma denemesi $try/5..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 2
  }
}
if (-not $written) {
  Write-Host "(HATA) hosts dosyasi yazilamadi - hosts dosyasini kapatip KUR.cmd tekrar calistirin" -ForegroundColor Red
  exit 1
}

Write-Host "[OK] Yerel hosts eklendi - mollayazilim.com port 80 uzerinden acilir" -ForegroundColor Green
