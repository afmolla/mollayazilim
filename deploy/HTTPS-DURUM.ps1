#Requires -Version 5.1
<#
  mollayazilim.com SSL durumunu kontrol eder (uzaktan).
  Ornek: powershell -File deploy\HTTPS-DURUM.ps1
#>
$ErrorActionPreference = "Continue"
$hostName = "mollayazilim.com"

Write-Host "=== SSL durum: $hostName ===" -ForegroundColor Cyan
try {
  $dns = (Resolve-DnsName $hostName -Type A -ErrorAction Stop | Select-Object -First 1).IPAddress
  Write-Host "DNS A kaydi: $dns" -ForegroundColor Gray
} catch {
  Write-Host "DNS cozulemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

try {
  $req = [System.Net.HttpWebRequest]::Create("https://$hostName/")
  $req.AllowAutoRedirect = $true
  $req.Timeout = 20000
  $req.GetResponse() | Out-Null
  $leaf = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($req.ServicePoint.Certificate)
  $chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
  $chain.ChainPolicy.RevocationMode = [System.Security.Cryptography.X509Certificates.X509RevocationMode]::NoCheck
  $ok = $chain.Build($leaf)

  Write-Host ""
  Write-Host "Leaf  : $($leaf.Subject)" -ForegroundColor White
  Write-Host "Issuer: $($leaf.Issuer)" -ForegroundColor White
  Write-Host "Gecerlilik: $($leaf.NotBefore.ToString('yyyy-MM-dd')) -> $($leaf.NotAfter.ToString('yyyy-MM-dd'))" -ForegroundColor White
  Write-Host "Windows zincir: $(if ($ok) { 'GECERLI' } else { 'GECERSIZ' })" -ForegroundColor $(if ($ok) { 'Green' } else { 'Red' })

  Write-Host ""
  Write-Host "Zincir:" -ForegroundColor Cyan
  for ($i = 0; $i -lt $chain.ChainElements.Count; $i++) {
    $c = $chain.ChainElements[$i].Certificate
    Write-Host "  [$i] $($c.Subject)" -ForegroundColor Gray
    Write-Host "      $($c.Issuer)" -ForegroundColor DarkGray
  }

  if ($leaf.Issuer -match "YR1|Root YR") {
    Write-Host ""
    Write-Host "SORUN: Sahte YR1 zinciri. Chrome Guvenli degil gosterir." -ForegroundColor Red
    Write-Host "COZUM: Canli sunucuda Yonetici olarak KUR.cmd calistirin." -ForegroundColor Yellow
    exit 2
  }

  if ($leaf.Issuer -match "R10|R11|R3|E1|E5") {
    Write-Host ""
    Write-Host "OK: Gercek Let's Encrypt araci sertifikasi." -ForegroundColor Green
    exit 0
  }

  Write-Host ""
  Write-Host "UYARI: Bilinmeyen veren. Chrome davranisini kontrol edin." -ForegroundColor Yellow
  exit 1
} catch {
  Write-Host "HTTPS hatasi: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
