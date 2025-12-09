const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('dpix', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  processImages: (files, options) => ipcRenderer.invoke('process-images', files, options),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  onProgress: (callback) => {
    ipcRenderer.on('processing-progress', (event, data) => callback(data));
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('processing-progress');
  }
});
