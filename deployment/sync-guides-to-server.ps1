# Only for FIRST deployment or when intentionally replacing server-side JSON.
# Normal future edits should be made directly on /opt/baxterverse/config/reading-guides.json.
param([Parameter(Mandatory = $true)][string]$Server)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$config = Join-Path $PSScriptRoot 'config'
if (-not (Test-Path (Join-Path $config 'reading-guides.json'))) {
  throw 'Aucun JSON dans deployment/config/. Lance d abord apply.ps1.'
}
scp -r (Join-Path $config '*') "${Server}:/opt/baxterverse/config/"
if ($LASTEXITCODE -ne 0) { throw 'Transfert SCP du JSON echoue.' }
Write-Host 'Guides et images synchronises.'
