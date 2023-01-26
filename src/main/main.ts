import * as path from "path";
import { app, BrowserWindow } from "electron";
import { is } from "electron-util";
import { jsonStore } from "src/main/json-store";

let win: BrowserWindow | null = null;

const positionStore = jsonStore<{
  position: [number, number];
  size: [number, number];
}>("position.json", { position: [0, 0], size: [500, 500] });

function restoreWindowPosition() {
  const { position, size } = positionStore.value;
  win!.setPosition(...position);
  win!.setSize(...size);
}

function persistWindowPosition() {
  positionStore.value = {
    position: win!.getPosition() as [number, number],
    size: win!.getSize() as [number, number],
  };
}

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 820,
    minHeight: 600,
    minWidth: 650,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  const isDev = is.development;

  if (isDev) {
    // this is the default port electron-esbuild is using
    win.loadURL("http://localhost:9080");
  } else {
    win.loadURL(
      new URL({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
      } as URL).toString(),
    );
  }

  win.on("closed", () => {
    win = null;
  });

  win.webContents.on("devtools-opened", () => {
    win!.focus();
  });

  win.on("ready-to-show", () => {
    win!.show();
    win!.focus();
    restoreWindowPosition();
    if (isDev) win!.webContents.openDevTools({ mode: "bottom" });
  });

  win.on("resized", persistWindowPosition);
  win.on("moved", persistWindowPosition);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (!is.macos) app.quit();
});

app.on("activate", () => {
  if (win === null && app.isReady()) createWindow();
});
