const {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  ipcMain,
  Menu,
} = require("electron");
const path = require("path");
const Database = require("./src/database");
const { getSelectionText } = require("@xitanggg/node-selection");

let mainWindow;
let database;

// 创建主窗口
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "assets/icon.svg"),
    show: false,
  });

  mainWindow.loadFile("src/renderer/index.html");

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
};

// 注册全局快捷键
const registerGlobalShortcuts = () => {
  // Ctrl+Q 快速获取用户鼠标选中文本
  globalShortcut.register("CommandOrControl+Q", () => {
    try {
      // 直接调用三方库
      const selectedText = getSelectionText();

      // 显示窗口
      mainWindow.show();
      mainWindow.focus();

      if (selectedText && selectedText.trim()) {
        // 发送剪贴板内容到渲染进程
        mainWindow.webContents.send("quick-capture", selectedText.trim());
      } else {
        // 如果剪贴板为空，显示提示
        mainWindow.webContents.send("quick-capture-empty");
      }
    } catch (error) {
      console.error("快速捕获失败:", error);
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send("quick-capture-empty");
    }
  });

 

  // Ctrl+Alt+Q 直接打开窗口
  globalShortcut.register("CommandOrControl+Alt+Q", () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("quick-capture-empty");
  });

  // Ctrl+Shift+F 聚焦搜索框
  globalShortcut.register("CommandOrControl+Shift+F", () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("focus-search");
  });
};

// 设置应用菜单
const setApplicationMenu = () => {
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "新建短语",
          accelerator: "CommandOrControl+N",
          click: () => {
            mainWindow.webContents.send("new-phrase");
          },
        },
        {
          label: "导出数据",
          accelerator: "CommandOrControl+E",
          click: () => {
            mainWindow.webContents.send("export-data");
          },
        },
        { type: "separator" },
        {
          label: "退出",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", accelerator: "CommandOrControl+Z", role: "undo" },
        {
          label: "重做",
          accelerator: "Shift+CommandOrControl+Z",
          role: "redo",
        },
        { type: "separator" },
        { label: "剪切", accelerator: "CommandOrControl+X", role: "cut" },
        { label: "复制", accelerator: "CommandOrControl+C", role: "copy" },
        { label: "粘贴", accelerator: "CommandOrControl+V", role: "paste" },
      ],
    },
    {
      label: "查看",
      submenu: [
        {
          label: "重新加载",
          accelerator: "CommandOrControl+R",
          role: "reload",
        },
        {
          label: "强制重新加载",
          accelerator: "CommandOrControl+Shift+R",
          role: "forceReload",
        },
        { label: "开发者工具", accelerator: "F12", role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "实际大小",
          accelerator: "CommandOrControl+0",
          role: "resetZoom",
        },
        { label: "放大", accelerator: "CommandOrControl+Plus", role: "zoomIn" },
        { label: "缩小", accelerator: "CommandOrControl+-", role: "zoomOut" },
        { type: "separator" },
        { label: "全屏", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "关于",
          click: () => {
            mainWindow.webContents.send("show-about");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// 应用准备就绪
app.whenReady().then(async () => {
  // 初始化数据库
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

// 所有窗口关闭时
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 应用退出前
app.on("will-quit", () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});

// IPC 通信处理
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
