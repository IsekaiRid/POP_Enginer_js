import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

import { createProject } from "./core/core.created.cjs";
import { listProjects, loadProject } from "./core/core.view.cjs";
import { deleteProject } from "./core/core.delate.cjs";
import { CoreCompiler } from "./core/core.compiler.cjs";

/* =========================================================
 * PATH (ESM SAFE)
 * ======================================================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================================
 * WINDOW REFERENCES
 * ======================================================= */
let mainWindow = null;
let gameWindow = null;

/* =========================================================
 * IPC HANDLERS
 * ======================================================= */
ipcMain.handle("create-project", (_, data) => createProject(data));

ipcMain.handle("list-projects", () => listProjects());

ipcMain.handle("load-project", (_, name) => loadProject(name));

ipcMain.handle("delete-project", (_, name) => deleteProject(name));

ipcMain.handle("launch-project", async (_, folderPath) => {
  try {
    const bundle = CoreCompiler.handleLaunch(folderPath);
    return { ok: true, bundle };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});


ipcMain.on("open-game-window", (_, payload) => {
  const { bundle, projectName } = payload;
  const projectRoot = path.join(
    process.cwd(),
    "projects",
    projectName
  );
  createGameWindow();
  gameWindow.webContents.once("did-finish-load", () => {
    gameWindow.webContents.send("game-data", {
      bundle,
      projectName,
      projectRoot
    });
  });
});



/* =========================================================
 * WINDOW CREATORS
 * ======================================================= */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    icon: path.join(__dirname, 'assets', 'pop.png'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }
}

function createGameWindow() {
  if (gameWindow && !gameWindow.isDestroyed()) {
    gameWindow.focus();
    return;
  }

  gameWindow = new BrowserWindow({
    width: 900,
    height: 600,
    title: "Game Preview",
    webPreferences: {
      preload: path.join(
        __dirname,
        "../src/core/games/core.preload.cjs"
      ),
      webSecurity: false,
    }
  });
  gameWindow.loadURL("http://localhost:5173/src/core/games/games.html");
  // gameWindow.webContents.openDevTools();
  gameWindow.on("closed", () => {
    gameWindow = null;
  });
}

/* =========================================================
 * APP LIFECYCLE
 * ======================================================= */
Menu.setApplicationMenu(null);

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
