# dpix Usage Guide

Complete guide to using dpix for image optimization.

## Installation

### End Users (Recommended)

1. Download `dpix-installer-arm64.dmg` from [Releases](https://github.com/westonhancock/dpix/releases)
2. Open the DMG
3. Drag `dpix.app` to your Applications folder
4. Double-click `Install Quick Action.command`
5. Enter your password when prompted (needed to install the CLI binary)
6. Done!

### Developers

```bash
# Clone the repository
git clone https://github.com/westonhancock/dpix.git
cd dpix

# Install dependencies
npm run install:all

# Link CLI for development
cd packages/cli && npm link
```

## Three Ways to Use dpix

### 1. Menu Bar App

**Launch:** Open dpix from Applications or find it in your menu bar

**Features:**
- Drag & drop images
- Adjust quality (1-100)
- Choose output format (WebP, AVIF, JPG, PNG, GIF)
- Resize images (width, height, or both)
- Batch processing
- Custom output location

**Global Hotkey:** Press `Cmd+Shift+O` anywhere to show/hide the dpix window

**Quick Start:**
1. Click the dpix icon in your menu bar
2. Drag an image into the window
3. Choose your settings (or use defaults)
4. Click "Optimize Images"
5. Done! Optimized images saved with `-compressed` suffix

### 2. Quick Action (Right-Click)

**Usage:**
1. Right-click any image in Finder
2. Select `Quick Actions` → `Optimize Image`
3. Notification appears when complete
4. Optimized file saved in the same folder

**Default Settings:**
- Format: WebP
- Quality: 85%
- No resizing (maintains original dimensions)
- Won't enlarge small images

**Keyboard Shortcut (Optional):**
1. Open `System Preferences` → `Keyboard` → `Shortcuts`
2. Select `Services` in the left sidebar
3. Find `Optimize Image` and click to add a shortcut
4. Assign your preferred key combination

### 3. Command Line (CLI)

**Basic Usage:**
```bash
# Simple conversion to WebP (default)
dpix photo.jpg

# Specify output format
dpix image.png -f jpg

# Set quality
dpix photo.jpg -q 85

# Resize
dpix large-image.png -w 1920

# Full control
dpix photo.jpg -w 1920 -h 1080 -q 85 -f webp -o output.webp
```

**Common Tasks:**

```bash
# Optimize for web (max 1920px wide)
dpix hero.jpg -f webp -q 85 -w 1920 --no-enlarge

# Create thumbnail
dpix photo.jpg -w 300 -h 300 --fit cover -o thumb.jpg

# Convert to modern format
dpix old-image.png -f avif -q 75

# Batch optimize all JPGs in a folder
for img in *.jpg; do
  dpix "$img" -f webp -q 80
done

# Batch with resizing
for img in *.{jpg,png}; do
  dpix "$img" -w 1920 -q 85 --no-enlarge
done
```

**All Options:**
```
Options:
  -V, --version           Show version
  -o, --output <path>     Output path (default: input-compressed.ext)
  -w, --width <number>    Resize width (maintains aspect if no height)
  -h, --height <number>   Resize height (maintains aspect if no width)
  -q, --quality <number>  Quality 1-100 (default varies by format)
  -f, --format <format>   Output format: jpg, png, webp, avif, gif, tiff
  --fit <fit>             Resize fit: cover, contain, fill, inside, outside
  --no-enlarge            Don't enlarge images smaller than specified
  --help                  Show help
```

## Format Recommendations

### WebP (Default)
- **Best for:** Web images, general use
- **Quality:** 80-85 recommended
- **Pros:** Great compression, wide browser support
- **Use when:** You want smaller file sizes with good quality

### AVIF
- **Best for:** Next-gen web images
- **Quality:** 65-75 recommended
- **Pros:** Better compression than WebP
- **Cons:** Less browser support (modern browsers only)
- **Use when:** Targeting modern browsers, want smallest files

### JPG
- **Best for:** Photos, complex images
- **Quality:** 80-90 recommended
- **Pros:** Universal compatibility
- **Use when:** You need maximum compatibility

### PNG
- **Best for:** Graphics, screenshots, transparency
- **Quality:** 80-90 recommended
- **Pros:** Lossless, supports transparency
- **Use when:** You need transparency or exact colors

## Quality Guidelines

| Quality | Use Case | File Size | Visual Quality |
|---------|----------|-----------|----------------|
| 60-70 | Thumbnails, previews | Small | Good |
| 75-85 | Web images, general use | Medium | Excellent |
| 85-95 | Print, high-quality display | Large | Near-perfect |
| 95-100 | Professional, archival | Very large | Perfect |

**Recommended defaults:**
- Web images: 80-85
- Social media: 75-80
- Thumbnails: 70-75
- Print: 90-95

## Resizing Tips

**Maintain aspect ratio:**
```bash
# Specify only width or height
dpix photo.jpg -w 1920  # Height auto-calculated
dpix photo.jpg -h 1080  # Width auto-calculated
```

**Exact dimensions:**
```bash
# Specify both (may crop or distort depending on --fit)
dpix photo.jpg -w 1920 -h 1080 --fit cover
```

**Fit options:**
- `cover` (default) - Crop to fill dimensions
- `contain` - Fit inside (letterbox if needed)
- `fill` - Stretch to exact dimensions
- `inside` - Fit inside, don't enlarge
- `outside` - Ensure outside dimensions

**Prevent upscaling:**
```bash
dpix small-image.jpg -w 1920 --no-enlarge
# If image is smaller than 1920px, keeps original size
```

## Batch Processing

**Optimize all images in folder:**
```bash
# Basic
for img in *.{jpg,jpeg,png}; do
  dpix "$img"
done

# With settings
for img in *.jpg; do
  dpix "$img" -f webp -q 85 -w 1920 --no-enlarge
done

# To specific output folder
mkdir optimized
for img in *.jpg; do
  dpix "$img" -o "optimized/$(basename "$img" .jpg).webp"
done
```

**Recursive (all subdirectories):**
```bash
find . -type f \( -name "*.jpg" -o -name "*.png" \) -exec dpix {} -f webp -q 85 \;
```

## Troubleshooting

**"dpix: command not found"**
- Menu bar app not installed yet, or
- CLI binary not installed
- Solution: Run "Install Quick Action.command" from the installer DMG

**Quick Action doesn't appear**
- Make sure you ran "Install Quick Action.command"
- Restart Finder: `killall Finder`
- Check System Preferences → Extensions → Finder

**Electron app won't open**
- Right-click dpix.app → Open (first time only)
- macOS may block unsigned apps
- Go to System Preferences → Security & Privacy → Open Anyway

**Global hotkey not working**
- Check System Preferences → Security & Privacy → Accessibility
- Make sure dpix has accessibility permissions

**Image quality too low/high**
- Adjust quality slider in app or use `-q` flag in CLI
- Different formats have different defaults (WebP: 80, AVIF: 65)

## Development

**Run Electron app in development:**
```bash
cd packages/electron
npm start
```

**Build everything:**
```bash
# Build standalone binary
npm run build:binary

# Build Electron app
npm run build:electron

# Build .dmg installer
npm run build:dmg

# Build all
npm run build:all
```

**Test CLI during development:**
```bash
cd packages/cli
npm link
dpix test-image.jpg
```

## Examples

### Common Workflows

**Optimize product photos for e-commerce:**
```bash
dpix product.jpg -w 2000 -q 90 -f jpg --no-enlarge
```

**Create responsive image set:**
```bash
# Original
dpix hero.jpg -w 1920 -q 85 -o hero-1920.webp

# Tablet
dpix hero.jpg -w 1024 -q 85 -o hero-1024.webp

# Mobile
dpix hero.jpg -w 640 -q 80 -o hero-640.webp
```

**Optimize screenshots for docs:**
```bash
dpix screenshot.png -f webp -q 80
```

**Convert PNG graphics to WebP:**
```bash
for img in *.png; do
  dpix "$img" -f webp -q 90
done
```

**Prepare images for social media:**
```bash
# Instagram (1080x1080)
dpix photo.jpg -w 1080 -h 1080 --fit cover -q 80 -o instagram.jpg

# Twitter (1200x675)
dpix photo.jpg -w 1200 -h 675 --fit cover -q 85 -o twitter.jpg
```

## Tips & Best Practices

1. **Use WebP for web** - Best balance of size and compatibility
2. **Quality 80-85 is sweet spot** - Great visual quality, good compression
3. **Always use --no-enlarge** - Don't upscale small images
4. **Batch similar images together** - More efficient workflow
5. **Test different formats** - AVIF can be 20-30% smaller than WebP
6. **Keep originals** - dpix creates new files with `-compressed` suffix
7. **Use menu bar app for one-offs** - Faster than CLI for single images
8. **Use Quick Action for Finder** - Most convenient for daily use

## Support

- **Issues:** https://github.com/westonhancock/dpix/issues
- **Documentation:** https://github.com/westonhancock/dpix

## License

MIT - See LICENSE file for details
