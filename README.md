# dpix - Image Optimization Made Easy

Compress and optimize images with ease - from the command line, menu bar, or Quick Actions.

## What is dpix?

dpix is a comprehensive image optimization toolkit that provides three ways to compress and optimize your images:

1. **CLI Tool** - Terminal command for power users
2. **Menu Bar App** - Drag & drop with global hotkey (Cmd+Shift+O)
3. **Quick Action** - Right-click any image → "Optimize Image"

## Features

- **Resize** images by width, height, or both
- **Adjust quality** for optimal file size (1-100)
- **Convert** to modern web formats (WebP, AVIF, HEIC) or traditional formats (JPG, PNG, GIF, TIFF)
- **HEIC/HEIF support** - Convert iPhone photos and other HEIC images
- **Intelligent defaults** optimized for each format
- **Batch processing** support
- **Beautiful interface** with real-time progress indicators

## Installation

> **📖 [Full Installation Guide](./INSTALLATION.md)** - Includes troubleshooting and Gatekeeper bypass instructions

### Quick Start

**CLI (Recommended)**
```bash
npm install -g dpix
```

**Menu Bar App**
1. Download the DMG from [Releases](https://github.com/westonhancock/dpix/releases)
   - Apple Silicon (M1/M2/M3): `dpix-{version}-arm64.dmg`
   - Intel Macs: `dpix-{version}-x64.dmg`
2. Open DMG and drag dpix to Applications
3. **First time:** Right-click dpix.app → Open → Open (bypasses Gatekeeper)
4. Optional: Run the post-install script to remove quarantine:
   ```bash
   curl -O https://raw.githubusercontent.com/westonhancock/dpix/main/packages/electron/scripts/post-install.sh
   chmod +x post-install.sh
   ./post-install.sh
   ```

**Quick Action**
```bash
# From the dpix repository
cd packages/workflows
./create-workflow.sh
cp -R "Optimize Image.workflow" ~/Library/Services/
```

> **Note:** The app is not yet code-signed. See [INSTALLATION.md](./INSTALLATION.md) for details on bypassing macOS Gatekeeper warnings.

## Usage

### Menu Bar App

1. Click the dpix icon in your menu bar
2. Drag & drop images onto the window
3. Adjust settings (format, quality, dimensions)
4. Click "Optimize"

**Global Hotkey:** Press `Cmd+Shift+O` with any image selected to optimize instantly

### Quick Action

1. Right-click any image in Finder
2. Select "Quick Actions" → "Optimize Image"
3. Choose your preferred format:
   - **WebP (Recommended)** - Best balance of quality and size
   - **AVIF (Smallest)** - Cutting-edge format with maximum compression
   - **JPG (Compatible)** - Universal compatibility
   - **PNG (Lossless)** - Preserves quality perfectly
4. Set quality (1-100) or use the smart default
5. Optimized file appears in the same folder

### Command Line

```bash
# Convert to WebP (default)
dpix input.jpg

# Resize and compress
dpix photo.png -w 800 -q 80

# Specific format
dpix image.jpg -f avif -q 85

# Full control
dpix photo.jpg -w 1920 -h 1080 -q 85 -f webp -o output.webp
```

See [CLI Documentation](./packages/cli/README.md) for complete CLI options.

## Roadmap

Interested in what's coming next? Check out the [Roadmap](./ROADMAP.md) to see planned features including:
- Preset profiles for common use cases
- EXIF data management
- Responsive image generation
- Before/after preview
- Cross-platform support (Windows & Linux)

## Project Structure

```
dpix-suite/
├── packages/
│   ├── cli/         # Node.js CLI tool
│   ├── electron/    # Menu bar desktop app
│   └── workflows/   # macOS Quick Actions
└── installer/       # Build scripts for .dmg
```

## Development

```bash
# Clone the repository
git clone https://github.com/westonhancock/dpix.git
cd dpix

# Install dependencies for all packages
npm run install:all

# Link CLI for local development
cd packages/cli && npm link

# Run Electron app in development mode
cd packages/electron && npm start

# Build standalone binary
npm run build:binary

# Build Electron app
npm run build:electron

# Build complete installer
npm run build:all
```

## Releasing

dpix uses GitHub Actions for automated releases. See [RELEASING.md](./RELEASING.md) for detailed instructions.

**Quick release:**
```bash
# Create a patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# Push to trigger automated build
git push origin main --tags
```

GitHub Actions will automatically build and publish the release.

## Requirements

- macOS 11.0 or later (for menu bar app and Quick Actions)
- Node.js >= 18.0.0 (for CLI development)

## License

MIT

## Author

Weston Hancock (<weston.e.hancock@gmail.com>)
