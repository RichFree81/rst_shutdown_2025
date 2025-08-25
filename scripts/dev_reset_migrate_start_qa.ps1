param(
  [switch]$ResetDb = $false,
  [string]$ApiHost = "127.0.0.1",
  [int]$Port = 8000,
  [switch]$NoReload = $false
)

$ErrorActionPreference = "Stop"

# Import shell theme (brand colors)
. "$PSScriptRoot/shell_theme.ps1"

function Require-File($path, $message) {
  if (-not (Test-Path $path)) { throw $message }
}

Write-Header "=== my_cloud_api: Dev Cleanup + Migrate + Start + QA ==="
Write-Subtle "Repo root: $(Get-Location)"

# 0) Preconditions
Require-File ".\.venv\Scripts\python.exe" ".venv python not found at .\\.venv\\Scripts\\python.exe"
Require-File "backend\alembic.ini" "backend/alembic.ini not found"
Require-File "scripts\backend_qa.ps1" "scripts/backend_qa.ps1 not found"
Require-File "backend\.env" "backend/.env not found"

# 1) Stop any running uvicorn for this repo (best effort)
Write-Step "[1/7] Stopping any running uvicorn (best effort)"
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object {
  $_.CommandLine -match "uvicorn" -and $_.CommandLine -match "my_cloud_api" -and $_.CommandLine -match "\\\.venv\\\\Scripts\\\\python.exe"
} | ForEach-Object {
  try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; Write-Subtle "  - Stopped PID $($_.ProcessId)" } catch {}
}

# 2) Cleanup folders
Write-Step "[2/7] Cleaning folders"
if (Test-Path ".data") {
  Get-ChildItem -LiteralPath ".\.data" -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object { try { $_.IsReadOnly = $false } catch {} }
  Remove-Item ".data" -Recurse -Force
  Write-Subtle "  - Removed repo-root .data folder"
} else { Write-Subtle "  - No repo-root .data folder present" }

if (-not (Test-Path "backend/.data")) {
  New-Item -ItemType Directory -Path "backend/.data" | Out-Null
  Write-Subtle "  - Created backend/.data"
} else { Write-Subtle "  - backend/.data exists" }

if (Test-Path "backend/.data/app_data.db") {
  Remove-Item "backend/.data/app_data.db" -Force
  Write-Subtle "  - Removed legacy backend/.data/app_data.db"
}

# 3) Optional reset dev DB
if ($ResetDb -and (Test-Path "backend/.data/app_runtime.dev.sqlite")) {
  Write-Step "[3/7] Resetting dev DB file"
  Remove-Item "backend/.data/app_runtime.dev.sqlite" -Force
  Write-Subtle "  - Deleted backend/.data/app_runtime.dev.sqlite"
} else { Write-Step "[3/7] Skipping DB reset (use -ResetDb to enable)" }

# 4) Ensure env correctness (quick validate CORS as JSON array)
Write-Step "[4/7] Validating backend/.env (CORS_ALLOW_ORIGINS)"
$envPath = "backend/.env"
$dotenv = Get-Content $envPath -Raw
$match = ($dotenv -split "\r?\n") | Where-Object { $_ -match "^\s*CORS_ALLOW_ORIGINS\s*=\s*(.+)$" } | Select-Object -First 1
if ($match) {
  $val = $match -replace '^\s*CORS_ALLOW_ORIGINS\s*=\s*', ''
  # Simple check: must start with [ and end with ]
  if (-not ($val.Trim().StartsWith("[") -and $val.Trim().EndsWith("]"))) {
    Write-Warning "CORS_ALLOW_ORIGINS in backend/.env should be a JSON array, e.g. [\"http://localhost:5173\"]"
  }
} else {
  Write-Warning "CORS_ALLOW_ORIGINS not set in backend/.env; backend will fallback to default in main.py"
}

# 5) Apply Alembic migrations
Write-Step "[5/7] Running Alembic upgrade head"
.\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini upgrade head | Out-Host

# 6) Start API in background and wait for readiness
Write-Step "[6/7] Starting API server and waiting for readiness"
$pythonPath = ".\.venv\Scripts\python.exe"
$uvicornArgs = @("-m","uvicorn","app.main:app","--host",$ApiHost,"--port",$Port.ToString(),"--app-dir","backend")
if (-not $NoReload) { $uvicornArgs += "--reload" }
Start-Process -FilePath $pythonPath -ArgumentList $uvicornArgs -WorkingDirectory "." -WindowStyle Hidden

$maxWait = 30
$ready = $false
for ($i=0; $i -lt $maxWait; $i++) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri "http://$ApiHost:$Port/docs" -Method GET -TimeoutSec 2
    if ($resp.StatusCode -ge 200) { $ready = $true; break }
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $ready) { throw "Backend did not become ready on http://$ApiHost:$Port within $maxWait seconds." }
Write-Subtle "  - API is ready"

# 7) Run QA
Write-Step "[7/7] Running backend QA"
powershell -ExecutionPolicy Bypass -File "scripts/backend_qa.ps1" | Out-Host

Write-Success "=== Done ==="
