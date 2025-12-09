# dpix Roadmap

This document outlines the planned features and improvements for dpix. Features are organized by priority and estimated timeline.

## Legend

- 🎯 **High Priority** - Core features that significantly improve functionality
- 🔧 **Medium Priority** - Quality of life improvements
- 💡 **Nice to Have** - Features that enhance the experience but aren't essential
- 🔒 **Security/Stability** - Critical for production readiness

## Version 1.2.0 - Testing & Stability (Q1 2025)

### 🔒 Testing Infrastructure
- [ ] Add unit tests for image processor
- [ ] Add integration tests for CLI
- [ ] Add E2E tests for Electron app
- [ ] Set up test coverage reporting
- [ ] Add CI testing to GitHub Actions

### 🔒 Security & Performance
- [ ] Implement file size limits (prevent processing extremely large files)
- [ ] Add rate limiting for batch processing
- [ ] Update Electron to latest stable version
- [ ] Replace `pkg` with modern alternative (e.g., `@vercel/ncc` or `esbuild`)
- [ ] Audit and update all dependencies

### 🔧 Code Quality
- [ ] Extract shared code between CLI and Electron into shared package
- [ ] Add JSDoc comments throughout codebase
- [ ] Implement proper logging/debugging system
- [ ] Add error recovery mechanisms

## Version 1.3.0 - Preset Profiles (Q1 2025)

### 🎯 Preset System
- [ ] Save and reuse optimization settings
- [ ] Built-in presets:
  - **Web Hero Image** - WebP, 1920px wide, quality 85
  - **Social Media (Instagram)** - JPG, 1080x1080, quality 80
  - **Social Media (Twitter)** - JPG, 1200x675, quality 85
  - **Email Attachment** - JPG, 800px wide, quality 70
  - **Thumbnail** - WebP, 300px, quality 75
  - **Print Quality** - JPG, original size, quality 95
- [ ] Custom preset creation and management
- [ ] Preset import/export

### 🎯 Configuration Files
- [ ] Support `.dpixrc` or `dpix.config.js` for project defaults
- [ ] Per-directory configuration support
- [ ] Global user preferences

## Version 1.4.0 - Advanced Image Features (Q2 2025)

### 🎯 EXIF Data Management
- [ ] Option to preserve metadata (camera settings, location, date)
- [ ] Option to strip all metadata for privacy
- [ ] Display EXIF info in Electron app
- [ ] Selective metadata preservation

### 🎯 Responsive Image Generation
- [ ] One command to generate multiple sizes
- [ ] CLI: `dpix hero.jpg --responsive --sizes 1920,1024,640`
- [ ] Electron UI for responsive image sets
- [ ] Automatic naming conventions
- [ ] Generate HTML/CSS code snippets

### 🔧 Format-Specific Optimizations
- [ ] WebP animation support
- [ ] Progressive JPEG optimization
- [ ] Lossless PNG compression options
- [ ] Format-specific optimization presets

## Version 1.5.0 - Enhanced User Experience (Q2 2025)

### 🎯 Before/After Preview
- [ ] Side-by-side comparison in Electron app
- [ ] File size comparison
- [ ] Dimensions comparison
- [ ] Zoom functionality to check quality
- [ ] Toggle between original and optimized

### 🔧 Batch Queue System
- [ ] Allow multiple batch jobs in Electron app
- [ ] Queue management (pause, resume, cancel)
- [ ] Priority system for batch processing
- [ ] Progress tracking for queued jobs

### 🔧 Undo/Recovery
- [ ] Keep track of original files
- [ ] Undo optimization
- [ ] Recover deleted originals
- [ ] Configurable retention period

### 💡 Drag-to-Export
- [ ] Drag optimized images from results list
- [ ] Export to specific folders/applications
- [ ] Quick copy to clipboard

## Version 1.6.0 - Developer Experience (Q3 2025)

### 🔧 CLI Enhancements
- [ ] Watch mode: `dpix watch ./images --format webp -q 85`
- [ ] Command aliases for common operations
- [ ] Better error messages with suggestions
- [ ] Color-coded output options
- [ ] Verbose mode for debugging

### 💡 Plugin System
- [ ] Allow custom format handlers
- [ ] Plugin API for extensions
- [ ] Community plugin marketplace
- [ ] Documentation for plugin development

### 🔧 API/Library Mode
- [ ] Use dpix as a library in Node.js projects
- [ ] Programmatic API
- [ ] Stream processing support
- [ ] Webhook support for automation

## Version 2.0.0 - Cross-Platform (Q3 2025)

### 🎯 Windows Support
- [ ] Windows Electron app build
- [ ] Windows installer (`.exe` or `.msi`)
- [ ] Windows-specific optimizations
- [ ] Context menu integration

### 🎯 Linux Support
- [ ] Linux Electron app build
- [ ] AppImage distribution
- [ ] Debian package (`.deb`)
- [ ] Snap package

### 💡 Web Interface
- [ ] Browser-based UI as alternative
- [ ] Progressive Web App (PWA)
- [ ] Cloud processing option
- [ ] Shareable optimization links

## Future Considerations (Backlog)

### Advanced Features
- [ ] AI-powered image upscaling
- [ ] Smart crop and auto-focus
- [ ] Background removal
- [ ] Image enhancement filters
- [ ] Watermarking support
- [ ] Batch rename functionality
- [ ] Cloud storage integration (Dropbox, Google Drive, etc.)
- [ ] PDF to image conversion
- [ ] Video thumbnail generation

### Integration & Automation
- [ ] Figma plugin
- [ ] Sketch plugin
- [ ] WordPress plugin
- [ ] GitHub Actions workflow
- [ ] Zapier integration
- [ ] Slack bot

### Format Support
- [ ] RAW image format support
- [ ] SVG optimization
- [ ] ICO file support
- [ ] JPEG XL support (when browser support improves)

### Enterprise Features
- [ ] Team presets and settings sync
- [ ] Usage analytics and reporting
- [ ] Batch processing API
- [ ] White-label branding
- [ ] License management

## Contributing

We welcome contributions! If you'd like to work on any of these features:

1. Check if there's already an issue/PR for the feature
2. Open an issue to discuss your approach
3. Follow the [GitHub workflow](https://github.com/westonhancock/dpix/blob/main/CLAUDE.md#github-workflow) for branching and PRs
4. Write tests for new features
5. Update documentation

## Feedback

Have ideas for features not listed here? [Open an issue](https://github.com/westonhancock/dpix/issues) or start a [discussion](https://github.com/westonhancock/dpix/discussions).

---

**Last Updated:** December 2024
**Current Version:** 1.1.0
