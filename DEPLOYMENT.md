# 部署指南 (Deployment Guide)

本指南将帮助您将 HealthSync AI 前端部署到 GitHub Pages，后端部署到 Render。

## 📋 目录

1. [前端部署到 GitHub Pages](#前端部署到-github-pages)
2. [后端部署到 Render](#后端部署到-render)
3. [环境变量配置](#环境变量配置)
4. [更新 API URL](#更新-api-url)

## 🌐 前端部署到 GitHub Pages

### 步骤 1: 启用 GitHub Pages

1. 访问您的 GitHub 仓库: `https://github.com/Yuranz6/Technation-Healthsync-2025`
2. 点击 **Settings** (设置)
3. 在左侧菜单中找到 **Pages** (页面)
4. 在 **Source** 部分，选择:
   - **Branch**: `master` 或 `main`
   - **Folder**: `/app` (或 `/ (root)` 如果您的文件在根目录)
5. 点击 **Save** (保存)

### 步骤 2: 配置 GitHub Actions (可选但推荐)

GitHub Actions 工作流已配置在 `.github/workflows/deploy.yml`。当您推送到主分支时，它会自动部署。

### 步骤 3: 访问您的网站

部署完成后，您的网站将在以下 URL 可用:
```
https://yuranz6.github.io/Technation-Healthsync-2025/
```

**注意**: 如果您的仓库名称与用户名不同，URL 格式为:
```
https://[username].github.io/[repository-name]/
```

## 🚀 后端部署到 Render

### 步骤 1: 登录 Render

1. 访问 [Render](https://render.com)
2. 使用您的邮箱 `yuranzhang6@gmail.com` 登录或注册

### 步骤 2: 部署 Hybrid Model API (FastAPI)

1. 在 Render Dashboard 中，点击 **New +** → **Web Service**
2. 连接您的 GitHub 仓库: `Yuranz6/Technation-Healthsync-2025`
3. 配置服务:
   - **Name**: `healthsync-hybrid-model`
   - **Environment**: `Python 3`
   - **Build Command**: `cd Model/app && pip install -r requirements.txt`
   - **Start Command**: `cd Model/app && python main.py`
   - **Plan**: Free (或选择付费计划)

4. 设置环境变量:
   - `PORT`: `8000` (Render 会自动设置，但可以显式设置)
   - `HEALTHSYNC_DATA_DIR`: `/opt/render/project/src/data` (如果需要)
   - `LOCAL_MODEL_PATH`: (可选，如果使用本地模型)

5. 点击 **Create Web Service**

### 步骤 3: 部署 Backend API (Node.js)

1. 在 Render Dashboard 中，点击 **New +** → **Web Service**
2. 连接相同的 GitHub 仓库
3. 配置服务:
   - **Name**: `healthsync-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd app && npm install`
   - **Start Command**: `cd app && node server.mjs`
   - **Plan**: Free

4. 设置环境变量:
   - `PORT`: `5001` (Render 会自动设置)
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: 您的 Supabase URL
   - `SUPABASE_KEY`: 您的 Supabase 匿名密钥

5. 点击 **Create Web Service**

### 步骤 4: 获取 Render URL

部署完成后，Render 会为每个服务提供一个 URL，例如:
- Hybrid Model API: `https://healthsync-hybrid-model.onrender.com`
- Backend API: `https://healthsync-backend.onrender.com`

## 🔧 环境变量配置

### 前端环境变量

前端使用 `app/js/env-config.js` 自动检测环境。在生产环境中，它会使用 Render 的 URL。

### 更新 API URL

如果您的 Render URL 不同，请更新 `app/js/env-config.js`:

```javascript
return {
    hybridModelApi: 'https://your-actual-render-url.onrender.com',
    backendApi: 'https://your-actual-backend-url.onrender.com'
};
```

### 后端环境变量 (Render)

在 Render Dashboard 中为每个服务设置以下环境变量:

#### Hybrid Model API
- `PORT`: `8000`
- `HEALTHSYNC_DATA_DIR`: `/opt/render/project/src/data` (可选)
- `LOCAL_MODEL_PATH`: (可选)

#### Backend API
- `PORT`: `5001`
- `NODE_ENV`: `production`
- `SUPABASE_URL`: 您的 Supabase 项目 URL
- `SUPABASE_KEY`: 您的 Supabase 匿名密钥

## 📝 使用 render.yaml (可选)

项目包含 `render.yaml` 文件，您可以使用它来批量部署服务:

1. 在 Render Dashboard 中，点击 **New +** → **Blueprint**
2. 选择您的 GitHub 仓库
3. Render 会自动读取 `render.yaml` 并创建服务

**注意**: 使用 Blueprint 时，您仍需要在 Render Dashboard 中设置敏感的环境变量（如 Supabase 密钥）。

## ✅ 验证部署

### 检查前端

1. 访问您的 GitHub Pages URL
2. 打开浏览器开发者工具 (F12)
3. 检查控制台是否有错误
4. 测试 API 连接

### 检查后端

1. 访问 Hybrid Model API 健康检查:
   ```
   https://your-hybrid-model-url.onrender.com/health
   ```

2. 访问 Backend API:
   ```
   https://your-backend-url.onrender.com/keys
   ```

## 🔍 故障排除

### 前端问题

- **404 错误**: 检查 GitHub Pages 设置中的文件夹路径
- **API 连接失败**: 检查 `env-config.js` 中的 URL 是否正确
- **CORS 错误**: 确保后端 API 允许来自 GitHub Pages 域的请求

### 后端问题

- **构建失败**: 检查 `requirements.txt` 和 `package.json` 是否正确
- **服务无法启动**: 检查 Render 日志中的错误信息
- **环境变量未设置**: 在 Render Dashboard 中确认所有环境变量都已设置

### Render 免费计划限制

- 服务在 15 分钟不活动后会休眠
- 首次请求可能需要 30-60 秒来唤醒服务
- 考虑升级到付费计划以获得更好的性能

## 📚 相关文档

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Render 文档](https://render.com/docs)
- [FastAPI 部署指南](https://fastapi.tiangolo.com/deployment/)

## 🆘 需要帮助?

如果遇到问题，请检查:
1. GitHub Actions 日志 (如果使用)
2. Render 服务日志
3. 浏览器控制台错误
4. 网络请求失败信息

---

**部署完成后，记得更新 `app/js/env-config.js` 中的生产环境 URL！**

