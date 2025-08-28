param(
  [string]$BackendDir = "backend",
  [string]$EnvFile = "backend/.env",
  [string]$ApiBase = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"

# Import shell theme (brand colors)
. "$PSScriptRoot/shell_theme.ps1"

function Assert-FileExists($path) {
  if (-not (Test-Path $path)) {
    throw "Missing file: $path"
  }
}

function Read-Env($path) {
  $vars = @{}
  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
      $kv = $line -split '=', 2
      if ($kv.Count -eq 2) { $vars[$kv[0].Trim()] = $kv[1].Trim() }
    }
  }
  return $vars
}

Write-Step "[1/6] Checking backend env file: $EnvFile"
Assert-FileExists $EnvFile
$envMap = Read-Env $EnvFile

$required = @("ADMIN_EMAIL","ADMIN_PASSWORD","JWT_SECRET","CORS_ALLOW_ORIGINS")
$missing = @()
foreach ($k in $required) { if (-not $envMap.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($envMap[$k])) { $missing += $k } }
if ($missing.Count -gt 0) { throw "Missing required env vars in ${EnvFile}: $($missing -join ', ')" }

Write-Step "[2/6] Ensuring Alembic can run" 
Assert-FileExists (Join-Path $BackendDir "alembic.ini")

# Prefer root venv Python using absolute path (repo root = parent of scripts/)
$RepoRoot = Split-Path -Parent $PSScriptRoot
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$PythonExe = "python"
if (Test-Path $VenvPython) { $PythonExe = $VenvPython }

Push-Location $BackendDir
try {
  Write-Step "[3/6] Running Alembic upgrade head"
  & $PythonExe -m alembic -c alembic.ini upgrade head | Out-Host
}
finally {
  Pop-Location
}

Write-Step "[4/6] Smoke test: POST /api/v1/auth/login"
$loginBody = @{
  email = $envMap["ADMIN_EMAIL"].Trim('"')
  password = $envMap["ADMIN_PASSWORD"].Trim('"')
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Method POST -Uri "$ApiBase/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
if (-not $loginResp.access_token) { throw "Login failed: no access_token returned" }

Write-Step "[5/6] Smoke test: GET /api/v1/auth/me"
$me = Invoke-RestMethod -Method GET -Uri "$ApiBase/api/v1/auth/me" -Headers @{ Authorization = "Bearer $($loginResp.access_token)" }
if (-not $me.email) { throw "Auth me failed" }

Write-Success "[6/6] Success: Backend QA passed for $($me.email)"
