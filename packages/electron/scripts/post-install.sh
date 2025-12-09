#!/bin/bash

# Post-install script for dpix menu bar app
# This removes macOS quarantine attributes that prevent unsigned apps from running

echo "🔧 dpix Post-Installation Setup"
echo "================================"
echo ""

APP_PATH="/Applications/dpix.app"

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: dpix.app not found in /Applications/"
    echo "Please drag dpix.app to your Applications folder first."
    exit 1
fi

echo "📦 Found dpix.app in Applications"
echo ""

# Remove quarantine attribute
echo "🔓 Removing quarantine attributes..."
xattr -cr "$APP_PATH" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Quarantine attributes removed"
else
    echo "⚠️  Could not remove quarantine (app may already be clear)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can now:"
echo "  • Open dpix from Applications"
echo "  • Use the global shortcut: Cmd+Shift+O"
echo ""
echo "On first launch, you may still need to:"
echo "  1. Right-click dpix.app and select 'Open'"
echo "  2. Click 'Open' in the security dialog"
echo ""
echo "After that, dpix will run normally."
echo ""
