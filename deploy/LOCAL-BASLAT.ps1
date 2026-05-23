#Requires -Version 5.1
<#
  Yerel / VPS: IIS uzerinden http://localhost (port 80) — tarayicida :3000 yok.

  1) Bir kez (Yonetici): .\Install-Mollayazilim-NextIIS.ps1
  2) Her calistirma: .\LOCAL-BASLAT.ps1

  Node arka planda 127.0.0.1:3000 (PM2); sen http://localhost acarsin.
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $AppRoot

Write-Host "=== IIS modu: http://localhost ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot"

& (Join-Path $PSScriptRoot "VPS-BASLAT.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

try {
  $r = Invoke-WebRequest "http://localhost/" -UseBasicParsing -TimeoutSec 30
  Write-Host "IIS OK: http://localhost/ -> $($r.StatusCode)" -ForegroundColor Green
}
catch {
  Write-Host "IIS henuz yanit vermiyor: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Kontrol: IIS sitesi Started mi? ARR proxy acik mi?"
  Write-Host "  deploy\Install-Mollayazilim-NextIIS.ps1 (Yonetici)"
}

Write-Host ""
Write-Host "Tarayici: http://localhost/"
Write-Host "Canli:    https://mollayazilim.com/"
