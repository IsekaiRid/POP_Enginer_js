const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gameAPI", {
  onGameData: (cb) => {
    ipcRenderer.on("game-data", (_, payload) => cb(payload));
  }
});