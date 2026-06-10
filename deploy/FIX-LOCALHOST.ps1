#Requires -RunAsAdministrator
<#
  localhost 403 / 404 / 500 / 502 duzeltme

  KUR.cmd (ilk kurulum) veya BASLAT.cmd tarafindan cagrilir.
#>
$ErrorActionPreference = "Continue"

function Test-Http {
  param([string]$Url)
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    return @{ Ok = $true; Code = $r.StatusCode; Len = $r.Content.Length }
  } catch {
    $code = $null
    try {
      if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    } catch { }
    return @{ Ok = $false; Code = $code; Err = $_.Exception.Message }
  }
}

function Ensure-Binding {
  param([string]$Site, [string]$HostHeader)
  $info = if ($HostHeader) { "*:80:$HostHeader" } else { "*:80:" }

  Get-Website | Where-Object { $_.Name -ne $Site } | ForEach-Object {
    $otherSite = $_.Name
    try {
      Get-WebBinding -Name $otherSite -Protocol http -ErrorAction SilentlyContinue |
        Where-Object { $_.bindingInformation -eq $info } |
        ForEach-Object {
          if ($HostHeader) {
            Remove-WebBinding -Name $otherSite -Protocol http -Port 80 -HostHeader $HostHeader -ErrorAction SilentlyContinue
          } else {
            Remove-WebBinding -Name $otherSite -Protocol http -Port 80 -HostHeader "" -ErrorAction SilentlyContinue
          }
          Write-Host "  - binding $info kaldirildi: $otherSite" -ForegroundColor Yellow
        }
    } catch {
      Write-Host "  ! binding temizleme atlandi ($otherSite): $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
  }

  $has = Get-WebBinding -Name $Site -ErrorAction SilentlyContinue | Where-Object { $_.bindingInformation -eq $info }
  if (-not $has) {
    try {
      if ($HostHeader) {
        New-WebBinding -Name $Site -Protocol http -Port 80 -HostHeader $HostHeader | Out-Null
      } else {
        New-WebBinding -Name $Site -Protocol http -Port 80 | Out-Null
      }
      Write-Host "  + binding $info" -ForegroundColor Green
    } catch {
      Write-Host "  ! binding eklenemedi ($info): $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

$siteName = "mollayazilim.com"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$poolName = "MollayazilimPool"

Write-Host "=== FIX localhost (403 / 404 / 500 / 502) ===" -ForegroundColor Cyan
Write-Host "Klasor: $AppRoot`n"

& "$PSScriptRoot\ENSURE-HOSTS.ps1"

# 1) ARR + URL Rewrite (IIS proxy icin zorunlu)
$arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
$arrScript = Join-Path $PSScriptRoot "Install-ARR-MSI.ps1"
if (-not (Test-Path $arrDll)) {
  Write-Host "IIS modulleri (URL Rewrite + ARR) kuruluyor..." -ForegroundColor Yellow
  if (-not (Test-Path $arrScript)) {
    Write-Host "(HATA) Script bulunamadi: $arrScript" -ForegroundColor Red
    exit 1
  }
  & $arrScript
  if ($LASTEXITCODE -ne 0) {
    Write-Host "(HATA) URL Rewrite veya ARR kurulamadi - IIS proxy calismaz." -ForegroundColor Red
    Write-Host "  Elle: winget install -e --id Microsoft.IIS.URLRewrite" -ForegroundColor Yellow
    Write-Host "  Elle: winget install -e --id Microsoft.IIS.ApplicationRequestRouting" -ForegroundColor Yellow
    exit 1
  }
}
if (-not (Test-Path $arrDll)) {
  Write-Host "(HATA) ARR hala yuklu degil." -ForegroundColor Red
  exit 1
}

Import-Module WebAdministration -ErrorAction Stop
Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" `
  -filter "system.webServer/proxy" -name "enabled" -value "True"
$appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
& $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
Write-Host "[OK] ARR proxy acik"

# 2) Default site kapat (wwwroot 403)
if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
  if ((Get-Website -Name "Default Web Site").State -eq "Started") {
    Stop-Website -Name "Default Web Site"
    Write-Host "[OK] Default Web Site durduruldu"
  }
}

# 3) Site + binding
if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
  & "$PSScriptRoot\Install-Mollayazilim-NextIIS.ps1"
}

Set-ItemProperty "IIS:\Sites\$siteName" -Name physicalPath -Value $AppRoot
Set-ItemProperty "IIS:\Sites\$siteName" -Name applicationPool -Value $poolName
if (-not (Get-IISAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
  New-WebAppPool -Name $poolName
  Set-ItemProperty "IIS:\AppPools\$poolName" -Name managedRuntimeVersion -Value ""
}
Restart-WebAppPool -Name $poolName

Write-Host "Bindings:"
Ensure-Binding -Site $siteName -HostHeader "localhost"
Ensure-Binding -Site $siteName -HostHeader "127.0.0.1"
Ensure-Binding -Site $siteName -HostHeader "mollayazilim.com"
Ensure-Binding -Site $siteName -HostHeader "www.mollayazilim.com"
Ensure-Binding -Site $siteName -HostHeader "mollayazilim.com.tr"
Ensure-Binding -Site $siteName -HostHeader "www.mollayazilim.com.tr"
Ensure-Binding -Site $siteName -HostHeader ""

Start-Website -Name $siteName

# 4) Node :3000
Set-Location $AppRoot
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
  Write-Host "Node baslatiliyor (PM2)..." -ForegroundColor Yellow
  if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "(HATA) PM2 yok: npm install -g pm2" -ForegroundColor Red
    exit 1
  }
  & "$PSScriptRoot\PM2-DUZELT.ps1"
  Start-Sleep -Seconds 5
}

$nodeOk = $false
for ($i = 1; $i -le 8; $i++) {
  $n = Test-Http "http://127.0.0.1:3000/"
  if ($n.Ok) {
    Write-Host "[OK] Node :3000 -> $($n.Code) ($($n.Len) byte)" -ForegroundColor Green
    $nodeOk = $true
    break
  }
  Write-Host "  Node bekleniyor [$i/8]..." -ForegroundColor DarkYellow
  Start-Sleep -Seconds 3
}
if (-not $nodeOk) {
  Write-Host "(HATA) Node calismiyor -> pm2 logs mollayazilim --lines 30 --nostream" -ForegroundColor Red
  exit 1
}

# 5) IIS ayarlarini uygula
Write-Host "IIS yeniden baslatiliyor (proxy ayarlari)..." -ForegroundColor Yellow
& $env:windir\system32\iisreset.exe /restart | Out-Null
Start-Sleep -Seconds 5

# 6) IIS test
Write-Host ""
$allOk = $true
foreach ($url in @("http://localhost/", "http://127.0.0.1/")) {
  $ok = $false
  for ($i = 1; $i -le 5; $i++) {
    $t = Test-Http $url
    if ($t.Ok) {
      Write-Host "[OK] $url -> $($t.Code)" -ForegroundColor Green
      $ok = $true
      break
    }
    if ($t.Code) {
      Write-Host "  [$i/5] $url -> HTTP $($t.Code)" -ForegroundColor DarkYellow
    } else {
      Write-Host "  [$i/5] $url -> $($t.Err)" -ForegroundColor DarkYellow
    }
    Start-Sleep -Seconds 3
  }
  if (-not $ok) {
    if ($t.Code) {
      Write-Host "[HATA] $url -> HTTP $($t.Code) $($t.Err)" -ForegroundColor Red
    } else {
      Write-Host "[HATA] $url -> $($t.Err)" -ForegroundColor Red
    }
    $allOk = $false
  }
}

if (-not $allOk) {
  Write-Host ""
  Write-Host "Hala hata varsa:" -ForegroundColor Yellow
  Write-Host "  1) KUR.cmd calistirin (Yonetici)"
  Write-Host "  2) pm2 logs mollayazilim --lines 30 --nostream"
  Write-Host "  3) Tarayici: http://localhost/"
  exit 1
}

Write-Host ""
Write-Host "Tamam. Ac: http://localhost/" -ForegroundColor Green
exit 0
