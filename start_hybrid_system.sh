#!/bin/bash

# HealthSync 混合模型系统启动脚本
# ClinicalBERT + XGBoost + RAG 疾病诊断系统

echo "🧠 启动HealthSync混合模型系统..."
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  端口 $1 已被占用${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 端口 $1 可用${NC}"
        return 0
    fi
}

# 停止端口上的进程
kill_port() {
    echo -e "${YELLOW}🔄 停止端口 $1 上的进程...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# 启动服务
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo -e "${BLUE}🚀 启动 $service_name...${NC}"
    
    # 停止占用端口的进程
    kill_port $port
    
    # 启动服务
    eval "$command" &
    local pid=$!
    
    # 等待并检查是否启动成功
    sleep 3
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✅ $service_name 启动成功 (PID: $pid)${NC}"
        echo $pid > "${service_name}.pid"
    else
        echo -e "${RED}❌ $service_name 启动失败${NC}"
        return 1
    fi
}

# 检查是否在正确的目录
if [ ! -f "app/package.json" ]; then
    echo -e "${RED}❌ 请在HealthSync项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${BLUE}📋 系统要求检查${NC}"
echo "=================================="

# 检查Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
else
    echo -e "${RED}❌ 未找到Node.js，请安装Node.js${NC}"
    exit 1
fi

# 检查Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python $(python3 --version)${NC}"
else
    echo -e "${RED}❌ 未找到Python3，请安装Python3${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 安装依赖${NC}"
echo "=============================="

# 安装前端依赖
echo -e "${YELLOW}📦 安装前端依赖...${NC}"
cd app
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 前端依赖安装成功${NC}"
    else
        echo -e "${RED}❌ 前端依赖安装失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 前端依赖已安装${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}🚀 启动服务${NC}"
echo "======================"

# Start Backend API (Node.js)
start_service "Backend API" "cd app && node server.mjs" 5001

# Start Frontend Server (Python HTTP Server)
start_service "Frontend Server" "cd app && python3 -m http.server 8080" 8080

# Start Hybrid Model API (Node.js)
start_service "Hybrid Model API" "cd app && node hybrid-api.js" 8000

echo ""
echo -e "${GREEN}🎉 HealthSync混合模型系统启动成功!${NC}"
echo "=============================================="
echo ""
echo -e "${PURPLE}🧠 混合模型系统特性:${NC}"
echo "  • ClinicalBERT: 分析病历文字描述"
echo "  • XGBoost: 分析结构化实验室数据"
echo "  • RAG技术: 检索医疗知识库"
echo "  • 模型融合: 智能疾病诊断"
echo ""
echo -e "${BLUE}📱 访问地址:${NC}"
echo "  • 前端应用: http://localhost:8080"
echo "  • Backend API: http://localhost:5001"
echo "  • Hybrid Model API: http://localhost:8000"
echo "  • API健康检查: http://localhost:8000/health"
echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo "  • 停止服务: ./stop_hybrid_system.sh"
echo "  • 检查状态: ./check_hybrid_system.sh"
echo ""

# 等待服务完全启动
sleep 5

# 运行健康检查
echo -e "${BLUE}🔍 系统健康检查${NC}"
echo "========================"

check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if curl -s $url > /dev/null 2>&1; then
        echo "✅ $name (端口 $port): 运行正常"
    else
        echo "❌ $name (端口 $port): 无响应"
    fi
}

check_service "Frontend" "8080" "http://localhost:8080"
check_service "Backend API" "5001" "http://localhost:5001/keys"
check_service "Hybrid Model API" "8000" "http://localhost:8000/health"

echo ""
echo -e "${GREEN}🎯 系统就绪!${NC}"
echo "打开 http://localhost:8080/html/registration.html 开始使用混合模型疾病诊断"
echo ""
echo -e "${YELLOW}💡 使用说明:${NC}"
echo "  1. 填写患者基本信息和实验室数据"
echo "  2. 在临床笔记中输入病历描述"
echo "  3. 点击'🧠 混合模型疾病诊断'按钮"
echo "  4. 查看ClinicalBERT + XGBoost + RAG的融合分析结果"
echo ""
echo -e "${PURPLE}🔬 技术架构:${NC}"
echo "  • 前端: HTML/CSS/JavaScript"
echo "  • 后端: Node.js + Express"
echo "  • 模型: ClinicalBERT + XGBoost + RAG"
echo "  • 数据: 结构化数据 + 非结构化文本"
echo ""

# 创建管理脚本
cat > check_hybrid_system.sh << 'EOF'
#!/bin/bash
echo "🔍 HealthSync混合模型系统状态"
echo "=============================="

check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if curl -s $url > /dev/null 2>&1; then
        echo "✅ $name (端口 $port): 运行正常"
    else
        echo "❌ $name (端口 $port): 无响应"
    fi
}

check_service "Frontend" "8080" "http://localhost:8080"
check_service "Backend API" "5001" "http://localhost:5001/keys"
check_service "Hybrid Model API" "8000" "http://localhost:8000/health"

echo ""
echo "📊 进程信息:"
ps aux | grep -E "(node.*server|node.*hybrid-api|python.*http.server)" | grep -v grep
EOF

chmod +x check_hybrid_system.sh

# 创建停止脚本
cat > stop_hybrid_system.sh << 'EOF'
#!/bin/bash
echo "🛑 停止HealthSync混合模型系统..."
echo "==============================="

# 通过PID文件停止服务
for pidfile in *.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        if ps -p $pid > /dev/null; then
            echo "🔄 停止进程 $pid..."
            kill $pid
            rm "$pidfile"
        fi
    fi
done

# 通过端口停止服务
echo "🔄 清理端口..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "✅ HealthSync混合模型系统已停止"
EOF

chmod +x stop_hybrid_system.sh

echo -e "${GREEN}🎉 混合模型系统启动完成!${NC}"
echo "现在可以使用ClinicalBERT + XGBoost + RAG进行智能疾病诊断了！"
