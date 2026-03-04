$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

Write-Host "Checking alignment prerequisites..." -ForegroundColor Cyan

function Test-Cli($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "Missing command: $name" -ForegroundColor Yellow
    return $false
  }
  return $true
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$parentRoot = Resolve-Path (Join-Path $projectRoot "..")
$pythonCandidates = @(
  (Join-Path $projectRoot ".venv\Scripts\python.exe"),
  (Join-Path $parentRoot ".venv\Scripts\python.exe")
)

$pythonCmd = "python"
foreach ($candidate in $pythonCandidates) {
  if (Test-Path $candidate) {
    $pythonCmd = $candidate
    break
  }
}

if ($pythonCmd -eq "python" -and -not (Test-Cli "python")) {
  Write-Host "Install Python 3.10+ and re-run." -ForegroundColor Red
  exit 1
}

if (-not (Test-Cli "ffmpeg")) {
  Write-Host "ffmpeg is required for forced alignment. Install ffmpeg and add to PATH." -ForegroundColor Red
  Write-Host "Windows (winget): winget install Gyan.FFmpeg" -ForegroundColor Gray
  exit 1
}

$pythonExe = & $pythonCmd -c "import sys; print(sys.executable)"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Python executable check failed." -ForegroundColor Red
  exit 1
}
Write-Host "Using Python: $pythonExe" -ForegroundColor Gray

$requiredPkgs = @("torch", "whisperx")
$missingPkgs = @()
foreach ($pkg in $requiredPkgs) {
  cmd /c "`"$pythonCmd`" -m pip show $pkg >nul 2>nul"
  if ($LASTEXITCODE -ne 0) {
    $missingPkgs += $pkg
  }
}

$missing = [string]::Join(",", $missingPkgs)

if ($missing -and $missing.Trim().Length -gt 0) {
  Write-Host "Missing Python packages: $missing" -ForegroundColor Yellow
  Write-Host "Install with: `"$pythonCmd`" -m pip install torch whisperx" -ForegroundColor Gray
  Write-Host "Builder will still run using fallback timing if these are missing." -ForegroundColor Yellow
  exit 0
}

Write-Host "Alignment toolchain is ready." -ForegroundColor Green
