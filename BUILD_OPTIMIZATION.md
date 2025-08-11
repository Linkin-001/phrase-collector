# 构建优化说明

## 问题描述
安装包大小随着每次构建而增长，主要原因：
1. 构建前没有清理上次的构建产物
2. 构建配置包含了整个 `node_modules` 目录

## 优化措施

### 1. 添加清理脚本
- 新增 `clean` 脚本：`rimraf dist`
- 新增 `prebuild` 脚本：自动在构建前清理
- 安装 `rimraf@3.0.2` 作为开发依赖

### 2. 优化构建配置
移除了 `package.json` 中 `build.files` 配置中的：
- `node_modules/**/*` - 这是导致安装包过大的主要原因
- 不必要的排除规则

### 3. 使用方法

#### 手动清理
```bash
npm run clean
```

#### 构建（自动清理）
```bash
npm run build        # 自动清理后构建
npm run build:win    # Windows 版本
npm run build:mac    # macOS 版本
npm run build:linux  # Linux 版本
```

## 预期效果
- 每次构建前自动清理旧文件
- 显著减小安装包大小
- 避免构建产物累积
- 确保构建的一致性

## 注意事项
- `rimraf` 使用 3.0.2 版本以兼容 Node.js 18
- 构建配置移除了 `node_modules` 包含，Electron Builder 会自动处理依赖
- 开发模式 (`npm run dev`) 不受影响