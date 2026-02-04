#!/bin/bash
# 项目快照生成脚本
# 运行此脚本可生成项目状态报告

echo "🏮 鼎味轩项目快照生成器"
echo "========================"
echo ""

# 项目基本信息
echo "📋 基本信息"
echo "-----------"
echo "项目路径: $(pwd)"
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 代码统计
echo "📊 代码统计"
echo "-----------"
echo "前端文件:"
find frontend/src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.css" \) 2>/dev/null | wc -l | xargs echo "  - 源文件数量:"
find frontend/src -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.css" \) -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print "  - 总行数: " $1}'

echo ""
echo "后端文件:"
wc -l backend/server.js 2>/dev/null | awk '{print "  - server.js: " $1 " 行"}'

echo ""
echo "配置文件:"
ls -1 *.yml *.json Dockerfile* 2>/dev/null | wc -l | xargs echo "  - 配置文件数量:"

echo ""
echo "文档:"
ls -1 *.md 2>/dev/null | wc -l | xargs echo "  - Markdown文档数量:"

echo ""

# 技术栈检测
echo "🔧 技术栈检测"
echo "-------------"

# Node.js 版本
if command -v node &> /dev/null; then
    echo "  ✅ Node.js: $(node --version)"
else
    echo "  ❌ Node.js: 未安装"
fi

# Docker 版本
if command -v docker &> /dev/null; then
    echo "  ✅ Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    echo "  ❌ Docker: 未安装"
fi

# Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "  ✅ Docker Compose: $(docker-compose --version | cut -d' ' -f3 | tr -d ',')"
else
    echo "  ❌ Docker Compose: 未安装"
fi

echo ""

# 目录结构
echo "📁 目录结构"
echo "-----------"
tree -L 2 -I 'node_modules|dist|uploads|data' 2>/dev/null || find . -maxdepth 2 -type d ! -path '*/node_modules*' ! -path '*/dist*' ! -path '*/uploads*' ! -path '*/data*' | head -20

echo ""

# 端口占用检测
echo "🌐 端口状态"
echo "-----------"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  🔴 端口 3001 (后端): 已被占用"
else
    echo "  🟢 端口 3001 (后端): 可用"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  🔴 端口 5173 (前端开发): 已被占用"
else
    echo "  🟢 端口 5173 (前端开发): 可用"
fi

if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  🔴 端口 80 (Nginx): 已被占用"
else
    echo "  🟢 端口 80 (Nginx): 可用"
fi

echo ""

# 环境变量检查
echo "🔐 环境变量检查"
echo "---------------"
if [ -f .env ]; then
    echo "  ✅ .env 文件存在"
    if grep -q "JWT_SECRET" .env 2>/dev/null; then
        if grep "JWT_SECRET=" .env | grep -q "change"; then
            echo "  ⚠️  JWT_SECRET: 请修改为强密钥"
        else
            echo "  ✅ JWT_SECRET: 已设置"
        fi
    else
        echo "  ❌ JWT_SECRET: 未设置"
    fi
else
    echo "  ❌ .env 文件不存在，请从 .env.example 创建"
fi

echo ""

# Git 状态
echo "📦 Git 状态"
echo "-----------"
if [ -d .git ]; then
    echo "  分支: $(git branch --show-current)"
    echo "  最近提交: $(git log -1 --pretty=format:'%h - %s (%ar)')"
    echo "  提交次数: $(git rev-list --count HEAD)"
    
    # 检查是否有未提交更改
    if [ -n "$(git status --porcelain)" ]; then
        echo "  ⚠️  有未提交的更改"
    else
        echo "  ✅ 工作区干净"
    fi
else
    echo "  ❌ 不是 Git 仓库"
fi

echo ""
echo "========================"
echo "📸 快照生成完成"
echo ""
echo "使用建议:"
echo "  ./deploy.sh       # 部署项目"
echo "  docker-compose up # Docker 启动"
