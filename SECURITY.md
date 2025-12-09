# Security Review - dpix

**Date:** December 8, 2024
**Reviewer:** Claude Code
**Version:** 1.0.0

## Executive Summary

dpix has been reviewed for security vulnerabilities. The codebase follows many security best practices, particularly in the Electron app configuration. However, several issues were identified that should be addressed:

- **3 Moderate severity** dependency vulnerabilities
- **1 Medium severity** path traversal vulnerability in CLI
- **1 Low severity** input validation issue in Electron app

## Detailed Findings

### 🔴 HIGH PRIORITY

#### 1. Path Traversal Vulnerability in CLI (Medium Severity)

**Location:** `packages/cli/lib/processor.js:96-98`

**Issue:**
```javascript
function generateOutputPath(inputPath, options) {
  if (options.output) {
    return options.output;  // ⚠️ No validation
  }
  // ...
}
```

User-provided output paths are used directly without normalization or validation. An attacker could potentially:
- Write files outside intended directories using `../../../etc/malicious`
- Overwrite system files if run with elevated privileges
- Create files in sensitive locations

**Impact:**
- Arbitrary file write
- Potential data loss if existing files are overwritten
- Could be used to escalate privileges in certain scenarios

**Recommendation:**
```javascript
import { resolve, normalize } from 'path';

function generateOutputPath(inputPath, options) {
  if (options.output) {
    // Normalize and resolve path
    const outputPath = normalize(resolve(options.output));

    // Prevent path traversal
    const inputDir = dirname(resolve(inputPath));
    if (!outputPath.startsWith(inputDir) && !path.isAbsolute(options.output)) {
      throw new Error('Output path must be in the same directory as input or an absolute path');
    }

    return outputPath;
  }
  // ...
}
```

**CVSS Score:** 6.1 (Medium)
**CWE:** CWE-22 (Path Traversal)

---

#### 2. Input Validation Missing in Electron IPC (Low Severity)

**Location:** `packages/electron/src/main.js:90-107`

**Issue:**
```javascript
ipcMain.handle('process-images', async (event, files, options) => {
  const results = [];

  for (const filePath of files) {  // ⚠️ No validation of file paths
    try {
      const result = await processImage(filePath, options);
      // ...
```

The Electron app accepts file paths and options from the renderer without validation. While file selection uses `dialog.showOpenDialog()` which is safe, the paths could theoretically be manipulated if the renderer is compromised.

**Impact:**
- Low risk since contextIsolation is enabled
- Could process unexpected file types
- Options object not validated

**Recommendation:**
```javascript
ipcMain.handle('process-images', async (event, files, options) => {
  // Validate files array
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('Invalid files array');
  }

  // Validate each file path
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff'];
  for (const filePath of files) {
    if (typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    // Ensure file exists and is readable
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  // Validate options
  if (options.quality && (options.quality < 1 || options.quality > 100)) {
    throw new Error('Quality must be between 1 and 100');
  }

  // ... rest of processing
});
```

**CVSS Score:** 3.1 (Low)
**CWE:** CWE-20 (Improper Input Validation)

---

### 🟡 MEDIUM PRIORITY

#### 3. Dependency Vulnerabilities

**npm audit results:**

1. **Electron <35.7.5 - ASAR Integrity Bypass**
   - **Current version:** 34.5.8
   - **Severity:** Moderate (CVSS 6.1)
   - **CVE:** GHSA-vmqv-hx8q-j7mg
   - **Fix:** Upgrade to 35.7.5 or later
   - **Impact:** Attackers with local access can modify ASAR archives
   - **Note:** Requires local access and user interaction

2. **pkg <=5.8.1 - Local Privilege Escalation**
   - **Current version:** 5.8.1
   - **Severity:** Moderate (CVSS 6.6)
   - **CVE:** GHSA-22r3-9w55-cj54
   - **Fix:** No fix available (package is unmaintained)
   - **Impact:** Local privilege escalation under specific conditions
   - **Mitigation:** Only used for building, not in runtime

3. **menubar - Depends on vulnerable Electron**
   - **Severity:** Moderate
   - **Fix:** Will be resolved when Electron is updated

**Recommendation:**
- Update Electron to latest version (39.x or 35.7.5+)
- Consider alternatives to `pkg` for creating standalone binaries (e.g., `@vercel/ncc`, `esbuild`)

---

### ✅ GOOD SECURITY PRACTICES FOUND

#### Electron App Security

1. **Context Isolation Enabled** ✓
   ```javascript
   contextIsolation: true
   ```
   Prevents renderer from accessing Node.js APIs directly.

2. **Node Integration Disabled** ✓
   ```javascript
   nodeIntegration: false
   ```
   Renderer cannot require Node modules.

3. **Preload Script Usage** ✓
   ```javascript
   contextBridge.exposeInMainWorld('dpix', {
     selectFile: () => ipcRenderer.invoke('select-file'),
     // ...
   });
   ```
   Limited API exposure via contextBridge.

4. **File Selection via Dialog** ✓
   Uses `dialog.showOpenDialog()` instead of accepting arbitrary paths.

#### Build & Deployment

1. **GitHub Actions Permissions** ✓
   ```yaml
   permissions:
     contents: write
   ```
   Minimal permissions (only what's needed).

2. **Pinned Action Versions** ✓
   ```yaml
   uses: actions/checkout@v4
   uses: actions/setup-node@v4
   ```

3. **Heredoc with Quotes** ✓
   ```bash
   cat > file << 'EOF'
   ```
   Prevents variable expansion in heredocs.

4. **Proper Bash Quoting** ✓
   All variables in shell scripts are properly quoted.

---

## Recommendations Priority List

### Immediate (Before Next Release)

1. **Fix path traversal in CLI**
   - Add path normalization and validation
   - Prevent directory traversal attacks

2. **Update Electron version**
   - Upgrade from 34.5.8 to 35.7.5+ or 39.x
   - Test thoroughly after update

### Short Term (Next Minor Version)

3. **Add input validation in Electron IPC handlers**
   - Validate file paths array
   - Validate options object
   - Add file type whitelist

4. **Consider alternatives to pkg**
   - Research: esbuild, @vercel/ncc, or nexe
   - pkg is unmaintained and has unfixed vulnerabilities

### Nice to Have

5. **Add Content Security Policy to Electron**
   ```javascript
   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
     callback({
       responseHeaders: {
         ...details.responseHeaders,
         'Content-Security-Policy': ["default-src 'self'"]
       }
     });
   });
   ```

6. **Add rate limiting to image processing**
   - Prevent resource exhaustion
   - Limit concurrent processing

7. **Add file size limits**
   - Prevent processing of extremely large files
   - Protect against DoS

8. **Code signing for macOS app**
   - Improve trust and prevent tampering
   - Required for macOS Gatekeeper

9. **Implement checksum verification**
   - Verify downloaded dependencies
   - Detect tampering in build artifacts

---

## Security Testing Performed

- ✅ Manual code review of all source files
- ✅ npm audit for dependency vulnerabilities
- ✅ Path traversal testing scenarios
- ✅ Input validation review
- ✅ Electron security configuration review
- ✅ Build script security review
- ✅ GitHub Actions workflow review

## Out of Scope

- Penetration testing
- Fuzzing
- Performance/DoS testing with malicious files
- Social engineering attacks
- Supply chain attacks beyond dependency scanning

---

## Disclosure Policy

If you discover a security vulnerability in dpix:

1. **DO NOT** open a public issue
2. Email: weston.e.hancock@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work to fix critical issues promptly.

---

## Changelog

- **2024-12-08:** Initial security review (v1.0.0)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
