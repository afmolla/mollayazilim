param(
  [string]$Url = "http://localhost/",
  [int]$TimeoutSec = 5
)

$ErrorActionPreference = "Stop"

try {
  $res = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec $TimeoutSec
  $code = [int]$res.StatusCode
  if ($code -ge 200 -and $code -lt 500) {
    Write-Output "OK ($code) $Url"
    exit 0
  }
  Write-Output "FAIL ($code) $Url"
  exit 2
} catch {
  Write-Output "FAIL (exception) $Url"
  exit 1
}

