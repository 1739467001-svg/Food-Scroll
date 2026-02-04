#!/bin/bash

echo "🏮 鼎味轩 - 美食菜单系统启动脚本"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✅ 后端依赖就绪"
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✅ 前端依赖就绪"
echo ""

# 启动后端（后台运行）
echo "🚀 启动后端服务..."
cd ../backend
npm start &
BACKEND_PID=$!
echo "✅ 后端已启动 (PID: $BACKEND_PID)"
echo ""

# 等待后端启动
sleep 2

# 启动前端
echo "🚀 启动前端开发服务器..."
cd ../frontend
npm run dev

# 清理后端进程
trap "kill $BACKEND_PID 2>/dev/null; exit" INT
wait
