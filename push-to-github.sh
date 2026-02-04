#!/bin/bash
# GitHub 一键推送脚本
# 使用方法: ./push-to-github.sh

set -e  # 遇到错误立即退出

echo "🏮 鼎味轩 - GitHub 推送助手"
echo "=========================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目目录
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误：Git 未安装${NC}"
    echo "请先安装 Git: https://git-scm.com/downloads"
    exit 1
fi

echo -e "${GREEN}✅ Git 已安装${NC}"
echo ""

# 询问 GitHub 用户名
echo -n "请输入你的 GitHub 用户名: "
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ 用户名不能为空${NC}"
    exit 1
fi

# 询问仓库名
echo -n "请输入仓库名 [默认: food-menu-pro]: "
read REPO_NAME
REPO_NAME=${REPO_NAME:-food-menu-pro}

echo ""
echo "📋 推送信息确认:"
echo "   GitHub 用户名: $GITHUB_USERNAME"
echo "   仓库名: $REPO_NAME"
echo "   仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# 确认
read -p "确认推送? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 步骤 1: 初始化 Git
echo ""
echo "📦 步骤 1/5: 初始化 Git 仓库..."
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git 仓库已存在，跳过初始化${NC}"
else
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
fi

# 步骤 2: 配置 Git（如果未配置）
echo ""
echo "📦 步骤 2/5: 检查 Git 配置..."
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ]; then
    echo -n "请输入你的姓名（用于 Git 提交）: "
    read GIT_USER
    git config user.name "$GIT_USER"
fi

if [ -z "$GIT_EMAIL" ]; then
    echo -n "请输入你的邮箱（用于 Git 提交）: "
    read GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

echo -e "${GREEN}✅ Git 配置完成${NC}"
echo "   用户名: $(git config user.name)"
echo "   邮箱: $(git config user.email)"

# 步骤 3: 添加文件
echo ""
echo "📦 步骤 3/5: 添加文件到暂存区..."
git add .
echo -e "${GREEN}✅ 文件已添加${NC}"

# 步骤 4: 提交
echo ""
echo "📦 步骤 4/5: 创建提交..."

# 检查是否有更改要提交
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  没有要提交的更改${NC}"
    echo "   可能所有文件都已提交过"
else
    git commit -m "feat: 鼎味轩美食菜单系统 v1.0.0

中式传统风格的美食菜单全栈系统

核心功能:
- 用户认证：JWT + bcrypt 安全登录/注册
- 菜单管理：菜品 CRUD + 图片上传
- 分类系统：招牌/热菜/凉菜/汤品/主食/饮品
- 响应式设计：手机/平板/桌面完美适配

技术栈:
- 前端：React 18 + Vite + Tailwind CSS
- 后端：Node.js + Express + SQLite
- 部署：Docker + Docker Compose

云原生支持:
- 阿里云 ECS/ACK
- 腾讯云 CVM
- Zeabur/Railway/Fly.io

开发时间：3小时
开发模式：AI辅助开发"
    
    echo -e "${GREEN}✅ 提交创建完成${NC}"
fi

# 步骤 5: 推送到 GitHub
echo ""
echo "📦 步骤 5/5: 推送到 GitHub..."

# 检查远程仓库
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  远程仓库已存在，更新地址...${NC}"
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

echo "   远程仓库: $REMOTE_URL"
echo ""

# 确定分支名
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    git checkout -b main 2>/dev/null || true
fi

echo "   分支: $BRANCH"
echo ""
echo -e "${YELLOW}⏳ 正在推送...${NC}"
echo "   （如果提示输入密码，请使用 GitHub Personal Access Token）"
echo ""

# 执行推送
if git push -u origin "$BRANCH"; then
    echo ""
    echo -e "${GREEN}🎉 推送成功！${NC}"
    echo ""
    echo "📎 项目地址:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📊 仓库统计:"
    echo "   提交数: $(git rev-list --count HEAD)"
    echo "   分支: $BRANCH"
    echo ""
    echo "✨ 建议下一步操作:"
    echo "   1. 访问 GitHub 查看项目"
    echo "   2. 设置 About 信息"
    echo "   3. 创建 Release 版本"
    echo "   4. 分享给朋友或面试官"
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo "常见问题:"
    echo "   1. 检查 GitHub 用户名和仓库名是否正确"
    echo "   2. 确保已在 GitHub 创建仓库（空仓库即可）"
    echo "   3. 检查网络连接"
    echo "   4. 如果使用 HTTPS，确保使用 Personal Access Token 而非密码"
    echo ""
    echo "手动创建仓库:"
    echo "   https://github.com/new"
    echo ""
    echo "查看详细指南:"
    echo "   cat GITHUB-PUSH-GUIDE.md"
fi

echo ""
echo "=========================="
echo "🏮 推送流程结束"
