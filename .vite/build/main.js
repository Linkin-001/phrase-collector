"use strict";
const {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  ipcMain,
  Menu,
  dialog,
  shell
} = require("electron");
const path = require("path");
const Database = require(path.join(__dirname, "database"));
const { getSelectionText } = require("@xitanggg/node-selection");
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
let database;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    icon: path.join(__dirname, "../assets/icon.svg"),
    show: false
  });
  {
    mainWindow.loadURL("http://localhost:3000");
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => {
    app.quit();
  });
};
const registerGlobalShortcuts = () => {
  const success = globalShortcut.register("CommandOrControl+Q", async () => {
    console.log("Ctrl+Q 快捷键被触发");
    try {
      const selectedText = getSelectionText();
      console.log("获取到的选中文本:", selectedText);
      mainWindow.show();
      mainWindow.focus();
      if (selectedText && selectedText.trim()) {
        console.log("发送快速捕获事件，文本:", selectedText.trim());
        mainWindow.webContents.send("quick-capture", {
          text: selectedText.trim()
        });
      } else {
        console.log("没有选中文本，发送空捕获事件");
        mainWindow.webContents.send("quick-capture-empty");
      }
    } catch (error) {
      console.error("快速捕获失败:", error);
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send("quick-capture-empty");
    }
  });
  if (success) {
    console.log("全局快捷键 Ctrl+Q 注册成功");
  } else {
    console.error("全局快捷键 Ctrl+Q 注册失败");
  }
};
const setApplicationMenu = () => {
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "新建短语",
          click: () => {
            mainWindow.webContents.send("new-phrase");
          }
        },
        {
          label: "导出数据",
          click: () => {
            mainWindow.webContents.send("export-data");
          }
        },
        { type: "separator" },
        {
          label: "退出",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", role: "undo" },
        {
          label: "重做",
          role: "redo"
        },
        { type: "separator" },
        { label: "剪切", role: "cut" },
        { label: "复制", role: "copy" },
        { label: "粘贴", role: "paste" }
      ]
    },
    {
      label: "查看",
      submenu: [
        {
          label: "重新加载",
          role: "reload"
        },
        {
          label: "强制重新加载",
          role: "forceReload"
        },
        { label: "开发者工具", role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "实际大小",
          role: "resetZoom"
        },
        { label: "放大", role: "zoomIn" },
        { label: "缩小", role: "zoomOut" },
        { type: "separator" },
        { label: "全屏", role: "togglefullscreen" }
      ]
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "关于",
          click: () => {
            mainWindow.webContents.send("show-about");
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
app.whenReady().then(async () => {
  database = new Database();
  await database.init();
  createWindow();
  registerGlobalShortcuts();
  setApplicationMenu();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  app.quit();
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
ipcMain.handle("get-phrases", async (event, options = {}) => {
  return await database.getPhrases(options);
});
ipcMain.handle("add-phrase", async (event, phraseData) => {
  return await database.addPhrase(phraseData);
});
ipcMain.handle("update-phrase", async (event, id, phraseData) => {
  return await database.updatePhrase(id, phraseData);
});
ipcMain.handle("delete-phrase", async (event, id) => {
  return await database.deletePhrase(id);
});
ipcMain.handle("search-phrases", async (event, query) => {
  return await database.searchPhrases(query);
});
ipcMain.handle("get-phrase-stats", async () => {
  return await database.getPhraseStats();
});
ipcMain.handle("export-phrases", async (event, format) => {
  return await database.exportPhrases(format);
});
