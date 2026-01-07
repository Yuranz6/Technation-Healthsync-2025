# 修复 GitHub Pages 显示 README 的问题

## 问题
GitHub Pages 显示的是 README.md 而不是前端应用。

## 解决方案

### 方法 1: 使用 GitHub Actions（推荐）

1. **检查 GitHub Pages 设置**：
   - 访问：https://github.com/Yuranz6/Technation-Healthsync-2025/settings/pages
   - **Source** 必须选择：`GitHub Actions`（不是 "Deploy from a branch"）
   - 如果显示 "Deploy from a branch"，需要改为 "GitHub Actions"

2. **触发 GitHub Actions 工作流**：
   - 访问：https://github.com/Yuranz6/Technation-Healthsync-2025/actions
   - 点击左侧的 "Deploy to GitHub Pages" 工作流
   - 点击右上角的 "Run workflow"
   - 选择分支：`master`
   - 点击 "Run workflow" 按钮

3. **等待部署完成**：
   - 查看 Actions 标签页中的工作流运行状态
   - 等待显示绿色勾号（✓）表示成功
   - 通常需要 1-2 分钟

### 方法 2: 使用分支部署（如果方法 1 不行）

1. **访问 GitHub Pages 设置**：
   - https://github.com/Yuranz6/Technation-Healthsync-2025/settings/pages

2. **更改设置**：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**: 选择 `master`
   - **Folder**: **必须选择 `/app`**（这是关键！）
   - 点击 "Save"

3. **等待部署**：
   - GitHub 会自动部署
   - 等待几分钟后刷新页面

## 验证部署

部署成功后，访问：
```
https://yuranz6.github.io/Technation-Healthsync-2025/
```

应该看到 HealthSync AI 的主页，而不是 README。

## 测试页面

部署成功后，测试页面应该可以访问：
```
https://yuranz6.github.io/Technation-Healthsync-2025/test-backend-connection.html
```

## 常见问题

### 仍然显示 README
- 清除浏览器缓存（Ctrl+F5 或 Cmd+Shift+R）
- 等待 5-10 分钟让更改生效
- 检查 GitHub Actions 是否有错误

### GitHub Actions 失败
- 检查 Actions 标签页中的错误信息
- 确认 `.github/workflows/deploy.yml` 文件存在
- 确认 `app/index.html` 文件存在

### 404 错误
- 确认 GitHub Pages Source 设置为 `/app` 文件夹
- 确认文件路径使用相对路径（如 `./js/env-config.js`）

