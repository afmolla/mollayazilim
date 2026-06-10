#Requires -RunAsAdministrator
<#
  HTTPS calismiyorsa HTTP->HTTPS yonlendirmesini kaldir.
  Boylece http://mollayazilim.com/ tekrar acilir.
#>
$ErrorActionPreference = "Stop"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$config = Join-Path $AppRoot "web.config"

if (-not (Test-Path $config)) {
  Write-Host "(HATA) web.config bulunamadi" -ForegroundColor Red
  exit 1
}

$xml = Get-Content $config -Raw -Encoding UTF8
if ($xml -notmatch 'name="HttpToHttps"') {
  Write-Host "[OK] HTTP->HTTPS yonlendirme zaten yok" -ForegroundColor DarkGray
  exit 0
}

$pattern = '(?s)\s*<rule name="HttpToHttps"[^>]*>.*?</rule>\s*'
$xml = [regex]::Replace($xml, $pattern, "`n")
Set-Content $config $xml -Encoding UTF8
Write-Host "[OK] HTTP->HTTPS yonlendirme kaldirildi" -ForegroundColor Green
Write-Host "  http://mollayazilim.com/ tekrar calismali" -ForegroundColor Green
exit 0
