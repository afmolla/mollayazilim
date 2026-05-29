#Requires -RunAsAdministrator
<#
  ARR kur (winget yoksa MSI indir)
  Cagiran: tek-tikla.ps1, INSTALL-ARR.ps1
#>
$ErrorActionPreference = "Stop"

$arrDll = "${env:ProgramFiles}\IIS\Application Request Routing\requestrouter.dll"
if (Test-Path $arrDll) { return }

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Install-Msi {
  param([string]$Url, [string]$Name)
  $msi = Join-Path $env:TEMP $Name
  Write-Host "  Indiriliyor: $Name"
  Invoke-WebRequest -Uri $Url -OutFile $msi -UseBasicParsing
  Write-Host "  Kuruluyor: $Name"
  $p = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /qn /norestart" -Wait -PassThru
  if ($p.ExitCode -gt 2) { throw "MSI $Name cikis kodu: $($p.ExitCode)" }
  Start-Sleep -Seconds 3
}

# URL Rewrite (ARR onkosulu)
$rewriteKey = "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite"
if (-not (Test-Path $rewriteKey)) {
  Write-Host "URL Rewrite kuruluyor..."
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    winget install Microsoft.IIS.URLRewriteModule --accept-package-agreements --accept-source-agreements 2>$null
  }
  if (-not (Test-Path $rewriteKey)) {
    Install-Msi -Url "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D1232/IISRewrite_amd64.msi" -Name "IISRewrite_amd64.msi"
  }
}

# ARR 3.0 (winget ile ayni paket)
if (-not (Test-Path $arrDll)) {
  Write-Host "ARR kuruluyor..."
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    winget install Microsoft.IIS.ApplicationRequestRouting `
      --accept-package-agreements --accept-source-agreements 2>$null
  }
}

if (-not (Test-Path $arrDll)) {
  Install-Msi -Url "https://go.microsoft.com/fwlink/?LinkID=615136" -Name "requestRouter_amd64.msi"
}

if (-not (Test-Path $arrDll)) {
  throw "ARR kurulamadi. Elle indir: https://www.iis.net/downloads/microsoft/application-request-routing"
}

Write-Host "[OK] ARR yuklu" -ForegroundColor Green
