# 快速部署指南

## ✅ 已完成的配置

1. ✅ 创建了环境配置文件 `app/js/env-config.js` - 自动检测本地/生产环境
2. ✅ 更新了前端代码以使用环境配置
3. ✅ 创建了 GitHub Actions 工作流 `.github/workflows/deploy.yml`
4. ✅ 创建了 Render 配置文件 `render.yaml`
5. ✅ 更新了后端代码以支持环境变量 (PORT)
6. ✅ 创建了 Python requirements.txt
7. ✅ 添加了 `.nojekyll` 文件用于 GitHub Pages

## 🚀 立即开始部署

### 前端 (GitHub Pages)

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin master
   ```

2. **启用 GitHub Pages**
   - 访问: https://github.com/Yuranz6/Technation-Healthsync-2025/settings/pages
   - Source: 选择 `master` 分支，文件夹选择 `/app`
   - 保存

3. **等待部署完成** (约 1-2 分钟)
   - 访问: https://yuranz6.github.io/Technation-Healthsync-2025/

### 后端 (Render)

#### Hybrid Model API

1. 访问 https://render.com
2. 登录 (yuranzhang6@gmail.com)
3. 点击 **New +** → **Web Service**
4. 连接 GitHub 仓库
5. 配置:
   - Name: `healthsync-hybrid-model`
   - Build: `cd Model/app && pip install -r requirements.txt`
   - Start: `cd Model/app && python main.py`
6. 环境变量:
   - `PORT`: `8000`
7. 创建服务

#### Backend API

1. 点击 **New +** → **Web Service**
2. 连接相同的 GitHub 仓库
3. 配置:
   - Name: `healthsync-backend`
   - Build: `cd app && npm install`
   - Start: `cd app && node server.mjs`
4. 环境变量:
   - `PORT`: `5001`
   - `SUPABASE_URL`: (您的 Supabase URL)
   - `SUPABASE_KEY`: (您的 Supabase 密钥)
5. 创建服务

## ⚠️ 重要: 更新 API URL

部署完成后，**必须**更新 `app/js/env-config.js` 中的生产环境 URL:

```javascript
// 在 app/js/env-config.js 中，找到 getApiUrls() 方法
// 更新为您的实际 Render URL:

return {
    hybridModelApi: 'https://healthsync-hybrid-model-XXXX.onrender.com',  // 替换为实际 URL
    backendApi: 'https://healthsync-backend-XXXX.onrender.com'  // 替换为实际 URL
};
```

## 📝 检查清单

- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用
- [ ] Hybrid Model API 已部署到 Render
- [ ] Backend API 已部署到 Render
- [ ] 环境变量已设置
- [ ] `env-config.js` 中的 URL 已更新
- [ ] 测试前端是否可以访问后端 API

## 🔗 有用的链接

- GitHub 仓库: https://github.com/Yuranz6/Technation-Healthsync-2025
- Render Dashboard: https://dashboard.render.com
- 详细部署文档: 查看 `DEPLOYMENT.md` 或 `DEPLOYMENT_CN.md`

