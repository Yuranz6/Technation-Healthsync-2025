# Hugging Face Token 设置指南

## 在 Render 中设置环境变量

⚠️ **重要**: 请将您的 Hugging Face Token 设置为环境变量，不要提交到代码仓库中。

### 步骤 1: 登录 Render Dashboard
1. 访问 https://dashboard.render.com
2. 登录您的账户

### 步骤 2: 找到服务
1. 在 Dashboard 中找到 `healthsync-hybrid-model` 服务
2. 点击进入服务详情页

### 步骤 3: 设置环境变量
1. 在左侧菜单中点击 **"Environment"** 标签
2. 找到或添加以下环境变量：

   **变量名**: `HF_TOKEN`  
   **变量值**: `您的 Hugging Face Token (格式: hf_xxxxxxxxxxxxx)`
   
   **变量名**: `USE_HF_INFERENCE_API`  
   **变量值**: `true`

3. 点击 **"Save Changes"** 保存

### 步骤 4: 重新部署
1. 环境变量设置后，Render 会自动重新部署服务
2. 或者手动点击 **"Manual Deploy"** → **"Deploy latest commit"**

## 验证设置

部署完成后，检查日志确认 API 已正确初始化：

1. 在 Render Dashboard 中查看服务日志
2. 应该看到类似以下消息：
   ```
   🚀 Using Hugging Face Inference API (no local model loading)
   Model: emilyalsentzer/Bio_ClinicalBERT
   API URL: https://router.huggingface.co/hf-inference/models/emilyalsentzer/Bio_ClinicalBERT
   ✅ Hugging Face Inference API initialized and accessible
   ```

3. 访问健康检查端点：
   ```
   https://technation-healthsync-2025.onrender.com/health
   ```
   
   应该看到：
   ```json
   {
     "models": {
       "clinical_bert": {
         "status": "inference_api",
         "mode": "Hugging Face Inference API",
         "model": "emilyalsentzer/Bio_ClinicalBERT"
       }
     },
     "inference_mode": "api"
   }
   ```

## 安全提示

⚠️ **重要**: 
- 不要将 token 提交到 Git 仓库
- 不要在代码中硬编码 token
- 只在 Render Dashboard 的环境变量中设置
- 如果 token 泄露，请立即在 Hugging Face 中撤销并生成新 token

## 本地测试（可选）

如果您想在本地测试，可以创建 `.env` 文件（不要提交到 Git）：

```bash
# .env (本地开发使用，不要提交到 Git)
USE_HF_INFERENCE_API=true
HF_TOKEN=您的_Hugging_Face_Token
```

然后在本地运行：
```bash
export USE_HF_INFERENCE_API=true
export HF_TOKEN=您的_Hugging_Face_Token
cd Model/app && python main.py
```

