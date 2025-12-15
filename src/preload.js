const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("engine", {
  createProject: (data) => ipcRenderer.invoke("create-project", data),
  listProjects: () => ipcRenderer.invoke("list-projects"),
  loadProject: (name) => ipcRenderer.invoke("load-project", name),
  deleteProject: (name) => ipcRenderer.invoke("delete-project", name),
  launchProject: (folderPath) => ipcRenderer.invoke("launch-project", folderPath),
  openGameWindow: (bundle) =>
    ipcRenderer.send("open-game-window", bundle)
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron preload loaded!")
});
