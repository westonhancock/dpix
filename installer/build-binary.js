#!/usr/bin/env node

/**
 * Build standalone dpix binary using pkg
 * This creates a self-contained executable that includes Node.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

const CLI_DIR = path.join(__dirname, '../packages/cli');
const OUTPUT_DIR = path.join(__dirname, '../dist');
const BINARY_NAME = 'dpix';

async function buildBinary() {
  console.log('🔨 Building standalone dpix binary...\n');

  // Create dist directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Build for macOS (both architectures)
    const targets = [
      'node18-macos-arm64',
      'node18-macos-x64'
    ];

    for (const target of targets) {
      const arch = target.includes('arm64') ? 'arm64' : 'x64';
      const outputPath = path.join(OUTPUT_DIR, `${BINARY_NAME}-macos-${arch}`);

      console.log(`Building for ${target}...`);

      const command = `npx pkg ${CLI_DIR}/bin/dpix.js \
        --target ${target} \
        --output ${outputPath} \
        --compress GZip`;

      await execAsync(command, { cwd: CLI_DIR });

      console.log(`✅ Built: ${outputPath}\n`);
    }

    console.log('✅ All binaries built successfully!');
    console.log(`\nOutput directory: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildBinary();
