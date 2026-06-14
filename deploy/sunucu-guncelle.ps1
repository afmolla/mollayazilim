#Requires -Version 5.1
<#
  Geriye uyumluluk (GitHub Actions vb.) — asil is YENIDEN-BASLAT.cmd / site-yeniden-baslat.ps1
#>
& (Join-Path $PSScriptRoot "site-yeniden-baslat.ps1")
exit $LASTEXITCODE
