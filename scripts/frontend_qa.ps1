param(
  [string]$FrontendDir = "frontend",
  [string]$EnvFile = "frontend/.env.local",
  [string]$BackendHost = "http://localhost:8000"
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
  if (Test-Path $path) {
    Get-Content $path | ForEach-Object {
      $line = $_.Trim()
      if ($line -and -not $line.StartsWith('#')) {
        $kv = $line -split '=', 2
        if ($kv.Count -eq 2) { $vars[$kv[0].Trim()] = $kv[1].Trim() }
      }
    }
  }
  return $vars
}

Write-Step "[1/5] Checking frontend env file: $EnvFile"
$envMap = Read-Env $EnvFile
if (-not $envMap.ContainsKey("VITE_API_BASE_URL") -or [string]::IsNullOrWhiteSpace($envMap["VITE_API_BASE_URL"])) {
  throw "VITE_API_BASE_URL is missing in $EnvFile. Add: VITE_API_BASE_URL=$BackendHost"
}

$api = $envMap["VITE_API_BASE_URL"].Trim('"')
Write-Step "[2/5] Verifying API base URL: $api"

Write-Step "[3/5] Backend login smoke using configured API"
# We reuse backend creds from backend/.env if present
$beEnv = Read-Env "backend/.env"
if (-not ($beEnv.ContainsKey("ADMIN_EMAIL") -and $beEnv.ContainsKey("ADMIN_PASSWORD"))) {
  throw "backend/.env missing ADMIN_EMAIL/ADMIN_PASSWORD required for smoke login"
}

$loginBody = @{
  email = $beEnv["ADMIN_EMAIL"].Trim('"')
  password = $beEnv["ADMIN_PASSWORD"].Trim('"')
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Method POST -Uri "$api/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
if (-not $loginResp.access_token) { throw "Login failed: no access_token returned" }

Write-Step "[4/5] Verify token with /auth/me"
$me = Invoke-RestMethod -Method GET -Uri "$api/api/v1/auth/me" -Headers @{ Authorization = "Bearer $($loginResp.access_token)" }
if (-not $me.email) { throw "Auth me failed" }

Write-Success "[5/5] Success: Frontend QA passed (API reachable @ $api for $($me.email))"
