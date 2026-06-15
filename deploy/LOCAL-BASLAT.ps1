#Requires -Version 5.1
<#
  http://localhost/ — site ac (BASLAT.cmd cagirir)
  PM2 + Node :3000 + IIS test + tarayici
#>
$ErrorActionPreference = "Continue"
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Eco = Join-Path $AppRoot "deploy\ecosystem-iis.config.cjs"
$Pm2Name = "mollayazilim"
$Port = 3000

function Test-IsAdministrator {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $p = New-Object Security.Principal.WindowsPrincipal($id)
  return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-HttpStatusCodeFromError {
  param($ErrorRecord)
  try {
    if ($ErrorRecord.Exception.Response -and $ErrorRecord.Exception.Response.StatusCode) {
      return [int]$ErrorRecord.Exception.Response.StatusCode
    }
  } catch { }
  return $null
}

function Test-HttpUrl {
  param(
    [string]$Url,
    [int]$TimeoutSec = 20
  )
  try {
    $r = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    return @{ Ok = $true; Code = $r.StatusCode }
  } catch {
    return @{
      Ok = $false
      Code = (Get-HttpStatusCodeFromError $_)
      Error = $_.Exception.Message
    }
  }
}

function Wait-HttpOk {
  param(
    [string]$Url,
    [string]$Label,
    [int]$MaxAttempts = 10,
    [int]$DelaySec = 3
  )

  for ($i = 1; $i -le $MaxAttempts; $i++) {
    $t = Test-HttpUrl -Url $Url
    if ($t.Ok) {
      Write-Host "(OK) $Label status $($t.Code)" -ForegroundColor Green
      return $true
    }
    if ($t.Code) {
      Write-Host "  [$i/$MaxAttempts] $Label status $($t.Code)..." -ForegroundColor DarkYellow
    } else {
      Write-Host "  [$i/$MaxAttempts] $Label - $($t.Error)" -ForegroundColor DarkYellow
    }
    if ($i -lt $MaxAttempts) { Start-Sleep -Seconds $DelaySec }
  }

  if ($t.Code) {
    Write-Host "(HATA) $Label status $($t.Code) - $($t.Error)" -ForegroundColor Red
  } else {
    Write-Host "(HATA) $Label - $($t.Error)" -ForegroundColor Red
  }
  return $false
}

function Invoke-LocalhostRepair {
  param([string]$Reason)

  $fixScript = Join-Path $PSScriptRoot "FIX-LOCALHOST.ps1"
  if (-not (Test-Path $fixScript)) {
    Write-Host "(HATA) Duzeltme scripti bulunamadi: $fixScript" -ForegroundColor Red
    return $false
  }

  Write-Host ""
  Write-Host "IIS localhost hatasi algilandi: $Reason" -ForegroundColor Yellow
  Write-Host "IIS onarimi calistiriliyor..." -ForegroundColor Yellow

  try {
    if (Test-IsAdministrator) {
      & $fixScript
      $code = $LASTEXITCODE
      if ($null -eq $code -or $code -eq 0) { return $true }
      Write-Host "(HATA) IIS duzeltme cikis kodu: $code" -ForegroundColor Red
      return $false
    }

    $p = Start-Process -FilePath "powershell.exe" `
      -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$fixScript`"") `
      -Verb RunAs -Wait -PassThru
    if ($p.ExitCode -ne 0) {
      Write-Host "(HATA) IIS duzeltme cikis kodu: $($p.ExitCode)" -ForegroundColor Red
      return $false
    }
    return $true
  } catch {
    Write-Host "(HATA) IIS onarimi baslatilamadi: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

function Test-NodeHealthy {
  param([int]$PortNum = $Port)
  $t = Test-HttpUrl -Url "http://127.0.0.1:$PortNum/" -TimeoutSec 5
  return $t.Ok
}

$SiteUrl = "http://mollayazilim.com/"
$AmbalajUrl = "http://localhost/ambalaj"

function Test-HostsActive {
  param([string]$Domain)
  try {
    $hostsText = Get-Content "$env:SystemRoot\System32\drivers\etc\hosts" -ErrorAction Stop
    foreach ($line in $hostsText) {
      if ($line -match '^\s*#') { continue }
      if ($line -match [regex]::Escape($Domain)) {
        if ($Domain -eq "mollayazilim.com" -and $line -match 'crm\.mollayazilim') { continue }
        return $true
      }
    }
  } catch { }
  return $false
}

Set-Location $AppRoot

if (Test-IsAdministrator) {
  & (Join-Path $PSScriptRoot "ENSURE-HOSTS.ps1")
}

$domainLocal = Test-HostsActive "mollayazilim.com"

Write-Host "=== Siteyi ac ===" -ForegroundColor Cyan
Write-Host "Ambalaj: http://localhost/ambalaj" -ForegroundColor Cyan
if ($domainLocal) {
  Write-Host "$SiteUrl  (port yok, :3000 kullanma)" -ForegroundColor Cyan
} else {
  Write-Host "(mollayazilim.com hosts kapali - localhost kullaniliyor)" -ForegroundColor DarkGray
}
Write-Host ""

if (-not (Test-Path (Join-Path $AppRoot ".next\BUILD_ID"))) {
  Write-Host "Build eksik - kaynak kontrol..." -ForegroundColor Yellow
  & (Join-Path $PSScriptRoot "Verify-Source.ps1")
  if ($LASTEXITCODE -ne 0) { exit 1 }
  Write-Host "npm run build..." -ForegroundColor Yellow
  $env:NODE_ENV = "production"
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $procId = $_.OwningProcess
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
  $cmd = if ($proc) { $proc.CommandLine } else { "" }
  if ($cmd -notmatch "next" -and $cmd -notmatch "start-next") {
    Write-Host "Port $Port temizleniyor (PID $procId)..." -ForegroundColor Yellow
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 1

if (-not (Get-Command pm2.cmd -ErrorAction SilentlyContinue)) {
  Write-Host "PM2 yok: npm install -g pm2" -ForegroundColor Red
  exit 1
}

$has = cmd /c "pm2.cmd jlist" 2>$null | Select-String -Pattern $Pm2Name -Quiet
$nodeAlreadyOk = Test-NodeHealthy
$nodeExposed = $false
Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.LocalAddress -eq "0.0.0.0" -or $_.LocalAddress -eq "::") {
    $nodeExposed = $true
  }
}

if ($has -and $nodeAlreadyOk -and -not $nodeExposed) {
  Write-Host "(OK) Node arka planda calisiyor (sadece 127.0.0.1)" -ForegroundColor Green
} elseif ($has) {
  Write-Host "PM2 yeniden baslatiliyor (BIND_HOST=127.0.0.1)..." -ForegroundColor Yellow
  cmd /c "pm2.cmd delete $Pm2Name" 2>$null
  cmd /c "pm2.cmd start `"$Eco`" --update-env"
  cmd /c "pm2.cmd save" 2>$null
  Start-Sleep -Seconds 8
} else {
  Write-Host "PM2 ilk baslatma..." -ForegroundColor Yellow
  cmd /c "pm2.cmd start `"$Eco`" --update-env"
  cmd /c "pm2.cmd save" 2>$null
  Start-Sleep -Seconds 8
}

$nodeOk = Wait-HttpOk -Url "http://127.0.0.1:$Port/" -Label "Node (ic)" -MaxAttempts 12 -DelaySec 3
if (-not $nodeOk) {
  cmd /c "pm2.cmd logs $Pm2Name --lines 15 --nostream" 2>$null
  exit 1
}

$openUrl = $null
if ($domainLocal -and (Wait-HttpOk -Url $SiteUrl -Label "mollayazilim.com" -MaxAttempts 4 -DelaySec 2)) {
  $openUrl = $SiteUrl
} elseif (Wait-HttpOk -Url "http://localhost/" -Label "localhost" -MaxAttempts 4 -DelaySec 2) {
  $openUrl = "http://localhost/"
}
if ($openUrl -and (Wait-HttpOk -Url $AmbalajUrl -Label "ambalaj" -MaxAttempts 4 -DelaySec 2)) {
  Write-Host "(OK) Ambalaj: $AmbalajUrl" -ForegroundColor Green
}
if ($openUrl) {
  Write-Host ""
  Write-Host "Tarayici: $openUrl" -ForegroundColor Green
  Write-Host "Ambalaj:  $AmbalajUrl" -ForegroundColor Green
  Start-Process $AmbalajUrl
  exit 0
}

$last = if ($domainLocal) { Test-HttpUrl -Url $SiteUrl } else { @{ Ok = $false } }
if (-not $last.Ok) { $last = Test-HttpUrl -Url "http://localhost/" }
$repairReason = if ($last.Code) { "HTTP $($last.Code)" } else { $last.Error }
if (Invoke-LocalhostRepair -Reason $repairReason) {
  Start-Sleep -Seconds 5
  $openUrl = $null
  if ($domainLocal -and (Wait-HttpOk -Url $SiteUrl -Label "mollayazilim.com" -MaxAttempts 4 -DelaySec 2)) {
    $openUrl = $SiteUrl
  } elseif (Wait-HttpOk -Url "http://localhost/" -Label "localhost" -MaxAttempts 4 -DelaySec 2) {
    $openUrl = "http://localhost/"
  }
  if ($openUrl -and (Wait-HttpOk -Url $AmbalajUrl -Label "ambalaj" -MaxAttempts 4 -DelaySec 2)) {
    Write-Host "(OK) Ambalaj: $AmbalajUrl" -ForegroundColor Green
  }
  if ($openUrl) {
    Write-Host ""
    Write-Host "Tarayici: $openUrl" -ForegroundColor Green
    Write-Host "Ambalaj:  $AmbalajUrl" -ForegroundColor Green
    Start-Process $AmbalajUrl
    exit 0
  }
}

Write-Host ""
Write-Host "Cozum: KUR.cmd calistirin  (Yonetici)" -ForegroundColor Yellow
exit 2
