#!/bin/bash

# Release script for dpix
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version type required${NC}"
    echo "Usage: ./scripts/release.sh [major|minor|patch]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/release.sh patch   # 1.0.0 -> 1.0.1"
    echo "  ./scripts/release.sh minor   # 1.0.0 -> 1.1.0"
    echo "  ./scripts/release.sh major   # 1.0.0 -> 2.0.0"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error: Invalid version type '$VERSION_TYPE'${NC}"
    echo "Must be one of: major, minor, patch"
    exit 1
fi

# Check if working directory is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}Error: Working directory is not clean${NC}"
    echo "Please commit or stash your changes first"
    git status -s
    exit 1
fi

# Get current version from root package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: v$CURRENT_VERSION${NC}"

# Calculate new version
case $VERSION_TYPE in
    major)
        NEW_VERSION=$(node -p "
            const v = '$CURRENT_VERSION'.split('.');
            [parseInt(v[0])+1, 0, 0].join('.')
        ")
        ;;
    minor)
        NEW_VERSION=$(node -p "
            const v = '$CURRENT_VERSION'.split('.');
            [v[0], parseInt(v[1])+1, 0].join('.')
        ")
        ;;
    patch)
        NEW_VERSION=$(node -p "
            const v = '$CURRENT_VERSION'.split('.');
            [v[0], v[1], parseInt(v[2])+1].join('.')
        ")
        ;;
esac

echo -e "${GREEN}New version: v$NEW_VERSION${NC}"
echo ""

# Confirm
read -p "Create release v$NEW_VERSION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled"
    exit 0
fi

echo ""
echo -e "${YELLOW}Updating version in package.json files...${NC}"

# Update root package.json
node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "✓ Updated ./package.json"

# Update CLI package.json
node -e "
    const fs = require('fs');
    const pkg = require('./packages/cli/package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('./packages/cli/package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "✓ Updated ./packages/cli/package.json"

# Update Electron package.json
node -e "
    const fs = require('fs');
    const pkg = require('./packages/electron/package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('./packages/electron/package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "✓ Updated ./packages/electron/package.json"

echo ""
echo -e "${YELLOW}Committing version bump...${NC}"

git add package.json packages/cli/package.json packages/electron/package.json
git commit -m "Bump version to v$NEW_VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo ""
echo -e "${YELLOW}Creating git tag...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo ""
echo -e "${GREEN}✓ Release v$NEW_VERSION prepared!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git show v$NEW_VERSION"
echo "  2. Push the changes: git push origin main"
echo "  3. Push the tag: git push origin v$NEW_VERSION"
echo ""
echo "Or push everything at once:"
echo "  git push origin main --tags"
echo ""
echo "GitHub Actions will automatically build and create the release."
