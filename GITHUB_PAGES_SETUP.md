# GitHub Pages 设置指南

## 当前状态

GitHub Pages 已配置为从 `/app` 目录部署。

## 检查 GitHub Pages 设置

1. 访问仓库设置：
   ```
   https://github.com/Yuranz6/Technation-Healthsync-2025/settings/pages
   ```

2. 确认以下设置：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**: 选择 `master` 或 `main`
   - **Folder**: 选择 `/app` 或 `/ (root)`

## 如果使用 GitHub Actions 部署

如果使用 GitHub Actions（`.github/workflows/deploy.yml`），需要：

1. 在仓库设置中启用 GitHub Pages：
   - 访问：`Settings` → `Pages`
   - **Source**: 选择 `GitHub Actions`

2. 检查 Actions 是否运行：
   - 访问：`Actions` 标签页
   - 查看最新的工作流运行状态

## 访问网站

部署完成后，网站将在以下 URL 可用：
```
https://yuranz6.github.io/Technation-Healthsync-2025/
```

**注意**：如果仓库名称与用户名不同，URL 格式为：
```
https://[username].github.io/[repository-name]/
```

## 测试页面

访问测试页面：
```
https://yuranz6.github.io/Technation-Healthsync-2025/test-backend-connection.html
```

## 故障排除

### 404 错误

1. **检查文件是否存在**：
   - 确认 `app/test-backend-connection.html` 文件已提交
   - 检查文件路径是否正确

2. **检查 GitHub Pages 设置**：
   - 确认 Source 文件夹设置为 `/app`
   - 确认分支选择正确

3. **等待部署完成**：
   - GitHub Pages 部署可能需要几分钟
   - 检查 Actions 标签页查看部署状态

4. **清除浏览器缓存**：
   - 使用硬刷新（Ctrl+F5 或 Cmd+Shift+R）

### 文件路径问题

如果使用 GitHub Pages，所有路径应该是相对于网站根目录的：
- ✅ 正确：`./js/env-config.js` 或 `/js/env-config.js`
- ❌ 错误：`../js/env-config.js`（如果文件在根目录）

## 手动触发部署

如果需要手动触发 GitHub Actions 部署：

1. 访问 `Actions` 标签页
2. 选择 `Deploy to GitHub Pages` 工作流
3. 点击 `Run workflow`
4. 选择分支（通常是 `master`）
5. 点击 `Run workflow` 按钮

## 检查部署状态

1. 访问仓库的 `Actions` 标签页
2. 查看最新的工作流运行
3. 检查是否有错误
4. 查看部署日志

