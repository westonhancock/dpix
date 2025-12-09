#!/bin/bash

# Install dpix Quick Action
# This script installs the Quick Action to ~/Library/Services/

echo "======================================"
echo "  dpix Quick Action Installer"
echo "======================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source workflow path (relative to installer directory)
WORKFLOW_SOURCE="$SCRIPT_DIR/../packages/workflows/Optimize Image.workflow"

# Destination
SERVICES_DIR="$HOME/Library/Services"
WORKFLOW_DEST="$SERVICES_DIR/Optimize Image.workflow"

# Check if source workflow exists
if [ ! -d "$WORKFLOW_SOURCE" ]; then
    echo "❌ Error: Workflow not found at $WORKFLOW_SOURCE"
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Create Services directory if it doesn't exist
mkdir -p "$SERVICES_DIR"

# Remove existing workflow if present
if [ -d "$WORKFLOW_DEST" ]; then
    echo "Removing existing Quick Action..."
    rm -rf "$WORKFLOW_DEST"
fi

# Copy workflow
echo "Installing Quick Action..."
cp -R "$WORKFLOW_SOURCE" "$SERVICES_DIR/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Quick Action installed successfully!"
    echo ""
    echo "How to use:"
    echo "1. Right-click any image in Finder"
    echo "2. Select 'Quick Actions' → 'Optimize Image'"
    echo "3. The optimized image will be saved in the same folder"
    echo ""
    echo "Optional: Assign a keyboard shortcut"
    echo "1. Open System Preferences → Keyboard → Shortcuts"
    echo "2. Select 'Services' in the left sidebar"
    echo "3. Find 'Optimize Image' and assign a shortcut"
    echo ""
    echo "Note: The dpix CLI must be installed for this to work."
    echo "The installer will handle this automatically."
else
    echo ""
    echo "❌ Installation failed"
    echo ""
fi

echo "Press any key to exit..."
read -n 1
