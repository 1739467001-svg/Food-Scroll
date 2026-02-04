# 🏮 鼎味轩 - 中式美食菜单系统（Pro 版）

基于 **中式传统风格** 设计的美食菜单全栈系统，包含用户认证、管理后台和精美的前端展示页面。

## ✨ 设计特点

- 🏮 **中式传统美学** - 中国红 + 金色 + 米白的经典配色
- 📜 **衬线字体** - Noto Serif SC + 马善政毛笔字
- 🎋 **回字纹边框** - 传统中式画框装饰元素
- 📱 **响应式设计** - 完美适配手机扫码点单
- 🔐 **用户认证** - JWT 登录/注册系统
- 🐳 **Docker 支持** - 一键部署，轻松维护

## 🛠️ 技术栈

| 层级 | 技术 |
|-----|------|
| 前端 | React 18 + Vite + Tailwind CSS |
| 后端 | Node.js + Express |
| 数据库 | SQLite |
| 认证 | JWT + bcryptjs |
| 字体 | Noto Serif SC + Ma Shan Zheng |
| 部署 | Docker + Docker Compose |

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/food-menu-pro.git
cd food-menu-pro

# 2. 创建环境变量
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET

# 3. 一键部署
chmod +x deploy.sh
./deploy.sh
```

访问 http://localhost 查看效果。

### 方式二：本地开发

**后端：**
```bash
cd backend
npm install
npm start
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

---

## 📁 项目结构

```
food-menu-pro/
├── backend/
│   ├── server.js              # Express + JWT + SQLite
│   ├── package.json
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── MenuShowcase.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── index.css          # Tailwind 配置
│   ├── tailwind.config.js
│   ├── nginx.conf             # Nginx 配置
│   ├── Dockerfile.frontend
│   └── .dockerignore
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions CI/CD
├── Dockerfile.backend         # 后端镜像配置
├── Dockerfile.frontend        # 前端镜像配置
├── docker-compose.yml         # Docker 编排
├── docker-compose.prod.yml    # 生产环境配置
├── deploy.sh                  # 部署脚本
├── .env.example               # 环境变量示例
├── .dockerignore
├── nginx.conf                 # Nginx 配置
├── nginx-ssl.conf             # HTTPS 配置
└── README.md
```

---

## 🎨 Tailwind 中式配色

```javascript
colors: {
  'china-red': '#8b1a1a',      // 中国红
  'china-gold': '#d4af37',     // 金色
  'china-beige': '#f7f3e9',    // 米白
  'china-ink': '#2c1810',      // 墨色
}
```

---

## 🐳 Docker 命令速查

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 查看状态
docker-compose ps

# 更新镜像
docker-compose pull && docker-compose up -d

# 清理旧镜像
docker image prune -a
```

---

## 🔒 安全配置

1. **修改 JWT_SECRET**：编辑 `.env` 文件
2. **配置 HTTPS**：使用 `nginx-ssl.conf` 或 Let's Encrypt
3. **定期备份**：`data/` 和 `uploads/` 目录
4. **更新密码**：首次登录后修改默认密码

---

## 🚀 阿里云部署

详见 [README-DEPLOY.md](./README-DEPLOY.md)

快速步骤：
1. 购买 ECS 服务器（Ubuntu 22.04）
2. 配置安全组（开放 80, 443, 22 端口）
3. 上传代码并运行 `./deploy.sh`
4. 配置域名和 HTTPS

---

## 🔑 默认账号

- **邮箱**: `admin@example.com`
- **密码**: `admin123`

**⚠️ 首次登录后请立即修改密码！**

---

## 📝 开发计划

- [x] 阶段 1: React 重构 + 用户认证
- [x] 阶段 2: Docker 容器化
- [ ] 阶段 3: 购物车 + 订单系统
- [ ] 阶段 4: 支付集成 + 数据看板

---

## 📄 License

MIT

---

**品味中华，传承美味** 🥢

**Docker 化部署，轻松运维** 🐳
