# Release Guide

This document explains how to create releases for dpix.

## Automated Releases with GitHub Actions

dpix uses GitHub Actions to automatically build and release installers when you push a version tag.

## Creating a Release

### Using the Release Script (Recommended)

The easiest way to create a release is using the provided script:

```bash
# For a patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# For a minor release (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# For a major release (1.0.0 -> 2.0.0)
./scripts/release.sh major
```

This script will:
1. ✓ Check that your working directory is clean
2. ✓ Calculate the new version number
3. ✓ Update all package.json files
4. ✓ Create a git commit with the version bump
5. ✓ Create a git tag (e.g., v1.0.1)
6. ✓ Show you the commands to push

Then push:
```bash
git push origin main --tags
```

GitHub Actions will automatically:
- Build standalone binaries (arm64 and x64)
- Build the Electron app
- Create the .dmg installer
- Create a GitHub release
- Upload all build artifacts

### Manual Process

If you prefer to do it manually:

```bash
# 1. Update version in package.json files
# Edit: package.json, packages/cli/package.json, packages/electron/package.json

# 2. Commit the version bump
git add .
git commit -m "Bump version to v1.0.1"

# 3. Create a tag
git tag -a v1.0.1 -m "Release v1.0.1"

# 4. Push
git push origin main
git push origin v1.0.1
```

## Version Numbering (Semantic Versioning)

dpix follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 -> 2.0.0): Breaking changes
  - Example: Removing features, changing CLI arguments

- **Minor** (1.0.0 -> 1.1.0): New features, backwards compatible
  - Example: Adding new image formats, new CLI options

- **Patch** (1.0.0 -> 1.0.1): Bug fixes, backwards compatible
  - Example: Fixing image quality issues, UI bugs

## What Happens During a Release

When you push a version tag (e.g., `v1.0.1`):

1. **GitHub Actions triggers** (`.github/workflows/release.yml`)
2. **Builds on macOS runner:**
   - Installs Node.js dependencies
   - Builds CLI binaries for arm64 and x64
   - Builds Electron app
   - Creates .dmg installer
3. **Creates GitHub Release:**
   - Generates release notes
   - Uploads `dpix-installer-arm64.dmg`
   - Uploads standalone binaries
4. **Users can download** from GitHub Releases page

## Monitoring the Release

After pushing a tag:

1. Go to https://github.com/westonhancock/dpix/actions
2. You'll see the "Release" workflow running
3. It takes about 5-10 minutes to complete
4. Once done, check https://github.com/westonhancock/dpix/releases

## If Something Goes Wrong

### Delete a tag and retry:
```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1

# Fix the issue, then create tag again
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

### Cancel a running release:
1. Go to https://github.com/westonhancock/dpix/actions
2. Click on the running workflow
3. Click "Cancel workflow"

## Testing Before Release

Before creating a release, test locally:

```bash
# Install all dependencies
npm run install:all

# Build standalone binary
npm run build:binary

# Build Electron app
npm run build:electron

# Create .dmg
npm run build:dmg

# Test the CLI
./dist/dpix-macos-arm64 --help

# Test the Electron app
open packages/electron/out/mac-arm64/dpix.app

# Test the .dmg
open dist/dpix-installer-arm64.dmg
```

## Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] CHANGELOG updated (if you maintain one)
- [ ] Version numbers updated in all package.json files
- [ ] Tested locally on your machine
- [ ] Git working directory is clean
- [ ] On the `main` branch
- [ ] All changes committed and pushed

## First Release (v1.0.0)

For the first release, you'll need to:

```bash
# Make sure everything is ready
npm run install:all

# Create the release
./scripts/release.sh major  # This will go from 1.0.0 to 1.0.0 or create 1.0.0

# Push to trigger the build
git push origin main --tags
```

## Future Improvements

Potential enhancements to the release process:

- [ ] Add automated tests to the workflow
- [ ] Generate CHANGELOG automatically
- [ ] Build for Windows and Linux
- [ ] Publish to npm automatically
- [ ] Code signing for macOS app
- [ ] Notarization for macOS app

## Questions?

If you have questions about releasing, check:
- GitHub Actions logs: https://github.com/westonhancock/dpix/actions
- Workflow file: `.github/workflows/release.yml`
- Release script: `scripts/release.sh`
