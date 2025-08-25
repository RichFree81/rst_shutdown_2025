# FCE Shell Theme Helpers
# Provides brand-colored output for PowerShell using 24-bit ANSI sequences
# Safe on Windows 10+ and PowerShell 7+; falls back to Write-Host colors when VT is unsupported.

# Brand tokens (from specs/theme_spec.md)
$FCE_COLORS = @{
  blue      = "#24427E"  # --fce-blue
  sky       = "#4099FF"  # --fce-sky
  navy      = "#111E36"  # --fce-navy
  grey      = "#A4AFBF"  # --fce-grey
  bluegrey  = "#DDE8FD"  # --fce-bluegrey
  copper    = "#B87333"  # --fce-copper
}

# Converts a hex color (e.g. #24427E) to R,G,B tuple
function Convert-HexToRgb([string]$hex) {
  $h = $hex.Trim()
  if ($h.StartsWith('#')) { $h = $h.Substring(1) }
  if ($h.Length -ne 6) { throw "Invalid hex color: $hex" }
  [int]$r = [Convert]::ToInt32($h.Substring(0,2),16)
  [int]$g = [Convert]::ToInt32($h.Substring(2,2),16)
  [int]$b = [Convert]::ToInt32($h.Substring(4,2),16)
  return @($r,$g,$b)
}

# Returns ANSI 24-bit foreground escape for a given hex color
function New-FgAnsi([string]$hex) {
  $rgb = Convert-HexToRgb $hex
  return "`u001b[38;2;$($rgb[0]);$($rgb[1]);$($rgb[2])m"
}

# Returns ANSI 24-bit background escape for a given hex color
function New-BgAnsi([string]$hex) {
  $rgb = Convert-HexToRgb $hex
  return "`u001b[48;2;$($rgb[0]);$($rgb[1]);$($rgb[2])m"
}

# Reset ANSI
$ANSI_RESET = "`u001b[0m"

# Detect VT support (Windows 10+ consoles typically support it)
$script:SupportsVT = $true
try {
  if ($Host -and $Host.UI -and $Host.UI.RawUI) { $null = $Host.UI.RawUI } else { $script:SupportsVT = $false }
} catch { $script:SupportsVT = $false }

function Write-BrandLine {
  param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$Fg = $FCE_COLORS.blue,   # default brand blue
    [string]$Bg = $null
  )
  if ($script:SupportsVT) {
    $prefix = ""
    if ($Fg) { $prefix += (New-FgAnsi $Fg) }
    if ($Bg) { $prefix += (New-BgAnsi $Bg) }
    Write-Host ("$prefix$Message$ANSI_RESET")
  } else {
    # Fallback to nearest ConsoleColor mapping
    $map = @{ "#24427E"='Blue'; "#4099FF"='Cyan'; "#111E36"='DarkBlue'; "#B87333"='DarkYellow'; "#A4AFBF"='Gray' }
    $fc = $null
    if ($map.ContainsKey($Fg)) { $fc = $map[$Fg] } else { $fc = 'White' }
    Write-Host $Message -ForegroundColor $fc
  }
}

function Write-Header {
  param([string]$Text)
  Write-BrandLine -Message $Text -Fg $FCE_COLORS.navy
}

function Write-Step {
  param([string]$Text)
  Write-BrandLine -Message $Text -Fg $FCE_COLORS.sky
}

function Write-Subtle {
  param([string]$Text)
  Write-BrandLine -Message $Text -Fg $FCE_COLORS.grey
}

function Write-Success {
  param([string]$Text)
  # Use copper as success accent per spec
  Write-BrandLine -Message $Text -Fg $FCE_COLORS.copper
}

function Write-Info {
  param([string]$Text)
  Write-BrandLine -Message $Text -Fg $FCE_COLORS.blue
}

