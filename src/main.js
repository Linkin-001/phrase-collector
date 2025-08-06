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
let hotReload = null;

// 创建主窗口
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    minWidth: 800,
    minHeight: 600,
    // frame: false,
    // autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, "../assets/icon.svg"),
    show: false,
  });

  // Load the app using built files
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // 窗口准备好后显示
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭事件处理
  mainWindow.on('close', async (event) => {
    if (!isQuitting) {
      event.preventDefault();
      
      // 检查用户是否设置了"不再提示"
      const dontShowExitConfirm = await database.getSetting('dontShowExitConfirm', false);
      const exitBehavior = await database.getSetting('exitBehavior', null);
      
      if (dontShowExitConfirm && exitBehavior) {
        // 直接执行用户之前选择的操作
        if (exitBehavior === 'quit') {
          isQuitting = true;
          app.quit();
        } else if (exitBehavior === 'minimize') {
          mainWindow.hide();
        }
      } else {
        // 发送显示退出确认弹窗的事件到渲染进程
        mainWindow.webContents.send('show-exit-confirm');
      }
    }
  });
  
  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    if (isQuitting) {
      app.quit();
    }
  });

  // 初始化热重载（仅开发环境）
  if (process.env.NODE_ENV === 'development') {
    try {
      const HotReload = require(path.join(__dirname, '../src/hot-reload'));
      hotReload = new HotReload(mainWindow);
      hotReload.init();
    } catch (error) {
      console.log('Hot reload module not available:', error.message);
    }
  }
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
        click: async () => {
          // 检查用户是否设置了"不再提示"
          const dontShowExitConfirm = await database.getSetting('dontShowExitConfirm', false);
          const exitBehavior = await database.getSetting('exitBehavior', null);
          
          if (dontShowExitConfirm && exitBehavior) {
            // 直接执行用户之前选择的操作
            if (exitBehavior === 'quit') {
              isQuitting = true;
              app.quit();
            } else if (exitBehavior === 'minimize') {
              mainWindow.hide();
            }
          } else {
            // 显示退出确认对话框
            showMainWindow();
            mainWindow.webContents.send('show-exit-confirm');
          }
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
  // setApplicationMenu(); // 移除应用菜单栏

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
  
  // 清理热重载资源
  if (hotReload) {
    hotReload.destroy();
    hotReload = null;
  }
  
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
ipcMain.on('exit-choice', async (event, choiceData) => {
  const { action, dontShowAgain } = choiceData;
  
  // 如果用户选择了"不再提示"，保存设置
  if (dontShowAgain && action !== 'cancel') {
    await database.setSetting('exitBehavior', action);
    await database.setSetting('dontShowExitConfirm', true);
  }
  
  if (action === 'quit') {
    // 退出软件
    isQuitting = true;
    app.quit();
  } else if (action === 'minimize') {
    // 最小化到托盘
    mainWindow.hide();
  }
  // action === 'cancel' 时不做任何操作
});

// 重置退出确认设置
ipcMain.handle('reset-exit-confirm', async () => {
  await database.setSetting('dontShowExitConfirm', false);
  await database.setSetting('exitBehavior', null);
  return true;
});

// 获取退出确认设置
ipcMain.handle('get-exit-confirm-settings', async () => {
  const dontShowExitConfirm = await database.getSetting('dontShowExitConfirm', false);
  const exitBehavior = await database.getSetting('exitBehavior', null);
  return { dontShowExitConfirm, exitBehavior };
});

// 获取应用信息
ipcMain.handle('get-app-info', async () => {
  try {
    const stats = await database.getPhraseStats();
    const dbPath = database.getDbPath();
    
    return {
      version: app.getVersion(),
      buildVersion: process.env.npm_package_version || app.getVersion(),
      dbPath: dbPath,
      stats: {
        total: stats.total || 0,
        unknown: stats.unknown || 0,
        dbSize: await database.getDbSize() || 0
      }
    };
  } catch (error) {
    console.error('获取应用信息失败:', error);
    throw error;
  }
});

// 打开数据库位置
ipcMain.handle('open-db-location', async () => {
  try {
    const dbPath = database.getDbPath();
    const dbDir = path.dirname(dbPath);
    await shell.openPath(dbDir);
    return true;
  } catch (error) {
    console.error('打开数据库位置失败:', error);
    throw error;
  }
});
