const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('videoPlayer', {
  chooseVideo: () => ipcRenderer.invoke('video:choose'),
  registerDroppedVideo: (file) => {
    try {
      const filePath = webUtils.getPathForFile(file);
      return ipcRenderer.invoke('video:register-drop', filePath);
    } catch {
      return null;
    }
  },
  getInitialVideo: () => ipcRenderer.invoke('video:get-initial-video'),
});

