# Installation Guide

dpix provides multiple installation methods depending on your needs.

## Method 1: CLI via npm (Recommended)

The CLI tool can be installed globally via npm:

```bash
npm install -g dpix
```

This provides the `dpix` command for terminal use.

## Method 2: Menu Bar App (macOS)

### Download
Download the latest release for your Mac:
- **Apple Silicon (M1/M2/M3)**: `dpix-{version}-arm64.dmg`
- **Intel Macs**: `dpix-{version}-x64.dmg`

### Installation Steps

1. **Download** the appropriate DMG file from the [Releases page](https://github.com/westonhancock/dpix/releases)

2. **Open the DMG** and drag dpix to your Applications folder

3. **First Launch - Bypass Gatekeeper**

   Since the app is not yet code-signed with an Apple Developer certificate, macOS will block it on first launch. Here's how to allow it:

   **Option A: Right-click method (Easiest)**
   - Right-click (or Control-click) the dpix app in Applications
   - Select "Open" from the menu
   - Click "Open" in the security dialog
   - The app will now run and be remembered as safe

   **Option B: System Settings method**
   - Try to open dpix normally (it will be blocked)
   - Go to System Settings → Privacy & Security
   - Scroll down to the Security section
   - Click "Open Anyway" next to the dpix message
   - Click "Open" in the confirmation dialog

4. **Grant Permissions**

   The app may request permissions for:
   - File access (to read/write images)
   - Notifications (for completion alerts)

### Menu Bar Usage

Once installed:
- dpix appears as a menu bar icon
- Click the icon to open the optimizer
- Or use the global shortcut: **Cmd+Shift+O**

## Method 3: Quick Action (macOS Finder)

The Quick Action allows right-click optimization of images in Finder.

### Installation

From the dpix repository:

```bash
cd packages/workflows
./create-workflow.sh
cp -R "Optimize Image.workflow" ~/Library/Services/
```

### Refresh Services

```bash
/System/Library/CoreServices/pbs -flush
killall Finder
```

### Usage

1. Right-click any image file in Finder
2. Select "Quick Actions" → "Optimize Image"
   (or "Services" → "Optimize Image")
3. Choose format and quality in the dialogs
4. Optimized image will be created in the same folder

## Troubleshooting

### "App is damaged and can't be opened"

This happens due to macOS quarantine attributes. Fix it with:

```bash
xattr -cr /Applications/dpix.app
```

### Menu bar app won't open

Try removing quarantine and resetting:

```bash
xattr -cr /Applications/dpix.app
killall dpix
open /Applications/dpix.app
```

### Quick Action not appearing

Ensure the workflow is installed and services are refreshed:

```bash
ls ~/Library/Services/Optimize\ Image.workflow
/System/Library/CoreServices/pbs -flush
killall Finder
```

## For Developers: Code Signing

To properly sign the app for distribution (removes Gatekeeper warnings):

1. **Join Apple Developer Program** ($99/year)
   - Sign up at https://developer.apple.com/programs/

2. **Get certificates**
   ```bash
   # This will download and install certificates
   security find-identity -v -p codesigning
   ```

3. **Update package.json**
   ```json
   {
     "build": {
       "mac": {
         "identity": "Developer ID Application: Your Name (TEAM_ID)",
         "hardenedRuntime": true,
         "gatekeeperAssess": true
       }
     }
   }
   ```

4. **Notarize** (required for macOS 10.15+)
   ```bash
   # Add to package.json
   {
     "build": {
       "mac": {
         "notarize": {
           "teamId": "YOUR_TEAM_ID"
         }
       }
     }
   }
   ```

## Alternative: Homebrew Installation (Future)

We're working on adding dpix to Homebrew Cask for easier installation:

```bash
# Coming soon
brew install --cask dpix
```

## Need Help?

- Report issues: https://github.com/westonhancock/dpix/issues
- Read the docs: https://github.com/westonhancock/dpix#readme
