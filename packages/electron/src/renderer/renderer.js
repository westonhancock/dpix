let selectedFiles = [];
let outputDirectory = null;

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// DOM elements
const dropZone = document.getElementById('dropZone');
const filesList = document.getElementById('filesList');
const selectBtn = document.getElementById('selectBtn');
const optimizeBtn = document.getElementById('optimizeBtn');
const resultsDiv = document.getElementById('results');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('format');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const outputDirCheckbox = document.getElementById('outputDir');
const selectOutputBtn = document.getElementById('selectOutputBtn');
const outputDirPath = document.getElementById('outputDirPath');

// Quality slider
qualitySlider.addEventListener('input', (e) => {
  qualityValue.textContent = e.target.value;
});

// File selection button
selectBtn.addEventListener('click', async () => {
  const files = await window.dpix.selectFile();
  if (files) {
    addFiles(files);
  }
});

// Output directory checkbox
outputDirCheckbox.addEventListener('change', (e) => {
  selectOutputBtn.disabled = !e.target.checked;
  if (!e.target.checked) {
    outputDirectory = null;
    outputDirPath.textContent = '';
  }
});

// Output directory selection
selectOutputBtn.addEventListener('click', async () => {
  const dir = await window.dpix.selectOutputDir();
  if (dir) {
    outputDirectory = dir;
    outputDirPath.textContent = dir;
  }
});

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Only remove if leaving the dropZone itself, not child elements
  if (e.target === dropZone) {
    dropZone.classList.remove('drag-over');
  }
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const files = Array.from(e.dataTransfer.files).map(f => f.path);
  console.log('Files dropped:', files);
  addFiles(files);
});

// Click on drop zone to select files
dropZone.addEventListener('click', (e) => {
  if (e.target === dropZone || e.target.closest('svg') || e.target.matches('p')) {
    selectBtn.click();
  }
});

// Add files to list
function addFiles(files) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.heic', '.heif'];
  const imageFiles = files.filter(f =>
    imageExtensions.some(ext => f.toLowerCase().endsWith(ext))
  );

  selectedFiles = [...new Set([...selectedFiles, ...imageFiles])];
  renderFilesList();
  updateOptimizeButton();
}

// Remove file from list
function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFilesList();
  updateOptimizeButton();
}

// Render files list
function renderFilesList() {
  if (selectedFiles.length === 0) {
    filesList.innerHTML = '';
    return;
  }

  filesList.innerHTML = selectedFiles.map((file, index) => {
    const fileName = file.split('/').pop();
    return `
      <div class="file-item">
        <span class="file-name" title="${file}">${fileName}</span>
        <button class="file-remove" onclick="removeFile(${index})">×</button>
      </div>
    `;
  }).join('');
}

// Update optimize button state
function updateOptimizeButton() {
  optimizeBtn.disabled = selectedFiles.length === 0;
}

// Optimize images
optimizeBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0) return;

  // Disable button during processing
  optimizeBtn.disabled = true;
  optimizeBtn.textContent = 'Processing...';
  resultsDiv.innerHTML = '';

  // Show progress bar
  resultsDiv.innerHTML = `
    <div class="progress-container">
      <div class="progress-text">Processing: <span id="currentFileName">Starting...</span></div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <div class="progress-stats">
        <span id="progressPercentage">0%</span>
        <span id="progressFiles">(0 of ${selectedFiles.length})</span>
      </div>
    </div>
  `;

  // Set up progress listener
  window.dpix.onProgress((progress) => {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressFiles = document.getElementById('progressFiles');
    const currentFileName = document.getElementById('currentFileName');

    if (progressFill) {
      progressFill.style.width = `${progress.overallProgress}%`;
    }
    if (progressPercentage) {
      progressPercentage.textContent = `${progress.overallProgress}%`;
    }
    if (progressFiles) {
      progressFiles.textContent = `(${progress.fileIndex + 1} of ${progress.totalFiles})`;
    }
    if (currentFileName) {
      currentFileName.textContent = progress.currentFile;
    }
  });

  // Gather options
  const options = {
    format: formatSelect.value,
    quality: parseInt(qualitySlider.value),
    width: widthInput.value ? parseInt(widthInput.value) : null,
    height: heightInput.value ? parseInt(heightInput.value) : null,
    outputDir: outputDirectory,
  };

  try {
    const results = await window.dpix.processImages(selectedFiles, options);

    // Remove progress listener
    window.dpix.removeProgressListener();

    // Display results
    resultsDiv.innerHTML = results.map(result => {
      if (result.success) {
        return `
          <div class="result-item success">
            <div class="result-file">${result.inputPath.split('/').pop()}</div>
            <div class="result-stats">
              ${result.originalSize} → ${result.newSize} (${result.savings}% savings)<br>
              ${result.originalWidth}×${result.originalHeight} → ${result.width}×${result.height}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="result-item error">
            <div class="result-file">${result.inputPath.split('/').pop()}</div>
            <div class="result-stats">Error: ${result.error}</div>
          </div>
        `;
      }
    }).join('');

    // Clear selected files after successful processing
    selectedFiles = [];
    renderFilesList();
  } catch (error) {
    // Remove progress listener
    window.dpix.removeProgressListener();

    resultsDiv.innerHTML = `
      <div class="result-item error">
        <div class="result-file">Error</div>
        <div class="result-stats">${error.message}</div>
      </div>
    `;
  } finally {
    optimizeBtn.disabled = false;
    optimizeBtn.textContent = 'Optimize Images';
    updateOptimizeButton();
  }
});

// Make removeFile globally accessible
window.removeFile = removeFile;

// Load saved settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('dpix-settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.format) formatSelect.value = settings.format;
      if (settings.quality) {
        qualitySlider.value = settings.quality;
        qualityValue.textContent = settings.quality;
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }
}

// Save settings
function saveSettings() {
  const settings = {
    format: formatSelect.value,
    quality: qualitySlider.value,
  };
  localStorage.setItem('dpix-settings', JSON.stringify(settings));
}

// Save settings on change
formatSelect.addEventListener('change', saveSettings);
qualitySlider.addEventListener('change', saveSettings);

// Load settings on startup
loadSettings();
