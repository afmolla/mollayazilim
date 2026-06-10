#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$marker = "# mollayazilim-local"

if (-not (Test-Path $hostsPath)) { exit 0 }

$lines = Get-Content $hostsPath
$out = New-Object System.Collections.Generic.List[string]
$skip = $false

foreach ($line in $lines) {
  if ($line -match [regex]::Escape($marker)) {
    $skip = -not $skip
    continue
  }
  if ($skip) { continue }
  if ($line -match 'mollayazilim\.com') { continue }
  if ($line -match 'mollayazilim\.com\.tr') { continue }
  $out.Add($line)
}

Set-Content $hostsPath ($out -join "`r`n") -Encoding ASCII
Write-Host "[OK] Yerel hosts kaldirildi" -ForegroundColor Green
Write-Host "  Simdi test: http://mollayazilim.com/" -ForegroundColor Green
Write-Host "  NOT: https:// henuz yok — http:// yaz" -ForegroundColor Yellow
