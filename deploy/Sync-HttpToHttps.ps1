#Requires -RunAsAdministrator
<#
  web.config HttpToHttps kuralini HTTPS durumuna gore ac/kapat.
  localhost muaf oldugu icin sadece domain kirilir; bu script duzeltir.
#>
param(
  [string]$SiteName = "mollayazilim.com",
  [string]$ConfigPath
)

$ErrorActionPreference = "Stop"

if (-not $ConfigPath) {
  $ConfigPath = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "web.config"
}

function Test-HttpsReady {
  param([string]$Site, [string]$HostName = "mollayazilim.com")

  Import-Module WebAdministration -ErrorAction Stop

  $httpsBindings = Get-WebBinding -Name $Site -ErrorAction SilentlyContinue |
    Where-Object { $_.protocol -eq "https" }

  if (-not $httpsBindings) {
    return $false
  }

  try {
    $req = [System.Net.HttpWebRequest]::Create("https://$HostName/")
    $req.Method = "HEAD"
    $req.AllowAutoRedirect = $true
    $req.Timeout = 12000
    $resp = $req.GetResponse()
    $code = [int]$resp.StatusCode
    $resp.Close()
    return ($code -ge 200 -and $code -lt 500)
  } catch {
    return $false
  }
}

function Set-HttpToHttpsRule {
  param(
    [string]$Path,
    [bool]$Enabled
  )

  if (-not (Test-Path $Path)) {
    throw "web.config bulunamadi: $Path"
  }

  $xml = Get-Content $Path -Raw -Encoding UTF8
  $hasRule = $xml -match 'name="HttpToHttps"'

  if ($Enabled) {
    if ($hasRule) {
      Write-Host "[OK] HttpToHttps acik (HTTPS calisiyor)" -ForegroundColor DarkGray
      return
    }

    $rule = @'
        <rule name="HttpToHttps" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{HTTPS}" pattern="off" ignoreCase="true" />
            <add input="{HTTP_HOST}" pattern="^localhost$" negate="true" />
            <add input="{HTTP_HOST}" pattern="^127\.0\.0\.1$" negate="true" />
            <add input="{URL}" pattern="^\.well-known/acme-challenge/" negate="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>
'@
    if ($xml -match '<rules>') {
      $xml = $xml -replace '(<rules>\s*)', "`$1`n$rule"
      Set-Content $Path $xml -Encoding UTF8
      Write-Host "[OK] HttpToHttps eklendi" -ForegroundColor Green
    }
    return
  }

  if (-not $hasRule) {
    Write-Host "[OK] HttpToHttps zaten kapali" -ForegroundColor DarkGray
    return
  }

  $pattern = '(?s)\s*<rule name="HttpToHttps"[^>]*>.*?</rule>\s*'
  $xml = [regex]::Replace($xml, $pattern, "`r`n")
  Set-Content $Path $xml -Encoding UTF8
  Write-Host "[OK] HttpToHttps kaldirildi (HTTPS hazir degil - http://$SiteName/ acilir)" -ForegroundColor Green
}

$ready = Test-HttpsReady -Site $SiteName
Set-HttpToHttpsRule -Path $ConfigPath -Enabled $ready
exit 0
