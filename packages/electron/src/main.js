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
      minWidth: 400,
      minHeight: 550,
      maxWidth: 400,
      maxHeight: 550,
      resizable: false,
      frame: false,
      transparent: false,
      hasShadow: true,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    },
    preloadWindow: true,
    showDockIcon: false,
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
    console.log('Window created');
    // Always open dev tools for debugging
    mb.window.webContents.openDevTools({ mode: 'detach' });

    // Log when page finishes loading
    mb.window.webContents.on('did-finish-load', () => {
      console.log('Page finished loading');
    });

    // Log any console messages from renderer
    mb.window.webContents.on('console-message', (event, level, message) => {
      console.log(`Renderer console: ${message}`);
    });
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
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'tiff', 'heic', 'heif'] }
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
  // Validate inputs
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('Invalid files array');
  }

  // Validate file paths and extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.heic', '.heif'];
  for (const filePath of files) {
    if (typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  // Validate options
  if (options.quality && (typeof options.quality !== 'number' || options.quality < 1 || options.quality > 100)) {
    throw new Error('Quality must be a number between 1 and 100');
  }

  if (options.width && (typeof options.width !== 'number' || options.width < 1)) {
    throw new Error('Width must be a positive number');
  }

  if (options.height && (typeof options.height !== 'number' || options.height < 1)) {
    throw new Error('Height must be a positive number');
  }

  const validFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'heic', 'heif'];
  if (options.format && !validFormats.includes(options.format.toLowerCase())) {
    throw new Error(`Invalid format: ${options.format}`);
  }

  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const fileIndex = i;

    try {
      // Progress callback for individual file
      const onProgress = (fileProgress) => {
        const overallProgress = ((fileIndex + fileProgress / 100) / totalFiles) * 100;
        event.sender.send('processing-progress', {
          fileIndex,
          fileProgress,
          overallProgress: Math.round(overallProgress),
          currentFile: path.basename(filePath),
          totalFiles
        });
      };

      const result = await processImage(filePath, options, onProgress);
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
async function processImage(inputPath, options, onProgress = null) {
  if (!existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }

  if (onProgress) onProgress(0);

  const originalStats = statSync(inputPath);
  const originalSize = originalStats.size;

  const outputPath = generateOutputPath(inputPath, options);

  if (onProgress) onProgress(20);

  let image = sharp(inputPath);
  const metadata = await image.metadata();

  if (onProgress) onProgress(40);

  if (options.width || options.height) {
    image = image.resize({
      width: options.width || null,
      height: options.height || null,
      fit: options.fit || 'cover',
      withoutEnlargement: !options.allowEnlarge,
    });
  }

  if (onProgress) onProgress(60);

  const format = options.format || 'webp';
  image = applyFormatOptions(image, format, options.quality);

  if (onProgress) onProgress(80);

  await image.toFile(outputPath);

  if (onProgress) onProgress(90);

  const newStats = statSync(outputPath);
  const newSize = newStats.size;
  const newMetadata = await sharp(outputPath).metadata();

  const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

  if (onProgress) onProgress(100);

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
    // Normalize and resolve the output directory to prevent path traversal
    const normalizedOutputDir = path.normalize(path.resolve(options.outputDir));

    const fileName = path.basename(inputPath, path.extname(inputPath));
    const format = options.format || 'webp';
    return path.join(normalizedOutputDir, `${fileName}-compressed.${format}`);
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
    heic: 75,
    heif: 75,
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
    case 'heic':
    case 'heif':
      return image.heif({ quality: q, compression: 'hevc' });
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
