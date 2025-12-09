#!/usr/bin/env node

import { Command } from 'commander';
import { processImage } from '../lib/processor.js';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('dpix')
  .description('Compress and optimize images with ease')
  .version(packageJson.version);

program
  .argument('<input>', 'Input image path')
  .option('-o, --output <path>', 'Output path (default: input-compressed.ext)')
  .option('-w, --width <number>', 'Resize width (maintains aspect ratio if height not specified)', parseInt)
  .option('-h, --height <number>', 'Resize height (maintains aspect ratio if width not specified)', parseInt)
  .option('-q, --quality <number>', 'Quality (1-100, default varies by format)', parseInt)
  .option('-f, --format <format>', 'Output format (jpg, jpeg, png, webp, avif, gif, tiff)', 'webp')
  .option('--fit <fit>', 'How to fit the image (cover, contain, fill, inside, outside)', 'cover')
  .option('--no-enlarge', 'Do not enlarge images smaller than the specified dimensions')
  .action(async (input, options) => {
    try {
      console.log(chalk.blue('dpix - Image Optimizer'));
      console.log('');

      const result = await processImage(input, options);

      console.log('');
      console.log(chalk.green('✓ Success!'));
      console.log(chalk.gray(`Input:  ${result.inputPath}`));
      console.log(chalk.gray(`Output: ${result.outputPath}`));
      console.log(chalk.gray(`Format: ${result.format}`));
      console.log(chalk.gray(`Size:   ${result.originalSize} → ${result.newSize} (${result.savings}% savings)`));

      if (result.width || result.height) {
        console.log(chalk.gray(`Dimensions: ${result.originalWidth}x${result.originalHeight} → ${result.width}x${result.height}`));
      }
    } catch (error) {
      console.error('');
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
