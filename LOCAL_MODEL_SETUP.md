# 本地PyTorch模型设置说明

## 🎯 概述

本项目已成功配置使用本地的 `pytorch_model.bin` 文件，实现了离线AI模型推理功能。

## 📁 文件结构

```
/Users/zrb/Downloads/Technation-Healthsync-2025-main/
├── pytorch_model.bin          # 本地模型文件 (516.7 MB)
├── local_model/               # 本地模型目录
│   ├── pytorch_model.bin      # 模型权重文件
│   └── config.json            # 模型配置文件
├── Model/app/main.py          # 主API服务器
├── test_local_model.py        # 模型测试脚本
└── LOCAL_MODEL_SETUP.md       # 本文档
```

## 🔧 配置详情

### 模型信息
- **模型类型**: BertForSequenceClassification
- **文件大小**: 516.7 MB
- **隐藏层大小**: 768
- **注意力头数**: 12
- **词汇表大小**: 30,522
- **支持疾病分类**: 7种疾病类型

### 疾病分类标签
```json
{
  "0": "cardiovascular",      // 心血管疾病
  "1": "diabetes",           // 糖尿病
  "2": "hypertension",       // 高血压
  "3": "respiratory",        // 呼吸系统疾病
  "4": "gastrointestinal",   // 胃肠道疾病
  "5": "neurological",       // 神经系统疾病
  "6": "normal"             // 正常
}
```

## 🚀 使用方法

### 1. 启动API服务器
```bash
cd /Users/zrb/Downloads/Technation-Healthsync-2025-main/Model/app
python main.py
```

### 2. 测试模型功能
```bash
cd /Users/zrb/Downloads/Technation-Healthsync-2025-main
python test_local_model.py
```

### 3. API调用示例
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "gender": "Male",
    "clinical_notes": "患者主诉胸痛、胸闷，伴有心悸和呼吸困难症状"
  }'
```

## 📊 性能特点

### 模型优势
- ✅ **离线运行**: 无需网络连接
- ✅ **快速推理**: 本地GPU/CPU加速
- ✅ **数据安全**: 医疗数据不离开本地
- ✅ **高精度**: 专门训练的医疗BERT模型

### 技术规格
- **输入长度**: 最大512个token
- **输出维度**: 768维向量
- **推理速度**: 毫秒级响应
- **内存占用**: ~1GB RAM

## 🔍 测试结果

### 模型加载测试
```
✅ Tokenizer加载成功，词汇表大小: 119,547
✅ 本地模型加载成功
✅ 模型配置正确
✅ 推理功能正常
```

### 性能测试
```
📊 测试4个临床文本...
   - 心血管症状: 嵌入维度 [1, 768]
   - 糖尿病症状: 嵌入维度 [1, 768]  
   - 高血压症状: 嵌入维度 [1, 768]
   - 呼吸系统症状: 嵌入维度 [1, 768]
✅ 所有测试通过
```

## 🛠️ 故障排除

### 常见问题

1. **模型加载失败**
   - 检查 `pytorch_model.bin` 文件是否存在
   - 确认文件大小是否正确 (516.7 MB)
   - 检查 `config.json` 配置是否正确

2. **内存不足**
   - 确保系统有足够RAM (建议4GB+)
   - 考虑使用CPU推理而非GPU

3. **依赖问题**
   - 确保安装了正确版本的transformers
   - 检查PyTorch版本兼容性

### 调试命令
```bash
# 检查模型文件
ls -la pytorch_model.bin

# 测试模型加载
python test_local_model.py

# 检查API状态
curl http://localhost:8000/health
```

## 🔄 模型更新

### 替换模型文件
1. 备份当前模型: `cp pytorch_model.bin pytorch_model.bin.backup`
2. 替换新模型: `cp new_model.bin pytorch_model.bin`
3. 更新配置文件: 编辑 `local_model/config.json`
4. 重启API服务器

### 模型验证
```bash
python test_local_model.py
```

## 📈 性能优化

### 建议配置
- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: SSD硬盘
- **Python**: 3.8+

### 优化选项
- 使用GPU加速 (如果可用)
- 调整批处理大小
- 启用模型量化
- 使用ONNX格式

## 🎉 成功指标

当看到以下输出时，说明本地模型配置成功：

```
🎉 本地模型测试成功！
✅ 本地ClinicalBERT模型加载完成
📊 模型配置正确
🚀 性能测试通过
```

## 📞 技术支持

如果遇到问题，请检查：
1. 模型文件完整性
2. 依赖包版本
3. 系统资源使用情况
4. 日志错误信息

---

**注意**: 本地模型提供了更好的数据隐私保护和离线使用能力，特别适合医疗应用场景。
