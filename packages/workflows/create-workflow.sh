#!/bin/bash

# This script creates the macOS Quick Action workflow with interactive dialogs

WORKFLOW_DIR="Optimize Image.workflow"
CONTENTS_DIR="$WORKFLOW_DIR/Contents"

# Remove old workflow if it exists
rm -rf "$WORKFLOW_DIR"

# Create workflow directory structure
mkdir -p "$CONTENTS_DIR"

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>Optimize Image</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSRequiredContext</key>
			<dict>
				<key>NSApplicationIdentifier</key>
				<string>com.apple.finder</string>
			</dict>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.image</string>
			</array>
		</dict>
	</array>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDefaultVersion</key>
	<string>1.0</string>
	<key>BuildMachineOSBuild</key>
	<string>21A559</string>
	<key>CFBundleIdentifier</key>
	<string>com.westonhancock.dpix.quickaction</string>
	<key>CFBundleName</key>
	<string>Optimize Image</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.1</string>
	<key>CFBundleVersion</key>
	<string>2</string>
</dict>
</plist>
EOF

# Create document.wflow with interactive dialogs
cat > "$CONTENTS_DIR/document.wflow" << 'EOFWORKFLOW'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<true/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>2.1.1</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>CheckedForUserDefaultShell</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>#!/bin/bash

# dpix Quick Action - Interactive Version
# Optimizes images with user-selected format and quality

# Find dpix binary (try common locations)
DPIX_BIN=""
if command -v dpix &> /dev/null; then
    DPIX_BIN=$(command -v dpix)
elif [ -f "/usr/local/bin/dpix" ]; then
    DPIX_BIN="/usr/local/bin/dpix"
fi

# Check if dpix is installed
if [ -z "$DPIX_BIN" ] || [ ! -f "$DPIX_BIN" ]; then
    osascript -e 'display notification "dpix is not installed. Please install dpix first." with title "dpix Quick Action"'
    exit 1
fi

# Show format selection dialog
FORMAT_CHOICE=$(osascript << 'APPLESCRIPT'
tell application "System Events"
    set formatList to {"WebP (Recommended)", "AVIF (Smallest)", "JPG (Compatible)", "PNG (Lossless)"}
    set chosenFormat to choose from list formatList with prompt "Select output format:" default items {"WebP (Recommended)"} with title "dpix Image Optimizer"
    if chosenFormat is false then
        return "cancelled"
    else
        return chosenFormat as text
    end if
end tell
APPLESCRIPT
)

# Check if user cancelled
if [ "$FORMAT_CHOICE" = "cancelled" ]; then
    exit 0
fi

# Parse format choice and set defaults
case "$FORMAT_CHOICE" in
    "WebP (Recommended)")
        FORMAT="webp"
        DEFAULT_QUALITY="85"
        ;;
    "AVIF (Smallest)")
        FORMAT="avif"
        DEFAULT_QUALITY="75"
        ;;
    "JPG (Compatible)")
        FORMAT="jpg"
        DEFAULT_QUALITY="85"
        ;;
    "PNG (Lossless)")
        FORMAT="png"
        DEFAULT_QUALITY="90"
        ;;
    *)
        FORMAT="webp"
        DEFAULT_QUALITY="85"
        ;;
esac

# Show quality selection dialog
QUALITY=$(osascript << APPLESCRIPT
tell application "System Events"
    set qualityDialog to display dialog "Quality (1-100):" default answer "$DEFAULT_QUALITY" with title "dpix Image Optimizer" buttons {"Cancel", "Optimize"} default button "Optimize"
    if button returned of qualityDialog is "Optimize" then
        return text returned of qualityDialog
    else
        return "cancelled"
    end if
end tell
APPLESCRIPT
)

# Check if user cancelled
if [ "$QUALITY" = "cancelled" ]; then
    exit 0
fi

# Validate quality value
if ! [[ "$QUALITY" =~ ^[0-9]+$ ]] || [ "$QUALITY" -lt 1 ] || [ "$QUALITY" -gt 100 ]; then
    osascript -e 'display notification "Invalid quality value. Using default." with title "dpix"'
    QUALITY="$DEFAULT_QUALITY"
fi

# Process each file
PROCESSED=0
FAILED=0

for file in "$@"; do
    if [ -f "$file" ]; then
        # Get the directory and filename
        filename=$(basename "$file")

        # Run dpix with selected settings
        "$DPIX_BIN" "$file" -f "$FORMAT" -q "$QUALITY" --no-enlarge 2>&1

        if [ $? -eq 0 ]; then
            PROCESSED=$((PROCESSED + 1))
        else
            FAILED=$((FAILED + 1))
        fi
    fi
done

# Show summary notification
if [ $PROCESSED -gt 0 ]; then
    if [ $FAILED -eq 0 ]; then
        osascript -e "display notification \"Optimized $PROCESSED image(s) to $FORMAT at quality $QUALITY\" with title \"dpix\" sound name \"Glass\""
    else
        osascript -e "display notification \"Optimized $PROCESSED, failed $FAILED\" with title \"dpix\" sound name \"Glass\""
    fi
else
    osascript -e 'display notification "No images were optimized" with title "dpix"'
fi
</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/bash</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>2.1.1</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>12345678-1234-1234-1234-123456789012</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
					<string>Unix</string>
				</array>
				<key>OutputUUID</key>
				<string>12345678-1234-1234-1234-123456789013</string>
				<key>UUID</key>
				<string>12345678-1234-1234-1234-123456789014</string>
				<key>UnlocalizedApplications</key>
				<array>
					<string>Automator</string>
				</array>
				<key>arguments</key>
				<dict>
					<key>0</key>
					<dict>
						<key>default value</key>
						<integer>0</integer>
						<key>name</key>
						<string>inputMethod</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>0</string>
					</dict>
					<key>1</key>
					<dict>
						<key>default value</key>
						<false/>
						<key>name</key>
						<string>CheckedForUserDefaultShell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>1</string>
					</dict>
					<key>2</key>
					<dict>
						<key>default value</key>
						<string></string>
						<key>name</key>
						<string>source</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>2</string>
					</dict>
					<key>3</key>
					<dict>
						<key>default value</key>
						<true/>
						<key>name</key>
						<string>COMMAND_STRING</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>3</string>
					</dict>
					<key>4</key>
					<dict>
						<key>default value</key>
						<string>/bin/sh</string>
						<key>name</key>
						<string>shell</string>
						<key>required</key>
						<string>0</string>
						<key>type</key>
						<string>0</string>
						<key>uuid</key>
						<string>4</string>
					</dict>
				</dict>
				<key>isViewVisible</key>
				<integer>1</integer>
			</dict>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>serviceApplicationBundleID</key>
		<string>com.apple.finder</string>
		<key>serviceApplicationPath</key>
		<string>/System/Library/CoreServices/Finder.app</string>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject</string>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>
EOFWORKFLOW

echo "Interactive workflow created successfully: $WORKFLOW_DIR"
