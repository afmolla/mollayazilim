#Requires -Version 5.1
<#
  mollayazilim.com SSL yardimcilari - CRM scriptleri de bunu kullanir.
  SNI: her domain ayri host header (*:443:mollayazilim.com vs *:443:crm...)
#>

function Get-MollaCertificate {
  $found = @()
  foreach ($store in @("Cert:\LocalMachine\WebHosting", "Cert:\LocalMachine\My")) {
    $found += Get-ChildItem $store -ErrorAction SilentlyContinue | Where-Object {
      $iss = [string]$_.Issuer
      $fn = [string]$_.FriendlyName
      $subj = [string]$_.Subject
      $iss -notmatch "YR1|Root YR" -and
      $fn -notlike "crm.*" -and
      $subj -notlike "*crm.mollayazilim*" -and (
        $fn -like "mollayazilim.com*" -or
        $subj -like "CN=mollayazilim.com*" -or
        $subj -like "CN=www.mollayazilim.com*" -or
        $subj -like "*mollayazilim.com.tr*"
      )
    }
  }
  $found = @($found | Sort-Object NotAfter -Descending)
  if ($found.Count -eq 0) { return $null }
  $withKey = $found | Where-Object { $_.HasPrivateKey } | Select-Object -First 1
  if ($withKey) { return $withKey }
  return $found | Select-Object -First 1
}

function Install-MollaHttpsBindings {
  param(
    [string]$SiteName = "mollayazilim.com",
    [string[]]$HostHeaders = @(
      "mollayazilim.com",
      "www.mollayazilim.com",
      "mollayazilim.com.tr",
      "www.mollayazilim.com.tr"
    ),
    $Cert
  )

  Import-Module WebAdministration -ErrorAction Stop
  $thumb = $Cert.Thumbprint
  $iisAppId = "{4dc3e181-e14b-4a21-b982-7cc71b20b5a4}"
  $storeName = if (Get-ChildItem "Cert:\LocalMachine\WebHosting\$thumb" -ErrorAction SilentlyContinue) { "WebHosting" } else { "My" }

  foreach ($hh in $HostHeaders) {
    $info = "*:443:$hh"
    if (-not (Get-WebBinding -Name $SiteName -ErrorAction SilentlyContinue | Where-Object { $_.bindingInformation -eq $info })) {
      New-WebBinding -Name $SiteName -Protocol https -Port 443 -HostHeader $hh | Out-Null
      Write-Host "  + $info" -ForegroundColor Green
    }
    try {
      $b = Get-WebBinding -Name $SiteName -Protocol https -HostHeader $hh -ErrorAction Stop
      $b.AddSslCertificate($thumb, $storeName)
      Write-Host "  [OK] SSL $hh" -ForegroundColor Green
    } catch {
      foreach ($prefix in @("0.0.0.0", "::")) {
        $hp = "${prefix}:443:$hh"
        cmd /c "netsh http delete sslcert hostnameport=$hp" 2>$null | Out-Null
        cmd /c "netsh http add sslcert hostnameport=$hp certhash=$thumb appid=$iisAppId certstorename=$storeName" 2>$null | Out-Null
      }
      Write-Host "  [OK] netsh $hh" -ForegroundColor Green
    }
  }
}

function Test-MollaSslCert {
  param([string]$Url = "https://mollayazilim.com/")

  $req = $null
  try {
    $req = [System.Net.HttpWebRequest]::Create($Url)
    $req.AllowAutoRedirect = $true
    $req.Timeout = 20000
    $resp = $req.GetResponse()
    $resp.Close()
  } catch [System.Net.WebException] {
    if (-not $_.Exception.Response) { return $false }
  } catch {
    return $false
  }

  if (-not $req.ServicePoint.Certificate) { return $false }

  try {
    $leaf = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($req.ServicePoint.Certificate)
    if ([string]$leaf.Issuer -match "YR1|Root YR") { return $false }
    if ([string]$leaf.Subject -like "*crm.mollayazilim*") { return $false }
    if ([string]$leaf.Subject -notlike "*mollayazilim.com*") { return $false }

    $chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
    $chain.ChainPolicy.RevocationMode = [System.Security.Cryptography.X509Certificates.X509RevocationMode]::NoCheck
    return $chain.Build($leaf)
  } catch {
    return $false
  }
}

function Repair-MollayazilimSsl {
  param([string]$MollaRoot = "C:\inetpub\wwwroot\mollayazilim")

  Write-Host ""
  Write-Host "=== Ana site SSL onarimi (mollayazilim.com) ===" -ForegroundColor Cyan

  $cert = Get-MollaCertificate
  if (-not $cert) {
    Write-Host "(HATA) mollayazilim.com sertifikasi store'da yok" -ForegroundColor Red
    Write-Host "  Calistir: C:\inetpub\wwwroot\mollayazilim\SERTIFIKA-YUKLE.cmd" -ForegroundColor Yellow
    return $false
  }

  Write-Host "[OK] Sertifika: $($cert.FriendlyName)" -ForegroundColor Green
  Write-Host "     $($cert.Subject)" -ForegroundColor DarkGray

  Install-MollaHttpsBindings -Cert $cert
  Start-Sleep -Seconds 2

  if (Test-MollaSslCert) {
    Write-Host "[OK] mollayazilim.com TLS guvenilir" -ForegroundColor Green
    return $true
  }

  Write-Host "(HATA) mollayazilim.com hala guvenilir degil" -ForegroundColor Red
  return $false
}
