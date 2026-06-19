#!/bin/bash
set -e

echo "=========================================="
echo "    Liem OS - Layer A Core Installer"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Current directory: $SCRIPT_DIR"

# 1. Install Node.js MCP server dependencies
echo "Installing Node.js dependencies for MCP server..."
cd "$SCRIPT_DIR"
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

# 2. Check for Python & uv packages
echo "Checking Python package manager..."
if command -v uv &> /dev/null; then
    echo "Found 'uv' package manager. Installing Python dependencies with uv..."
    uv pip install --system markitdown || true
else
    echo "'uv' not found. Falling back to pip..."
    if command -v pip &> /dev/null; then
        pip install markitdown || true
    else
        echo "Warning: Python/pip not found. Please install Python to use markitdown."
    fi
fi

# 3. Initialize config & state
echo "Initializing session configuration..."
node "$SCRIPT_DIR/core/hooks/session-start.mjs"

# 4. Compile rules to .cursorrules
echo "Compiling .cursorrules..."
# Mock compiling .cursorrules using rule files
cat "$SCRIPT_DIR/core/rules/common/rules.md" "$SCRIPT_DIR/core/rules/coding/rules.md" > "$SCRIPT_DIR/../.cursorrules"

echo "=========================================="
echo "Liem OS installation completed successfully!"
echo "To register the MCP server, add this to your host editor configuration (e.g. Cursor or Claude Desktop):"
echo ""
echo "Command: node \"$SCRIPT_DIR/core/mcp/server.mjs\""
echo "Transport: stdio"
echo "=========================================="
