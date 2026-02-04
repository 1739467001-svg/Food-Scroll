# 🚀 全平台部署指南

本文档详细说明如何在各个云平台部署鼎味轩美食菜单系统。

---

## 📋 部署前检查清单

在部署前，请确保：

- [ ] 已设置强密码的 `JWT_SECRET` 环境变量
- [ ] 已创建 `.env` 文件并配置正确
- [ ] 已测试 Docker 镜像可以正常构建
- [ ] 已配置域名（生产环境推荐）

---

## 🐳 平台一：通用 Docker 部署

适用于：**阿里云 ECS、腾讯云 CVM、自建服务器**

### 快速部署

```bash
# 1. 克隆代码
git clone https://github.com/your-repo/food-menu-pro.git
cd food-menu-pro

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，设置 JWT_SECRET

# 3. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

```bash
# 1. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 2. 构建镜像
docker-compose build

# 3. 启动服务
docker-compose up -d
```

### 持久化数据位置

| 路径 | 说明 | 备份建议 |
|------|------|---------|
| `./data/` | SQLite 数据库 | 每日备份 |
| `./uploads/` | 上传的图片 | 每周备份 |
| `./logs/` | 应用日志 | 按需清理 |

---

## ☁️ 平台二：阿里云

### 方案 A：ECS + Docker Compose（推荐）

```bash
# 使用阿里云镜像加速
mkdir -p /etc/docker
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://mirror.aliyuncs.com"]
}
EOF
systemctl restart docker

# 部署
./deploy.sh
```

### 方案 B：阿里云容器服务 ACK

```bash
# 配置 kubectl
aliyun configure

# 应用 Kubernetes 配置
kubectl apply -f aliyun.yml

# 查看状态
kubectl get pods
kubectl get svc
```

### 阿里云特有配置

1. **安全组**：开放 80/443/3001 端口
2. **SLB**：配置负载均衡（可选）
3. **OSS**：建议将图片存储迁移到 OSS

---

## ☁️ 平台三：腾讯云

### 轻量应用服务器部署

```bash
# 腾讯云轻量服务器默认已安装 Docker
# 直接部署即可
./deploy.sh
```

### 云服务器 CVM 部署

与阿里云 ECS 相同，参考上方 Docker Compose 部署。

### 腾讯云特有配置

1. **安全组**：入站规则放行 80/443
2. **COS 对象存储**：建议用于图片存储
3. **CDN**：配置静态资源加速

---

## 🚀 平台四：Zeabur

[Zeabur](https://zeabur.com) 是一个新兴的 PaaS 平台，支持一键部署。

### 部署步骤

1. Fork 本仓库到 GitHub
2. 登录 [Zeabur Dashboard](https://dash.zeabur.com)
3. 创建新项目 → 选择 GitHub 仓库
4. 选择 `zeabur.yml` 配置文件
5. 添加环境变量：
   - `JWT_SECRET`: 你的密钥
6. 点击部署

### Zeabur 特点

- ✅ 自动 HTTPS
- ✅ 自动扩容
- ✅ 按量付费
- ✅ 国内访问速度快
- ✅ 支持持久化卷

### 注意事项

Zeabur 会注入以下环境变量：
- `ZEABUR_WEB_DOMAIN`: 前端域名
- `ZEABUR_BACKEND_URL`: 后端域名

---

## 🛤️ 平台五：Railway

[Railway](https://railway.app) 是流行的 PaaS 平台。

### 部署步骤

1. Fork 仓库到 GitHub
2. 登录 Railway Dashboard
3. New Project → Deploy from GitHub repo
4. 添加环境变量：
   - `JWT_SECRET`: 你的密钥
5. 自动部署

### Railway 特有配置

```json
// railway.json 已配置
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "healthcheckPath": "/health"
  }
}
```

---

## 🦋 平台六：Fly.io

[Fly.io](https://fly.io) 提供全球边缘部署。

### 部署步骤

```bash
# 1. 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 2. 登录
flyctl auth login

# 3. 创建应用
flyctl apps create food-menu-pro

# 4. 创建存储卷
flyctl volumes create food_menu_data --size 1
flyctl volumes create food_menu_uploads --size 1

# 5. 设置密钥
flyctl secrets set JWT_SECRET=your-secret-key

# 6. 部署
flyctl deploy
```

### Fly.io 特点

- ✅ 全球边缘节点
- ✅ 自动 HTTPS
- ✅ 持久化卷支持
- ✅ 免费额度 generous

---

## 🐙 平台七：GitHub Codespaces / Dev Containers

适用于开发和测试。

```bash
# 在 GitHub Codespaces 中打开项目
# 会自动安装依赖并启动服务

# 访问转发端口
# 后端: https://localhost:3001
# 前端: https://localhost:5173
```

---

## 🔐 安全配置检查

### 必需的安全措施

```bash
# 1. 生成强 JWT_SECRET
openssl rand -base64 32

# 2. 设置环境变量
export JWT_SECRET=$(openssl rand -base64 32)

# 3. 确保 HTTPS（生产环境）
# 使用 Let's Encrypt 或云平台提供的 SSL

# 4. 定期更新依赖
npm audit fix
```

### 各平台安全建议

| 平台 | 额外安全措施 |
|------|-------------|
| 阿里云 | 使用 RAM 子账号、启用操作审计 |
| 腾讯云 | 使用 CAM 子账号、启用安全组 |
| Zeabur | 使用自动生成域名或绑定自定义域名 |
| Railway | 启用 Preview Environment 保护 |
| Fly.io | 使用 WireGuard 进行内网通信 |

---

## 📊 性能优化

### Docker 镜像优化

```dockerfile
# 已优化的配置
- 多阶段构建
- Alpine Linux 基础镜像
- npm ci --only=production
- 非 root 用户运行
```

### 数据库优化（SQLite）

```sql
-- 添加索引
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
```

### Nginx 优化

```nginx
# 已配置在 nginx.conf
- Gzip 压缩
- 静态资源缓存
- 安全响应头
```

---

## 🐛 故障排查

### 常见问题

#### 1. 数据库权限错误

```bash
# 修复权限
chmod 755 data uploads
chown -R 1000:1000 data uploads  # Docker 内用户 UID
```

#### 2. CORS 错误

```bash
# 检查 CORS_ORIGIN 环境变量
# 确保包含前端域名
CORS_ORIGIN=https://your-domain.com
```

#### 3. 健康检查失败

```bash
# 查看日志
docker-compose logs backend

# 检查健康检查端点
curl http://localhost:3001/health
```

#### 4. 图片上传失败

```bash
# 检查上传目录权限
ls -la uploads/

# 检查磁盘空间
df -h
```

---

## 📞 获取帮助

- **GitHub Issues**: 提交 Bug 报告
- **Discussions**: 功能讨论
- **Email**: your-email@example.com

---

## 📄 许可证

MIT License

---

**祝部署顺利！** 🚀
