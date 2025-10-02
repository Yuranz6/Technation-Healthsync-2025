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
