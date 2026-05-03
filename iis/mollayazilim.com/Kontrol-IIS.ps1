# IIS'te mollayazilim.com var mı — hızlı kontrol (Yönetici gerekmez genelde)
Import-Module WebAdministration -ErrorAction Stop

$siteName = "mollayazilim.com"
$s = Get-Website -Name $siteName -ErrorAction SilentlyContinue

if (-not $s) {
  Write-Host "BULUNAMADI: '$siteName' IIS listesinde yok." -ForegroundColor Red
  Write-Host "`nTüm siteler:"
  Get-Website | Select-Object Name, State, physicalPath | Format-Table -AutoSize
  Write-Host "`nKurmak için (PowerShell YÖNETİCİ olarak): .\Install-MollayazilimSite.ps1"
  exit 1
}

Write-Host "SITE VAR: $siteName" -ForegroundColor Green
Write-Host "Durum    :" $s.State
Write-Host "Klasör   :" $s.physicalPath
Write-Host "`nBağlamalar:"
Get-WebBinding -Name $siteName | ForEach-Object { Write-Host " " $_.protocol $_.bindingInformation }
exit 0
