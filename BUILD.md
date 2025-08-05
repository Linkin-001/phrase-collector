# 打包说明

本项目已配置支持 Windows、macOS 和 Linux 平台的打包。

## 图标文件准备

在打包前，请确保 `build/` 目录下有以下图标文件：

- **Windows**: `icon.ico` (已存在)
- **macOS**: `icon.icns` (需要创建)
- **Linux**: `icon.png` (需要创建，建议 512x512 像素)

### 创建 macOS 图标 (.icns)

1. 准备一个 1024x1024 的 PNG 图片
2. 使用在线工具或命令行工具转换为 .icns 格式
3. 将文件命名为 `icon.icns` 并放入 `build/` 目录

### 创建 Linux 图标 (.png)

1. 准备一个 512x512 的 PNG 图片
2. 将文件命名为 `icon.png` 并放入 `build/` 目录

## 安装依赖

```bash
npm install
```

## 打包命令

### 使用 Electron Builder（推荐）
```bash
# 安装依赖
npm install

# 为特定平台打包
npm run build:win    # Windows（已测试成功）
npm run build:mac    # macOS
npm run build:linux  # Linux
npm run build:all    # 所有平台
```

### 使用 Electron Forge（网络问题）
```bash
# 注意：当前由于网络连接问题，Electron Forge 可能无法正常工作
# 如果网络环境良好，可以尝试以下命令：
set ELECTRON_MIRROR= && npm run build:win # Windows
npm run make:mac    # macOS
npm run make:linux  # Linux
```

## 输出目录

- **Electron Forge**: `out/` 目录
- **Electron Builder**: `dist/` 目录

## 跨平台打包注意事项

1. **在 Windows 上打包 macOS 应用**：需要安装额外的依赖
2. **在 macOS 上打包 Windows 应用**：需要安装 Wine
3. **代码签名**：生产环境需要配置相应的证书

## 原生依赖重建

如果遇到原生依赖问题，运行：

```bash
npm run rebuild
```

## 常见问题

1. **robotjs 编译失败**：确保安装了正确的构建工具
2. **图标不显示**：检查图标文件路径和格式
3. **打包失败**：检查依赖是否完整安装