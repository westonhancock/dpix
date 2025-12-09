import sharp from 'sharp';
import { existsSync, statSync } from 'fs';
import { extname, dirname, basename, join, resolve, normalize, isAbsolute } from 'path';
import ora from 'ora';

/**
 * Process and optimize an image
 * @param {string} inputPath - Path to input image
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Processing results
 */
export async function processImage(inputPath, options) {
  // Validate input file
  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const spinner = ora('Processing image...').start();

  try {
    // Get original file size
    const originalStats = statSync(inputPath);
    const originalSize = originalStats.size;

    // Generate output path
    const outputPath = generateOutputPath(inputPath, options);

    // Load image with Sharp
    let image = sharp(inputPath);

    // Get original metadata
    const metadata = await image.metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // Apply resize if dimensions are specified
    if (options.width || options.height) {
      const resizeOptions = {
        width: options.width,
        height: options.height,
        fit: options.fit || 'cover',
        withoutEnlargement: options.enlarge === false,
      };

      image = image.resize(resizeOptions);
      spinner.text = 'Resizing image...';
    }

    // Determine output format
    const format = (options.format || 'webp').toLowerCase();

    // Apply format-specific options
    spinner.text = `Converting to ${format}...`;
    image = applyFormatOptions(image, format, options.quality);

    // Save the processed image
    await image.toFile(outputPath);

    // Get new file size
    const newStats = statSync(outputPath);
    const newSize = newStats.size;

    // Get new dimensions
    const newMetadata = await sharp(outputPath).metadata();

    // Calculate savings
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    spinner.succeed('Image processed successfully');

    return {
      inputPath,
      outputPath,
      format,
      originalSize: formatBytes(originalSize),
      newSize: formatBytes(newSize),
      savings,
      originalWidth,
      originalHeight,
      width: newMetadata.width,
      height: newMetadata.height,
    };
  } catch (error) {
    spinner.fail('Failed to process image');
    throw error;
  }
}

/**
 * Generate output path based on input and options
 * @param {string} inputPath - Input file path
 * @param {object} options - Options object
 * @returns {string} - Output file path
 */
function generateOutputPath(inputPath, options) {
  if (options.output) {
    // Normalize and resolve the output path to prevent path traversal
    const normalizedOutput = normalize(resolve(options.output));

    // If it's not an absolute path, make sure it's relative to input directory
    if (!isAbsolute(options.output)) {
      const inputDir = dirname(resolve(inputPath));
      const outputResolved = resolve(inputDir, options.output);

      // Ensure the output is within or is the input directory (prevents ../../../etc/passwd)
      if (!outputResolved.startsWith(inputDir)) {
        throw new Error('Output path must be within the input directory or use an absolute path');
      }

      return outputResolved;
    }

    return normalizedOutput;
  }

  const dir = dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  const format = options.format || 'webp';

  return join(dir, `${base}-compressed.${format}`);
}

/**
 * Apply format-specific compression options
 * @param {Sharp} image - Sharp instance
 * @param {string} format - Output format
 * @param {number} quality - Quality setting
 * @returns {Sharp} - Sharp instance with format applied
 */
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
      return image.jpeg({
        quality: q,
        progressive: true,
        mozjpeg: true,
      });

    case 'png':
      return image.png({
        quality: q,
        compressionLevel: 9,
        progressive: true,
      });

    case 'webp':
      return image.webp({
        quality: q,
        effort: 6,
      });

    case 'avif':
      return image.avif({
        quality: q,
        effort: 6,
      });

    case 'gif':
      return image.gif({
        effort: 10,
      });

    case 'tiff':
      return image.tiff({
        quality: q,
        compression: 'lzw',
      });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes
 * @returns {string} - Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
