# Liem OS - Layer A Core Installer (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "    Liem OS - Layer A Core Installer" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Current directory: $ScriptDir"

# 1. Install Node.js MCP server dependencies
Write-Host "Installing Node.js dependencies for MCP server..."
Set-Location -Path $ScriptDir
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
} else {
    npm install
}

# 2. Check for Python & uv packages
Write-Host "Checking Python package manager..."
if (Get-Command uv -ErrorAction SilentlyContinue) {
    Write-Host "Found 'uv' package manager. Installing Python dependencies with uv..."
    uv pip install --system markitdown
} else {
    Write-Host "'uv' not found. Falling back to pip..."
    if (Get-Command pip -ErrorAction SilentlyContinue) {
        pip install markitdown
    } else {
        Write-Warning "Python/pip not found. Please install Python to use markitdown."
    }
}

# 3. Initialize config & state
Write-Host "Initializing session configuration..."
node "$ScriptDir\core\hooks\session-start.mjs"

# 4. Compile rules to .cursorrules
Write-Host "Compiling .cursorrules..."
$commonRules = Get-Content -Raw "$ScriptDir\core\rules\common\rules.md"
$codingRules = Get-Content -Raw "$ScriptDir\core\rules\coding\rules.md"
$mergedRules = $commonRules + "`r`n`r`n" + $codingRules
Set-Content -Path "$ScriptDir\..\.cursorrules" -Value $mergedRules

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Liem OS installation completed successfully!" -ForegroundColor Green
Write-Host "To register the MCP server, add this to your host editor configuration (e.g. Cursor or Claude Desktop):"
Write-Host ""
Write-Host "Command: node `"$ScriptDir\core\mcp\server.mjs`"" -ForegroundColor Yellow
Write-Host "Transport: stdio" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
