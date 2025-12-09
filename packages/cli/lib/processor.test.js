import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatBytes, generateOutputPath, applyFormatOptions } from './processor.js';

describe('formatBytes', () => {
  it('should return "0 B" for 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1572864)).toBe('1.5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});

describe('generateOutputPath', () => {
  it('should generate default output path with webp format', () => {
    const result = generateOutputPath('/path/to/image.jpg', {});
    expect(result).toBe('/path/to/image-compressed.webp');
  });

  it('should use specified format in output path', () => {
    const result = generateOutputPath('/path/to/image.jpg', { format: 'png' });
    expect(result).toBe('/path/to/image-compressed.png');
  });

  it('should handle absolute output path', () => {
    const result = generateOutputPath('/path/to/image.jpg', {
      output: '/custom/output/file.webp'
    });
    expect(result).toBe('/custom/output/file.webp');
  });

  it('should handle various image extensions', () => {
    expect(generateOutputPath('/path/to/image.png', { format: 'jpg' }))
      .toBe('/path/to/image-compressed.jpg');
    expect(generateOutputPath('/path/to/image.webp', { format: 'avif' }))
      .toBe('/path/to/image-compressed.avif');
  });

  it('should reject path traversal attempts with relative paths', () => {
    expect(() => {
      generateOutputPath('/path/to/image.jpg', {
        output: '../../../etc/passwd'
      });
    }).toThrow('Output path must be within the input directory');
  });

  it('should allow relative paths within input directory', () => {
    const result = generateOutputPath('/path/to/image.jpg', {
      output: 'output.webp'
    });
    expect(result).toBe('/path/to/output.webp');
  });
});

describe('applyFormatOptions', () => {
  let mockImage;

  beforeEach(() => {
    // Create a mock Sharp image with chainable methods
    mockImage = {
      jpeg: vi.fn().mockReturnThis(),
      png: vi.fn().mockReturnThis(),
      webp: vi.fn().mockReturnThis(),
      avif: vi.fn().mockReturnThis(),
      gif: vi.fn().mockReturnThis(),
      tiff: vi.fn().mockReturnThis(),
      heif: vi.fn().mockReturnThis(),
    };
  });

  it('should apply jpeg options with mozjpeg', () => {
    applyFormatOptions(mockImage, 'jpeg', 85);
    expect(mockImage.jpeg).toHaveBeenCalledWith({
      quality: 85,
      progressive: true,
      mozjpeg: true,
    });
  });

  it('should apply jpg options (alias for jpeg)', () => {
    applyFormatOptions(mockImage, 'jpg', 75);
    expect(mockImage.jpeg).toHaveBeenCalledWith({
      quality: 75,
      progressive: true,
      mozjpeg: true,
    });
  });

  it('should apply png options', () => {
    applyFormatOptions(mockImage, 'png', 90);
    expect(mockImage.png).toHaveBeenCalledWith({
      quality: 90,
      compressionLevel: 9,
      progressive: true,
    });
  });

  it('should apply webp options', () => {
    applyFormatOptions(mockImage, 'webp', 80);
    expect(mockImage.webp).toHaveBeenCalledWith({
      quality: 80,
      effort: 6,
    });
  });

  it('should apply avif options', () => {
    applyFormatOptions(mockImage, 'avif', 65);
    expect(mockImage.avif).toHaveBeenCalledWith({
      quality: 65,
      effort: 6,
    });
  });

  it('should apply gif options (ignores quality)', () => {
    applyFormatOptions(mockImage, 'gif', 100);
    expect(mockImage.gif).toHaveBeenCalledWith({
      effort: 10,
    });
  });

  it('should apply tiff options', () => {
    applyFormatOptions(mockImage, 'tiff', 80);
    expect(mockImage.tiff).toHaveBeenCalledWith({
      quality: 80,
      compression: 'lzw',
    });
  });

  it('should apply heic options', () => {
    applyFormatOptions(mockImage, 'heic', 75);
    expect(mockImage.heif).toHaveBeenCalledWith({
      quality: 75,
      compression: 'hevc',
    });
  });

  it('should apply heif options', () => {
    applyFormatOptions(mockImage, 'heif', 70);
    expect(mockImage.heif).toHaveBeenCalledWith({
      quality: 70,
      compression: 'hevc',
    });
  });

  it('should use default quality when not specified', () => {
    applyFormatOptions(mockImage, 'webp', undefined);
    expect(mockImage.webp).toHaveBeenCalledWith({
      quality: 80, // default for webp
      effort: 6,
    });
  });

  it('should use format-specific default quality', () => {
    applyFormatOptions(mockImage, 'avif', undefined);
    expect(mockImage.avif).toHaveBeenCalledWith({
      quality: 65, // default for avif is lower
      effort: 6,
    });
  });

  it('should throw for unsupported format', () => {
    expect(() => {
      applyFormatOptions(mockImage, 'bmp', 80);
    }).toThrow('Unsupported format: bmp');
  });
});
