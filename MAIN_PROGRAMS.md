# 主要程序文件说明

## 🎯 核心后端服务

### 1. **混合模型 API 服务** (Python/FastAPI)
**文件路径**: `Model/app/main.py`
- **作用**: 提供 AI 诊断服务的后端 API
- **技术栈**: FastAPI, ClinicalBERT, XGBoost, RAG
- **主要功能**:
  - 加载 ClinicalBERT 模型（延迟加载以节省内存）
  - 处理临床文本分析
  - XGBoost 结构化数据分析
  - RAG 知识检索系统
  - 提供 `/predict`, `/health`, `/keys` 等 API 端点
- **部署端口**: 8000 (Render)
- **关键特性**: 
  - 延迟模型加载（首次请求时加载）
  - 内存优化（适配 Render 免费版 512MB 限制）
  - 在线模型回退机制

### 2. **后端 API 服务** (Node.js/Express)
**文件路径**: `app/server.mjs`
- **作用**: 提供环境变量配置（Supabase 密钥）
- **技术栈**: Node.js, Express
- **主要功能**:
  - 提供 `/keys` 端点返回 Supabase 配置
  - 作为前端和后端服务之间的桥梁
- **部署端口**: 5001 (Render)

---

## 🎨 前端核心程序

### 3. **混合模型前端客户端**
**文件路径**: `app/js/hybrid-model.js`
- **作用**: 前端与混合模型 API 交互的核心类
- **主要功能**:
  - 连接混合模型 API
  - 处理患者数据提交
  - 调用 AI 诊断分析
  - 显示诊断结果
  - 本地回退分析（当 API 不可用时）
- **关键类**: `HybridModelSystem`

### 4. **主前端逻辑**
**文件路径**: `app/js/main.js`
- **作用**: 前端应用的核心初始化逻辑
- **主要功能**:
  - 初始化 Supabase 客户端
  - 处理用户认证
  - 页面导航高亮
  - 全局工具函数

### 5. **环境配置**
**文件路径**: `app/js/env-config.js`
- **作用**: 动态检测环境并返回正确的 API URL
- **主要功能**:
  - 检测本地/生产环境
  - 返回对应的 API 基础 URL
  - 支持 GitHub Pages 和本地开发

### 6. **其他前端模块**
- **`app/js/registration.js`**: 用户注册逻辑
- **`app/js/patient-form.js`**: 患者表单处理
- **`app/js/dashboard.js`**: 仪表板功能
- **`app/js/results.js`**: 结果显示逻辑

---

## 📄 主要前端页面

### 7. **主页**
**文件路径**: `app/index.html`
- 应用入口页面
- 包含 URL 格式提示
- 导航到各个功能模块

### 8. **登录页面**
**文件路径**: `app/login.html`
- 用户登录界面
- Supabase 认证集成

### 9. **注册页面**
**文件路径**: `app/register.html`
- 新用户注册界面

### 10. **临床诊断页面**
**文件路径**: `app/clinical-diagnosis.html`
- **核心功能页面**
- AI 诊断界面
- 患者信息输入
- 诊断结果展示

---

## ⚙️ 配置文件

### 11. **部署配置**
**文件路径**: `render.yaml`
- Render 平台部署蓝图
- 定义两个服务（Python + Node.js）
- 环境变量配置
- 构建和启动命令

### 12. **GitHub Actions 工作流**
**文件路径**: `.github/workflows/deploy.yml`
- 自动部署到 GitHub Pages
- 从 `app/` 目录部署前端

---

## 🔄 程序执行流程

### 前端访问流程：
1. 用户访问 `index.html` → 加载 `main.js` → 初始化 Supabase
2. 用户登录 → 跳转到 `clinical-diagnosis.html`
3. 填写诊断表单 → `hybrid-model.js` 调用 API
4. `hybrid-model.js` 通过 `env-config.js` 获取正确的 API URL
5. 发送请求到 `Model/app/main.py` (端口 8000)

### 后端处理流程：
1. FastAPI 接收请求 → 延迟加载模型（如未加载）
2. ClinicalBERT 分析文本 → XGBoost 分析结构化数据
3. RAG 系统检索相关知识
4. 返回综合诊断结果

### 环境变量获取：
1. 前端需要 Supabase 密钥 → 调用 `app/server.mjs` (端口 5001) 的 `/keys` 端点
2. 或直接调用 `Model/app/main.py` 的 `/keys` 端点（已添加）

---

## 📊 技术架构总结

```
前端 (GitHub Pages)
├── HTML 页面
├── JavaScript 模块
│   ├── env-config.js (环境检测)
│   ├── main.js (初始化)
│   └── hybrid-model.js (API 客户端)
└── CSS 样式

后端 (Render)
├── Python 服务 (端口 8000)
│   └── Model/app/main.py (混合模型 API)
└── Node.js 服务 (端口 5001)
    └── app/server.mjs (配置服务)
```

---

## 🎯 最重要的 5 个文件

1. **`Model/app/main.py`** - 核心 AI 诊断服务
2. **`app/js/hybrid-model.js`** - 前端 API 客户端
3. **`app/clinical-diagnosis.html`** - 主要功能页面
4. **`app/js/main.js`** - 前端初始化
5. **`render.yaml`** - 部署配置



