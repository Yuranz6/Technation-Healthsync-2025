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
