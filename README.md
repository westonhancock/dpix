# dpix

A fast and intuitive CLI tool for compressing and optimizing images.

## Features

- Resize images by width, height, or both
- Adjust image quality for optimal file size
- Convert to modern web formats (WebP, AVIF)
- Support for common formats (JPG, PNG, GIF, TIFF)
- Intelligent defaults for each format
- Beautiful CLI output with progress indicators

## Installation

### Global Installation

```bash
npm install -g dpix
```

### From Source

```bash
cd ~/Source/dpix
npm link
```

## Usage

### Basic Usage

```bash
# Convert to WebP (default)
dpix input.jpg

# Specify output path
dpix input.jpg -o output.webp

# Convert to specific format
dpix input.png -f jpg
```

### Resizing

```bash
# Resize to specific width (maintains aspect ratio)
dpix input.jpg -w 800

# Resize to specific height (maintains aspect ratio)
dpix input.jpg -h 600

# Resize to exact dimensions
dpix input.jpg -w 800 -h 600

# Resize with fit options
dpix input.jpg -w 800 -h 600 --fit contain
```

### Quality Control

```bash
# Set quality (1-100)
dpix input.jpg -q 85

# High quality WebP
dpix input.png -f webp -q 90

# Smaller file size
dpix input.jpg -q 60
```

### Format Conversion

```bash
# Convert to WebP
dpix input.jpg -f webp

# Convert to AVIF (next-gen format)
dpix input.jpg -f avif

# Convert to optimized PNG
dpix input.jpg -f png
```

### Advanced Examples

```bash
# Create thumbnail with high compression
dpix photo.jpg -w 200 -h 200 -q 70 -f webp -o thumbnail.webp

# Optimize for web without resizing
dpix image.png -f webp -q 85

# Batch process (using shell)
for img in *.jpg; do dpix "$img" -w 1920 -q 80; done
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | `input-compressed.ext` |
| `-w, --width <number>` | Resize width | - |
| `-h, --height <number>` | Resize height | - |
| `-q, --quality <number>` | Quality (1-100) | Format-specific |
| `-f, --format <format>` | Output format | `webp` |
| `--fit <fit>` | Resize fit mode | `cover` |
| `--no-enlarge` | Don't enlarge small images | false |

### Supported Formats

- `jpg` / `jpeg` - JPEG (default quality: 80)
- `png` - PNG (default quality: 80)
- `webp` - WebP (default quality: 80)
- `avif` - AVIF (default quality: 65)
- `gif` - GIF
- `tiff` - TIFF (default quality: 80)

### Fit Options

- `cover` - Crop to fit dimensions (default)
- `contain` - Fit within dimensions (letterbox)
- `fill` - Stretch to exact dimensions
- `inside` - Fit inside dimensions
- `outside` - Fit outside dimensions

## Examples with Real Use Cases

### 1. Optimize Images for Web

```bash
dpix hero-image.png -f webp -q 85 -w 1920
```

### 2. Create Social Media Thumbnails

```bash
dpix profile.jpg -w 400 -h 400 --fit cover -f jpg -q 80
```

### 3. Convert Screenshots to Smaller Files

```bash
dpix screenshot.png -f webp -q 75
```

### 4. Batch Optimize All Images in Directory

```bash
for img in *.{jpg,png}; do
  dpix "$img" -f webp -q 80 -w 1920 --no-enlarge
done
```

## Why dpix?

- **Fast**: Built on Sharp, one of the fastest image processing libraries
- **Smart Defaults**: Optimized quality settings for each format
- **Modern**: First-class support for WebP and AVIF
- **Simple**: Intuitive CLI with helpful output
- **Flexible**: Extensive options for power users

## Requirements

- Node.js >= 18.0.0

## License

MIT

## Author

Weston Hancock
