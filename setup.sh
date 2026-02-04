#!/bin/bash
# 配置并启动服务

cd ~/food-menu-pro

# 1. 启动后端
cd backend
npm install --production
pm2 start server.js --name "food-menu-api"
pm2 save
pm2 startup

cd ..

# 2. 配置 Nginx
sudo tee /etc/nginx/sites-available/food-menu << 'EOF'
server {
    listen 80;
    server_name _;  # 接受所有域名，或改为你的域名

    # 前端静态文件
    location / {
        root /home/ubuntu/food-menu-pro/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传的图片
    location /uploads/ {
        proxy_pass http://localhost:3001;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/food-menu /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 3. 开放防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 访问地址: http://你的服务器IP"
echo "🔐 管理后台: http://你的服务器IP/login"
echo ""
echo "常用命令:"
echo "  pm2 status          # 查看服务状态"
echo "  pm2 logs            # 查看日志"
echo "  pm2 restart all     # 重启服务"
echo "  sudo nginx -t       # 检查 Nginx 配置"
