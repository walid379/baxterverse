# Rebuild and deploy ONLY the Vue UI. No Java, Gradle, or JAR rebuild.
# Usage (PowerShell, from anywhere):
# .\deployment\deploy-frontend.ps1 -Server 'your-user@your-host'
param(
  [Parameter(Mandatory = $true)][string]$Server,
  [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$webui = Join-Path $repo 'komga-webui'
$dist = Join-Path $webui 'dist'

if (-not $SkipBuild) {
  Push-Location $webui
  try {
    npm run build:standalone
    if ($LASTEXITCODE -ne 0) { throw 'Build frontend echoue.' }
  } finally { Pop-Location }
}
if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  throw "index.html absent dans $dist. Lance npm run build:standalone."
}

# scp copies files but does not remove old hashed bundles. They are harmless.
scp -r (Join-Path $dist '*') "${Server}:/opt/baxterverse/webui/"
if ($LASTEXITCODE -ne 0) { throw 'Transfert SCP echoue.' }
Write-Host 'Frontend deploye. Le JAR Komga n a pas ete modifie.'
Write-Host 'Si la version affichee est ancienne, rafraichis avec Ctrl+F5.'
