const {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  ipcMain,
  Menu,
  dialog,
  shell,
  Tray,
} = require("electron");
const path = require("path");
const Database = require(path.join(__dirname, 'database'));
const { getSelectionText } = require("@xitanggg/node-selection");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let database;
let tray = null;
let isQuitting = false;

// 创建主窗口
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, "../assets/icon.svg"),
    show: false,
  });

  // Load the app using built files in production, dev server only in development
  if (process.env.NODE_ENV === "development" && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭事件处理
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      
      // 发送显示退出确认弹窗的事件到渲染进程
      mainWindow.webContents.send('show-exit-confirm');
    }
  });
  
  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    if (isQuitting) {
      app.quit();
    }
  });
};

// 注册全局快捷键
const registerGlobalShortcuts = () => {
  // Ctrl+Q 快速获取用户鼠标选中文本
  const success = globalShortcut.register("CommandOrControl+Q", async () => {
    console.log("Ctrl+Q 快捷键被触发");
    try {
      // 直接调用三方库
      const selectedText = getSelectionText();
      console.log("获取到的选中文本:", selectedText);

      // 窗口信息功能已移除

      // 显示窗口
      showMainWindow();

      if (selectedText && selectedText.trim()) {
        console.log("发送快速捕获事件，文本:", selectedText.trim());
        // 发送剪贴板内容到渲染进程
        mainWindow.webContents.send("quick-capture", {
          text: selectedText.trim()
        });
      } else {
        console.log("没有选中文本，发送空捕获事件");
        // 如果剪贴板为空，显示提示
        mainWindow.webContents.send("quick-capture-empty");
      }
    } catch (error) {
      console.error("快速捕获失败:", error);
      showMainWindow();
      mainWindow.webContents.send("quick-capture-empty");
    }
  });
  
  if (success) {
    console.log("全局快捷键 Ctrl+Q 注册成功");
  } else {
    console.error("全局快捷键 Ctrl+Q 注册失败");
  }
};

// 创建系统托盘
const createTray = () => {
  try {
    // 使用ICO格式图标，Windows系统兼容性更好
    const iconPath = path.join(__dirname, "../build/icon.ico");
    tray = new Tray(iconPath);
    
    // 设置托盘提示文本
    tray.setToolTip('Phrase Collector');
    
    // 创建托盘右键菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          showMainWindow();
        }
      },
      {
        label: '退出',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    // 设置托盘右键菜单
    tray.setContextMenu(contextMenu);
    
    // 双击托盘图标显示窗口
    tray.on('double-click', () => {
      showMainWindow();
    });
    
    console.log('系统托盘创建成功');
  } catch (error) {
    console.error('创建系统托盘失败:', error);
    tray = null;
  }
};

// 显示主窗口的统一方法
const showMainWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    
    // 在Windows上确保窗口置顶
    if (process.platform === 'win32') {
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setAlwaysOnTop(false);
    }
  }
};

// 设置应用菜单
const setApplicationMenu = () => {
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "新建短语",
          click: () => {
            mainWindow.webContents.send("new-phrase");
          },
        },
        {
          label: "导出数据",
          click: () => {
            mainWindow.webContents.send("export-data");
          },
        },
        { type: "separator" },
        {
          label: "退出",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", role: "undo" },
        {
          label: "重做",
          role: "redo",
        },
        { type: "separator" },
        { label: "剪切", role: "cut" },
        { label: "复制", role: "copy" },
        { label: "粘贴", role: "paste" },
      ],
    },
    {
      label: "查看",
      submenu: [
        {
          label: "重新加载",
          role: "reload",
        },
        {
          label: "强制重新加载",
          role: "forceReload",
        },
        { label: "开发者工具", role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "实际大小",
          role: "resetZoom",
        },
        { label: "放大", role: "zoomIn" },
        { label: "缩小", role: "zoomOut" },
        { type: "separator" },
        { label: "全屏", role: "togglefullscreen" },
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
  createTray();
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
  // 如果有托盘图标，不退出应用，让应用在后台运行
  if (!tray) {
    app.quit();
  }
});

// 应用退出前
app.on("will-quit", () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
  
  // 销毁托盘图标
  if (tray) {
    tray.destroy();
  }
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

// 处理退出确认选择
ipcMain.on('exit-choice', (event, choice) => {
  if (choice === 'quit') {
    // 退出软件
    isQuitting = true;
    app.quit();
  } else if (choice === 'minimize') {
    // 最小化到托盘
    mainWindow.hide();
  }
  // choice === 'cancel' 时不做任何操作
});
