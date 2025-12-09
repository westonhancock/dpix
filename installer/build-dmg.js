#!/usr/bin/env node

/**
 * Build .dmg installer for dpix
 * Packages Electron app, Quick Action installer, and standalone binary
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DMG_DIR = path.join(DIST_DIR, 'dmg-contents');
const ELECTRON_OUT = path.join(ROOT_DIR, 'packages/electron/out');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'packages/workflows');

async function buildDMG() {
  console.log('📦 Building dpix installer .dmg...\n');

  try {
    // Create DMG contents directory
    if (fs.existsSync(DMG_DIR)) {
      await execAsync(`rm -rf "${DMG_DIR}"`);
    }
    fs.mkdirSync(DMG_DIR, { recursive: true });

    // Step 1: Copy Electron app
    console.log('1. Copying Electron app...');
    const electronAppSrc = path.join(ELECTRON_OUT, 'mac-arm64/dpix.app');

    if (!fs.existsSync(electronAppSrc)) {
      console.log('⚠️  Electron app not found. Building Electron app first...');
      await execAsync('npm run build:electron', { cwd: ROOT_DIR });
    }

    await execAsync(`cp -R "${electronAppSrc}" "${DMG_DIR}/"`);
    console.log('✅ Electron app copied\n');

    // Step 2: Copy Quick Action installer script
    console.log('2. Copying Quick Action installer...');
    const installScriptSrc = path.join(__dirname, 'install-quickaction.command');
    const installScriptDest = path.join(DMG_DIR, 'Install Quick Action.command');
    fs.copyFileSync(installScriptSrc, installScriptDest);
    await execAsync(`chmod +x "${installScriptDest}"`);
    console.log('✅ Quick Action installer copied\n');

    // Step 3: Copy standalone binary (will be installed by the Quick Action script)
    console.log('3. Preparing dpix binary...');
    const binarySrc = path.join(DIST_DIR, 'dpix-macos-arm64');

    if (!fs.existsSync(binarySrc)) {
      console.log('⚠️  Binary not found. Building binary first...');
      await execAsync('npm run build:binary', { cwd: ROOT_DIR });
    }

    // Create a resources directory inside the DMG contents
    const resourcesDir = path.join(DMG_DIR, '.resources');
    fs.mkdirSync(resourcesDir, { recursive: true });

    // Copy binary to resources (it will be installed by install script)
    fs.copyFileSync(binarySrc, path.join(resourcesDir, 'dpix'));
    await execAsync(`chmod +x "${path.join(resourcesDir, 'dpix')}"`);
    console.log('✅ Binary prepared\n');

    // Step 4: Create README
    console.log('4. Creating README...');
    const readmeContent = `dpix - Image Optimizer
====================

Installation:
1. Drag dpix.app to your Applications folder
2. Double-click "Install Quick Action.command" to install the Quick Action
3. Done!

Usage:
- Open dpix from Applications or click the menu bar icon
- Right-click any image → Quick Actions → "Optimize Image"
- Press Cmd+Shift+O to toggle the dpix menu bar window

For more information, visit:
https://github.com/westonhancock/dpix-cli
`;
    fs.writeFileSync(path.join(DMG_DIR, 'README.txt'), readmeContent);
    console.log('✅ README created\n');

    // Step 5: Update install script to also install binary
    console.log('5. Updating install script...');
    await updateInstallScript(installScriptDest, resourcesDir);
    console.log('✅ Install script updated\n');

    // Step 6: Create DMG
    console.log('6. Creating .dmg file...');
    const dmgName = 'dpix-installer-arm64.dmg';
    const dmgPath = path.join(DIST_DIR, dmgName);

    // Remove existing DMG
    if (fs.existsSync(dmgPath)) {
      fs.unlinkSync(dmgPath);
    }

    // Use create-dmg or hdiutil
    try {
      await execAsync(`hdiutil create -volname "dpix Installer" -srcfolder "${DMG_DIR}" -ov -format UDZO "${dmgPath}"`);
    } catch (error) {
      console.log('Note: Using basic DMG creation. For better DMG, install create-dmg');
    }

    console.log(`✅ DMG created: ${dmgPath}\n`);
    console.log('✅ Build complete!');
    console.log(`\nInstaller: ${dmgPath}`);

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function updateInstallScript(scriptPath, resourcesDir) {
  let content = fs.readFileSync(scriptPath, 'utf8');

  // Add binary installation to the script
  const binaryInstallCode = `

# Install dpix CLI binary
echo "Installing dpix CLI binary..."
BINARY_SOURCE="$SCRIPT_DIR/.resources/dpix"
BINARY_DEST="/usr/local/bin/dpix"

if [ -f "$BINARY_SOURCE" ]; then
    sudo mkdir -p /usr/local/bin
    sudo cp "$BINARY_SOURCE" "$BINARY_DEST"
    sudo chmod +x "$BINARY_DEST"
    echo "✅ dpix CLI installed to /usr/local/bin/dpix"
else
    echo "⚠️  dpix binary not found, skipping CLI installation"
fi
echo ""
`;

  // Insert before the final success message
  content = content.replace(
    '# Copy workflow',
    binaryInstallCode + '\n# Copy workflow'
  );

  fs.writeFileSync(scriptPath, content);
}

buildDMG();
