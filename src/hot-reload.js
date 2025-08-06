const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// 热重载模块 - 仅在开发环境使用
class HotReload {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.watchers = [];
    this.debounceTimer = null;
    this.isReloading = false;
  }

  // 初始化热重载
  init() {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Hot reload disabled in production');
      return;
    }

    console.log('🔥 Hot reload enabled for development');
    this.watchFiles();
  }

  // 监听文件变化
  watchFiles() {
    const watchPaths = [
      path.join(__dirname, 'renderer'),
      path.join(__dirname, 'components'),
      path.join(__dirname, 'database.js'),
    ];

    watchPaths.forEach(watchPath => {
      if (fs.existsSync(watchPath)) {
        const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && this.shouldReload(filename)) {
            this.debounceReload();
          }
        });
        this.watchers.push(watcher);
        console.log(`📁 Watching: ${watchPath}`);
      }
    });
  }

  // 判断是否需要重载
  shouldReload(filename) {
    const ext = path.extname(filename);
    const reloadExtensions = ['.js', '.vue', '.css', '.html', '.json'];
    return reloadExtensions.includes(ext) && !filename.includes('node_modules');
  }

  // 防抖重载
  debounceReload() {
    if (this.isReloading) return;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.reload();
    }, 300); // 300ms 防抖
  }

  // 执行重载
  reload() {
    if (this.isReloading || !this.mainWindow) return;

    this.isReloading = true;
    console.log('🔄 Reloading application...');

    try {
      // 重载渲染进程
      this.mainWindow.webContents.reload();
      
      // 如果需要重启主进程（当主进程文件变化时）
      // this.restartApp();
      
      setTimeout(() => {
        this.isReloading = false;
        console.log('✅ Reload completed');
      }, 1000);
    } catch (error) {
      console.error('❌ Reload failed:', error);
      this.isReloading = false;
    }
  }

  // 重启应用（主进程变化时）
  restartApp() {
    console.log('🔄 Restarting application...');
    app.relaunch();
    app.exit(0);
  }

  // 清理资源
  destroy() {
    this.watchers.forEach(watcher => {
      try {
        watcher.close();
      } catch (error) {
        console.error('Error closing watcher:', error);
      }
    });
    this.watchers = [];
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    console.log('🔥 Hot reload destroyed');
  }
}

module.exports = HotReload;