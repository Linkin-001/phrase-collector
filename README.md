# Phrase Collector - 短语收集器

一款基于 Electron 的短语收集应用，帮助用户高效收集、管理和复习重要短语。

## 功能特性

- **快速捕获**：支持全局快捷键快速收集选中文本
- **智能管理**：按时间排序，支持搜索和标记功能
- **标记系统**：标记"不认识"的短语，重点复习
- **数据导出**：支持导出为 CSV/JSON 格式

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### 快捷键

#### 文本捕获
- `Ctrl+Q`: 选中文字后直接添加（智能获取），打开应用窗口，复制文字后快速添加到短语库

## 技术栈

- **框架**：Electron + Vue 3
- **UI库**：Bootstrap 5
- **数据库**：SQLite
- **构建工具**：Vite

## 许可证

MIT License