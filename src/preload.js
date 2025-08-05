const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Phrase operations
  getPhrases: (options) => ipcRenderer.invoke('get-phrases', options),
  addPhrase: (phraseData) => ipcRenderer.invoke('add-phrase', phraseData),
  updatePhrase: (id, phraseData) => ipcRenderer.invoke('update-phrase', id, phraseData),
  deletePhrase: (id) => ipcRenderer.invoke('delete-phrase', id),
  searchPhrases: (query) => ipcRenderer.invoke('search-phrases', query),
  getPhraseStats: () => ipcRenderer.invoke('get-phrase-stats'),
  exportPhrases: (format) => ipcRenderer.invoke('export-phrases', format),
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openDbLocation: () => ipcRenderer.invoke('open-db-location'),
  
  // Process versions
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome
  },
  
  // Event listeners
  onQuickCapture: (callback) => ipcRenderer.on('quick-capture', callback),
  onQuickCaptureEmpty: (callback) => ipcRenderer.on('quick-capture-empty', callback),
  onNewPhrase: (callback) => ipcRenderer.on('new-phrase', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  onShowExitConfirm: (callback) => ipcRenderer.on('show-exit-confirm', callback),
  
  // Exit choice
  sendExitChoice: (choice) => ipcRenderer.send('exit-choice', choice),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// Also expose a legacy require function for compatibility
contextBridge.exposeInMainWorld('require', (module) => {
  if (module === 'electron') {
    return {
      ipcRenderer: {
        invoke: ipcRenderer.invoke.bind(ipcRenderer),
        on: ipcRenderer.on.bind(ipcRenderer),
        removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
      }
    };
  }
  throw new Error(`Module ${module} is not allowed`);
});