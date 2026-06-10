#Requires -RunAsAdministrator
<#
  URL Rewrite + ARR kur (winget veya MSI)
  Cagiran: FIX-LOCALHOST.ps1, KUR.cmd
#>
$ErrorActionPreference = "Continue"

$arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
$rewriteKey = "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite"

function Test-UrlRewriteInstalled {
  if (Test-Path $rewriteKey) { return $true }
  try {
    Import-Module WebAdministration -ErrorAction Stop
    $mod = Get-WebGlobalModule -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "RewriteModule" }
    return [bool]$mod
  } catch {
    return $false
  }
}

function Test-ArrInstalled {
  return Test-Path $arrDll
}

function Try-WingetInstall {
  param([string]$Id, [string]$Label)
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) { return $false }
  Write-Host "  winget: $Label..." -ForegroundColor DarkGray
  & winget install -e --id $Id `
    --accept-package-agreements --accept-source-agreements --disable-interactivity 2>&1 | Out-Host
  return ($LASTEXITCODE -eq 0)
}

function Install-MsiFromUrl {
  param(
    [string[]]$Urls,
    [string]$Name
  )
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $msi = Join-Path $env:TEMP $Name

  foreach ($url in $Urls) {
    try {
      Write-Host "  Indiriliyor: $Name" -ForegroundColor DarkGray
      Write-Host "    $url" -ForegroundColor DarkGray
      Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing -TimeoutSec 120
      if (-not (Test-Path $msi) -or (Get-Item $msi).Length -lt 100000) {
        Write-Host "  ! Gecersiz dosya, sonraki URL deneniyor..." -ForegroundColor Yellow
        continue
      }
      Write-Host "  Kuruluyor: $Name" -ForegroundColor Yellow
      $p = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait -PassThru
      if ($p.ExitCode -le 2) {
        Start-Sleep -Seconds 3
        return $true
      }
      Write-Host "  ! MSI cikis kodu: $($p.ExitCode)" -ForegroundColor Yellow
    } catch {
      Write-Host "  ! Indirme/kurulum hatasi: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
  return $false
}

$needRewrite = -not (Test-UrlRewriteInstalled)
$needArr = -not (Test-ArrInstalled)

if (-not $needRewrite -and -not $needArr) {
  Write-Host "[OK] URL Rewrite + ARR zaten yuklu" -ForegroundColor Green
  exit 0
}

Write-Host "=== IIS modulleri kuruluyor ===" -ForegroundColor Cyan

if ($needRewrite) {
  Write-Host "URL Rewrite kuruluyor..." -ForegroundColor Yellow
  if (-not (Try-WingetInstall -Id "Microsoft.IIS.URLRewrite" -Label "URL Rewrite")) {
    $ok = Install-MsiFromUrl -Name "rewrite_amd64_en-US.msi" -Urls @(
      "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi",
      "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D1232/IISRewrite_amd64.msi"
    )
    if (-not $ok) {
      Write-Host "(HATA) URL Rewrite kurulamadi." -ForegroundColor Red
      Write-Host "  Elle: winget install -e --id Microsoft.IIS.URLRewrite" -ForegroundColor Yellow
      Write-Host "  veya: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
      exit 1
    }
  }
  if (Test-UrlRewriteInstalled) {
    Write-Host "[OK] URL Rewrite yuklu" -ForegroundColor Green
  } else {
    Write-Host "(HATA) URL Rewrite kurulumu dogrulanamadi" -ForegroundColor Red
    exit 1
  }
}

if ($needArr) {
  Write-Host "ARR kuruluyor..." -ForegroundColor Yellow
  if (-not (Try-WingetInstall -Id "Microsoft.IIS.ApplicationRequestRouting" -Label "ARR")) {
    $ok = Install-MsiFromUrl -Name "requestRouter_amd64.msi" -Urls @(
      "https://go.microsoft.com/fwlink/?LinkID=615136",
      "https://download.microsoft.com/download/D/43/D43F4D1D-6B8E-4F3F-A1B5-8C0E8E8E8E8E/requestRouter_amd64.msi"
    )
    if (-not $ok) {
      Write-Host "(HATA) ARR kurulamadi." -ForegroundColor Red
      Write-Host "  Elle: winget install -e --id Microsoft.IIS.ApplicationRequestRouting" -ForegroundColor Yellow
      Write-Host "  veya: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Yellow
      exit 1
    }
  }
  if (Test-ArrInstalled) {
    Write-Host "[OK] ARR yuklu" -ForegroundColor Green
  } else {
    Write-Host "(HATA) ARR kurulumu dogrulanamadi" -ForegroundColor Red
    exit 1
  }
}

exit 0
