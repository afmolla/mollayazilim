#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

if (-not (Test-Path $hostsPath)) { exit 0 }

$lines = Get-Content $hostsPath
$out = New-Object System.Collections.Generic.List[string]
$removed = 0

$dropHosts = @(
  "mollayazilim.com",
  "www.mollayazilim.com",
  "mollayazilim.com.tr",
  "www.mollayazilim.com.tr"
)

foreach ($line in $lines) {
  if ($line -match '^\s*#') {
    if ($line -match 'mollayazilim-local') { continue }
    $out.Add($line)
    continue
  }
  $parts = ($line -split '\s+') | Where-Object { $_ }
  if ($parts.Count -ge 2 -and $dropHosts -contains $parts[1]) {
    $removed++
    continue
  }
  $out.Add($line)
}

while ($out.Count -gt 0 -and [string]::IsNullOrWhiteSpace($out[$out.Count - 1])) {
  $out.RemoveAt($out.Count - 1)
}

Set-Content $hostsPath ($out -join "`r`n") -Encoding ASCII
Write-Host "[OK] Yerel hosts kaldirildi ($removed satir)" -ForegroundColor Green
Write-Host "  http://mollayazilim.com/ artik DNS uzerinden acilir" -ForegroundColor Green
exit 0
