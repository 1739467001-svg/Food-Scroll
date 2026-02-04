# 🚀 阿里云 Docker 部署指南

## 📋 部署前准备

### 1. 购买阿里云服务器
- **推荐配置**：ECS 共享型 s6，2核4G，5M带宽
- **系统**：Ubuntu 22.04 LTS 64位
- **预估费用**：约 ¥150/月（包年包月更便宜）

### 2. 购买域名（可选但推荐）
- 阿里云域名注册（.com ¥60/年，.cn ¥35/年）
- 完成域名备案（中国大陆服务器必需）

### 3. 安全组配置
开放以下端口：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3001 (后端 API，可选，如果使用 Nginx 代理则不需要)

---

## 🚀 快速部署（推荐）

### 方式一：一键脚本部署

```bash
# 1. SSH 登录服务器
ssh root@你的服务器IP

# 2. 安装 git
apt update && apt install -y git

# 3. 克隆代码（或上传代码）
git clone https://github.com/your-repo/food-menu-pro.git
cd food-menu-pro

# 4. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式二：手动部署

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 上传代码（在本地执行）
scp -r food-menu-pro root@你的服务器IP:~/

# 4. 登录服务器并部署
ssh root@你的服务器IP
cd ~/food-menu-pro

# 5. 创建环境变量文件
cp .env.example .env
nano .env  # 修改配置

# 6. 启动服务
docker-compose up -d --build
```

---

## 📁 目录结构说明

部署后服务器上的目录结构：

```
~/food-menu-pro/
├── docker-compose.yml      # Docker 编排配置
├── .env                    # 环境变量（需手动创建）
├── data/                   # SQLite 数据库（需备份）
├── uploads/                # 上传的图片（需备份）
├── logs/                   # 日志文件
└── letsencrypt/            # SSL 证书（如果使用 Traefik）
```

**重要**：`data/` 和 `uploads/` 目录包含重要数据，务必定期备份！

---

## 🔒 配置 HTTPS

### 方式一：使用 Let's Encrypt（免费）

```bash
# 1. 安装 certbot
apt install -y certbot python3-certbot-nginx

# 2. 获取证书（替换为你的域名）
certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. 自动续期（certbot 会自动配置定时任务）
```

### 方式二：使用阿里云 SSL 证书

1. 阿里云控制台 → SSL 证书 → 购买免费证书
2. 下载 Nginx 版本证书
3. 上传到服务器 `/etc/nginx/ssl/`
4. 使用 `nginx-ssl.conf` 替换默认配置

---

## 🔧 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f                    # 所有服务
docker-compose logs -f backend            # 仅后端
docker-compose logs -f frontend           # 仅前端

# 重启服务
docker-compose restart
docker-compose restart backend            # 仅重启后端

# 停止服务
docker-compose down                       # 停止并删除容器
docker-compose down -v                    # 停止并删除容器和数据卷（慎用）

# 更新部署
docker-compose pull                       # 拉取最新镜像
docker-compose up -d                      # 重新启动

# 进入容器调试
docker-compose exec backend sh            # 进入后端容器
docker-compose exec frontend sh           # 进入前端容器

# 备份数据
tar -czvf backup-$(date +%Y%m%d).tar.gz data/ uploads/

# 清理旧镜像
docker image prune -a
```

---

## 📊 监控与维护

### 查看资源使用

```bash
# Docker 容器资源使用
docker stats

# 系统资源使用
htop

# 磁盘使用
df -h
du -sh data/ uploads/
```

### 日志切割

```bash
# 安装 logrotate
apt install -y logrotate

# 创建日志切割配置
cat > /etc/logrotate.d/food-menu << 'EOF'
/home/ubuntu/food-menu-pro/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ubuntu ubuntu
}
EOF
```

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/backup/food-menu"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据
tar -czf $BACKUP_DIR/data_$DATE.tar.gz -C ~/food-menu-pro data/ uploads/

# 保留最近 7 天的备份
find $BACKUP_DIR -name "data_*.tar.gz" -mtime +7 -delete

# 可选：上传到阿里云 OSS
# aliyun oss cp $BACKUP_DIR/data_$DATE.tar.gz oss://your-bucket/backups/
```

添加到定时任务：
```bash
crontab -e
# 添加：0 2 * * * /home/ubuntu/food-menu-pro/backup.sh
```

---

## 🚨 故障排查

### 问题1：端口被占用

```bash
# 查看端口占用
netstat -tulpn | grep :80

# 停止占用服务
systemctl stop nginx  # 如果系统有 Nginx
```

### 问题2：容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查配置文件
docker-compose config
```

### 问题3：数据库权限错误

```bash
# 修复权限
chmod 755 data uploads
chown -R 1000:1000 data uploads  # 1000 是容器内 node 用户的 UID
```

### 问题4：HTTPS 证书过期

```bash
# 手动续期
certbot renew --force-renewal

# 重启容器
docker-compose restart
```

---

## 💰 成本优化建议

1. **使用按量付费**：测试阶段使用按量付费，确认稳定后再转包年包月
2. **购买抢占式实例**：非核心业务可使用抢占式实例，节省 50-70% 费用
3. **使用 OSS 存储图片**：大量图片建议迁移到阿里云 OSS，降低服务器磁盘成本
4. **CDN 加速**：使用阿里云 CDN 加速静态资源，降低带宽成本

---

## 📞 获取帮助

- Docker 官方文档：https://docs.docker.com/
- Docker Compose 文档：https://docs.docker.com/compose/
- 阿里云文档：https://www.aliyun.com/product/ecs

---

**部署完成后，访问 http://你的服务器IP 查看效果！** 🎉
