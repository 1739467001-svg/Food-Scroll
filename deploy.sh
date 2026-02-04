#!/bin/bash
# 阿里云 Docker 部署脚本
# 使用方法: ./deploy.sh [dev|prod]

set -e

ENV=${1:-prod}
echo "🏮 鼎味轩 Docker 部署脚本"
echo "=========================="
echo "环境: $ENV"
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker 安装完成${NC}"
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装${NC}"
    echo "正在安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose 安装完成${NC}"
fi

# 创建必要目录
echo "📁 创建数据目录..."
mkdir -p data uploads logs/backend
chmod 755 data uploads logs

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env 文件不存在，从示例创建...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，修改 JWT_SECRET 等配置${NC}"
fi

# 根据环境执行不同操作
if [ "$ENV" = "dev" ]; then
    echo "🔧 开发模式部署..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
else
    echo "🚀 生产模式部署..."
    
    # 拉取最新代码（如果是 git 仓库）
    if [ -d .git ]; then
        echo "📥 拉取最新代码..."
        git pull origin main
    fi
    
    # 停止旧容器
    echo "🛑 停止旧容器..."
    docker-compose down --remove-orphans
    
    # 清理旧镜像（保留最近 3 个版本）
    echo "🧹 清理旧镜像..."
    docker image prune -af --filter "until=168h" || true
    
    # 构建并启动
    echo "🔨 构建镜像..."
    docker-compose build --no-cache
    
    echo "🚀 启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 10
    
    # 健康检查
    echo "🏥 健康检查..."
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ 所有服务运行正常！${NC}"
    else
        echo -e "${YELLOW}⚠️  部分服务可能未就绪，请检查日志${NC}"
    fi
fi

# 显示状态
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "📝 常用命令:"
echo "  查看日志:        docker-compose logs -f"
echo "  查看后端日志:    docker-compose logs -f backend"
echo "  重启服务:        docker-compose restart"
echo "  停止服务:        docker-compose down"
echo "  进入后端容器:    docker-compose exec backend sh"
echo ""

# 获取服务器 IP
IP=$(curl -s ifconfig.me || echo "你的服务器IP")
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "📱 访问地址:"
echo "  前端: http://$IP"
echo "  后端: http://$IP:3001"
echo ""
echo "🔐 默认管理员账号:"
echo "  邮箱: admin@example.com"
echo "  密码: admin123"
echo ""
echo -e "${YELLOW}⚠️  重要提醒:${NC}"
echo "1. 请修改 .env 中的 JWT_SECRET"
echo "2. 建议配置 HTTPS（使用 certbot 或阿里云 SSL）"
echo "3. 定期备份 data/ 和 uploads/ 目录"
