# Oto yikama vitrin gorsellerini indirir (VPS / ilk kurulum)
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\vitrin\otoyikama"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$imgs = @{
  "hero.jpg"     = "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920"
  "wash-1.jpg"   = "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "polish-1.jpg" = "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "ceramic-1.jpg"= "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "interior-1.jpg"="https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "luxury-1.jpg" = "https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "foam-1.jpg"   = "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "detail-1.jpg" = "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "shine-1.jpg"  = "https://images.pexels.com/photos/2445546/pexels-photo-2445546.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "garage-1.jpg" = "https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "side-1.jpg"   = "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=900"
  "side-2.jpg"   = "https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=600"
  "side-3.jpg"   = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600"
  "wide-1.jpg"   = "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1920"
  "wide-2.jpg"   = "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1920"
}

Write-Host "==> Oto yikama gorselleri: $dir"
foreach ($kv in $imgs.GetEnumerator()) {
  $out = Join-Path $dir $kv.Key
  $code = curl.exe -sL -A "Mozilla/5.0" -o $out $kv.Value -w "%{http_code}"
  $len = (Get-Item $out).Length
  if ($code -ne "200" -or $len -lt 5000) {
    Write-Host "HATA $($kv.Key) HTTP $code size $len" -ForegroundColor Red
    exit 1
  }
  Write-Host "OK $($kv.Key) ($len bytes)"
}
Write-Host "Tamam."
