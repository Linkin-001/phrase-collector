# 热重载功能说明

## 概述

本项目已集成热重载功能，可以在开发过程中自动检测文件变化并重新加载应用，提高开发效率。

## 功能特性

- ✅ **自动文件监听**: 监听 `src/renderer`、`src/components`、`src/database.js` 等关键文件
- ✅ **智能过滤**: 只监听 `.js`、`.vue`、`.css`、`.html`、`.json` 等相关文件
- ✅ **防抖机制**: 300ms 防抖，避免频繁重载
- ✅ **开发环境专用**: 仅在开发环境启用，生产构建时自动排除
- ✅ **资源清理**: 应用退出时自动清理监听器

## 使用方法

### 开发环境（启用热重载）
```bash
# 安装依赖
npm install

# 启动开发模式（带热重载）
npm run dev
```

### 生产环境（不包含热重载）
```bash
# 构建生产版本
npm run build

# 或者直接运行（不带热重载）
npm start
```

## 监听的文件类型

- **JavaScript**: `.js` 文件
- **Vue组件**: `.vue` 文件
- **样式文件**: `.css` 文件
- **HTML文件**: `.html` 文件
- **配置文件**: `.json` 文件

## 监听的目录

- `src/renderer/` - 渲染进程相关文件
- `src/components/` - Vue组件文件
- `src/database.js` - 数据库文件

## 工作原理

1. **条件加载**: 只在 `NODE_ENV=development` 时加载热重载模块
2. **文件监听**: 使用 Node.js 的 `fs.watch` API 监听文件变化
3. **防抖处理**: 300ms 内的多次变化只触发一次重载
4. **渲染进程重载**: 检测到变化时重新加载渲染进程
5. **构建时排除**: Vite 构建时通过插件机制排除热重载模块

## 构建配置

### Vite 配置 (vite.main.config.js)
```javascript
// 生产构建时排除热重载模块
plugins: [
  {
    name: 'exclude-hot-reload',
    resolveId(id) {
      if (id.includes('hot-reload') && process.env.NODE_ENV === 'production') {
        return { id: 'virtual:hot-reload', external: false };
      }
    },
    load(id) {
      if (id === 'virtual:hot-reload') {
        return 'module.exports = class HotReload { constructor() {} init() {} destroy() {} };';
      }
    }
  }
]
```

### Package.json 配置
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development npm run build:dev && cross-env NODE_ENV=development electron .",
    "build": "cross-env NODE_ENV=production npm run build:dev && electron-builder"
  },
  "build": {
    "files": [
      "!src/hot-reload.js"  // 排除热重载文件
    ]
  }
}
```

## 日志输出

开发模式下，控制台会显示以下信息：

```
🔥 Hot reload enabled for development
📁 Watching: /path/to/src/renderer
📁 Watching: /path/to/src/components
📁 Watching: /path/to/src/database.js
🔄 Reloading application...
✅ Reload completed
```

## 注意事项

1. **主进程变化**: 当前版本主要重载渲染进程，主进程文件变化需要手动重启
2. **文件路径**: 确保监听的路径存在，不存在的路径会被自动跳过
3. **性能影响**: 热重载仅在开发环境启用，不会影响生产性能
4. **依赖安装**: 需要安装 `cross-env` 依赖来确保跨平台兼容性

## 故障排除

### 热重载不工作
1. 确认使用 `npm run dev` 而不是 `npm start`
2. 检查 `NODE_ENV` 是否设置为 `development`
3. 查看控制台是否有热重载相关日志

### 构建包含热重载代码
1. 确认使用 `npm run build` 而不是 `npm run dev`
2. 检查 `NODE_ENV` 是否设置为 `production`
3. 验证 `package.json` 中的 `files` 配置

## 扩展功能

如需扩展热重载功能，可以修改 `src/hot-reload.js`：

- 添加更多监听目录
- 调整防抖时间
- 添加主进程重启功能
- 自定义重载策略