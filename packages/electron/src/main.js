const { menubar } = require('menubar');
const { app, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const { existsSync, statSync } = require('fs');

let mb;

// Create menu bar app
app.whenReady().then(() => {
  const iconPath = path.join(__dirname, '../assets/iconTemplate.png');

  mb = menubar({
    index: `file://${path.join(__dirname, 'renderer/index.html')}`,
    icon: iconPath,
    tooltip: 'dpix - Image Optimizer',
    browserWindow: {
      width: 400,
      height: 550,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    },
    preloadWindow: true,
  });

  mb.on('ready', () => {
    console.log('dpix is ready');

    // Register global shortcut: Cmd+Shift+O
    const ret = globalShortcut.register('CommandOrControl+Shift+O', () => {
      if (mb.window) {
        if (mb.window.isVisible()) {
          mb.hideWindow();
        } else {
          mb.showWindow();
        }
      }
    });

    if (!ret) {
      console.log('Global shortcut registration failed');
    }
  });

  mb.on('after-create-window', () => {
    if (process.env.NODE_ENV === 'development') {
      mb.window.webContents.openDevTools({ mode: 'detach' });
    }
  });
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Handle file selection
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'tiff'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths;
  }
  return null;
});

// Handle output directory selection
ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Handle image processing
ipcMain.handle('process-images', async (event, files, options) => {
  const results = [];

  for (const filePath of files) {
    try {
      const result = await processImage(filePath, options);
      results.push({ success: true, ...result });
    } catch (error) {
      results.push({
        success: false,
        inputPath: filePath,
        error: error.message
      });
    }
  }

  return results;
});

// Image processing function (same logic as CLI)
async function processImage(inputPath, options) {
  if (!existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }

  const originalStats = statSync(inputPath);
  const originalSize = originalStats.size;

  const outputPath = generateOutputPath(inputPath, options);

  let image = sharp(inputPath);
  const metadata = await image.metadata();

  if (options.width || options.height) {
    image = image.resize({
      width: options.width || null,
      height: options.height || null,
      fit: options.fit || 'cover',
      withoutEnlargement: !options.allowEnlarge,
    });
  }

  const format = options.format || 'webp';
  image = applyFormatOptions(image, format, options.quality);

  await image.toFile(outputPath);

  const newStats = statSync(outputPath);
  const newSize = newStats.size;
  const newMetadata = await sharp(outputPath).metadata();

  const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

  return {
    inputPath,
    outputPath,
    format,
    originalSize: formatBytes(originalSize),
    newSize: formatBytes(newSize),
    savings,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    width: newMetadata.width,
    height: newMetadata.height,
  };
}

function generateOutputPath(inputPath, options) {
  if (options.outputDir) {
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const format = options.format || 'webp';
    return path.join(options.outputDir, `${fileName}-compressed.${format}`);
  }

  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext);
  const format = options.format || 'webp';

  return path.join(dir, `${base}-compressed.${format}`);
}

function applyFormatOptions(image, format, quality) {
  const defaultQuality = {
    jpg: 80,
    jpeg: 80,
    png: 80,
    webp: 80,
    avif: 65,
    gif: 100,
    tiff: 80,
  };

  const q = quality || defaultQuality[format] || 80;

  switch (format) {
    case 'jpg':
    case 'jpeg':
      return image.jpeg({ quality: q, progressive: true, mozjpeg: true });
    case 'png':
      return image.png({ quality: q, compressionLevel: 9, progressive: true });
    case 'webp':
      return image.webp({ quality: q, effort: 6 });
    case 'avif':
      return image.avif({ quality: q, effort: 6 });
    case 'gif':
      return image.gif({ effort: 10 });
    case 'tiff':
      return image.tiff({ quality: q, compression: 'lzw' });
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
