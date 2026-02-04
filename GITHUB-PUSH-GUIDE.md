# 🚀 GitHub 推送指南

> **目标**: 将鼎味轩项目推送到 GitHub  
> **预计时间**: 5 分钟  
> **难度**: ⭐（复制粘贴即可）

---

## 📋 准备工作

### 1. 确保你有 GitHub 账号
如果没有，先注册：https://github.com/signup

### 2. 确保本地安装了 Git
```bash
git --version
# 应该显示类似：git version 2.39.0
```

如果没有安装：
- Mac: `brew install git`
- Windows: 下载 https://git-scm.com/download/win

---

## 🎯 推送步骤（共 5 步）

### 第 1 步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. 填写信息：
   - **Repository name**: `food-menu-pro`（或你喜欢的名字）
   - **Description**: 鼎味轩美食菜单系统 - 中式传统风格的全栈应用
   - **Visibility**: ⭕ Public（推荐，可以展示给面试官）或 ⚫ Private
   - ❌ **不要勾选** "Initialize this repository with a README"
3. 点击 **Create repository**
4. 复制仓库地址（后面会用到）：
   ```
   https://github.com/你的用户名/food-menu-pro.git
   ```

---

### 第 2 步：打开终端

```bash
# 进入项目目录
cd /Users/jyc/Downloads/kimi/food-menu-pro
```

---

### 第 3 步：运行推送脚本

我已经为你准备好了完整的推送脚本，**逐行复制粘贴执行**即可：

```bash
# ===== 第 1 行：初始化 Git 仓库 =====
git init

# ===== 第 2 行：添加所有文件 =====
git add .

# ===== 第 3 行：创建提交 =====
git commit -m "feat: 鼎味轩美食菜单系统 v1.0.0 - 完整实现

🎯 项目概述
中式传统风格的美食菜单全栈系统，支持扫码点单

✨ 核心功能
- 用户认证：JWT + bcrypt 安全登录/注册
- 菜单管理：菜品 CRUD + 图片上传
- 分类系统：招牌/热菜/凉菜/汤品/主食/饮品
- 响应式设计：完美适配手机/平板/桌面

🛠️ 技术栈
- 前端：React 18 + Vite + Tailwind CSS
- 后端：Node.js + Express + SQLite
- 部署：Docker + Docker Compose

☁️ 云原生支持
- 阿里云 ECS/ACK
- 腾讯云 CVM
- Zeabur PaaS
- Railway PaaS
- Fly.io 边缘部署

📚 文档
- 代码详细注释
- 5份技术文档（2万字+）
- 多平台部署指南

开发时间：3小时
开发模式：AI辅助开发"

# ===== 第 4 行：连接远程仓库 =====
# ⚠️ 注意：将下面的 URL 替换为你自己的仓库地址
git remote add origin https://github.com/你的用户名/food-menu-pro.git

# ===== 第 5 行：推送到 GitHub =====
git push -u origin main
# 或者如果是 master 分支：git push -u origin master
```

---

### 第 4 步：输入 GitHub 凭据

执行 `git push` 后，会提示输入用户名和密码：

**方式 1：HTTPS（简单）**
- Username: 你的 GitHub 用户名
- Password: **不是登录密码！** 是 Personal Access Token

**如何创建 Token**：
1. 打开 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. Note: `Food Menu Push`
4. Expiration: 选择过期时间（建议 90 天）
5. 勾选 `repo`（完整仓库访问权限）
6. 点击 **Generate token**
7. **立即复制保存**（只显示一次！）
8. 用这个 token 作为密码

**方式 2：SSH（推荐长期使用）**
如果你已经配置了 SSH 密钥，可以直接推送，无需输入密码。

---

### 第 5 步：验证推送成功

```bash
# 查看远程仓库地址
git remote -v

# 应该显示：
# origin  https://github.com/你的用户名/food-menu-pro.git (fetch)
# origin  https://github.com/你的用户名/food-menu-pro.git (push)
```

然后打开浏览器，访问：
```
https://github.com/你的用户名/food-menu-pro
```

看到文件列表就说明成功了！🎉

---

## 🛠️ 常见问题解决

### 问题 1：提示 "Permission denied"

**原因**: 没有权限或认证失败

**解决**:
```bash
# 检查远程地址是否正确
git remote -v

# 如果错误，删除重新添加
git remote remove origin
git remote add origin https://github.com/正确的用户名/正确的仓库名.git
```

### 问题 2：提示 "rejected: failed to push"

**原因**: 远程仓库已有文件，冲突了

**解决**:
```bash
# 先拉取远程更改
git pull origin main --rebase

# 然后再推送
git push -u origin main
```

### 问题 3：忘记添加某些文件

```bash
# 添加特定文件
git add 文件名

# 修改上一次提交
git commit --amend -m "新的提交信息"

# 强制推送（谨慎使用）
git push -f origin main
```

### 问题 4：提交信息写错了

```bash
# 修改最后一次提交信息
git commit --amend -m "正确的提交信息"

# 强制推送
git push -f origin main
```

---

## 📸 推送后设置（推荐）

### 1. 设置仓库主页
在 GitHub 仓库页面：
1. 点击 **About** 旁边的 ⚙️ 齿轮图标
2. 勾选 **Use your Github Pages website**
3. 添加 Topics: `react`, `nodejs`, `food-menu`, `restaurant`
4. 保存

### 2. 创建 README 徽章
在 README.md 顶部添加：
```markdown
# 🏮 鼎味轩美食菜单系统

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> 中式传统风格的美食菜单全栈系统
```

### 3. 发布 Release
1. 点击右侧的 **Create a new release**
2. 点击 **Choose a tag**，输入 `v1.0.0`，点击 **Create new tag**
3. Release title: `v1.0.0 - 初始版本`
4. 描述可以复制 `DEVELOPMENT-LOG.md` 的内容
5. 点击 **Publish release**

---

## 🎓 后续操作

### 日常开发流程
```bash
# 修改代码后...
git add .
git commit -m "fix: 修复了xxx问题"
git push
```

### 查看提交历史
```bash
git log --oneline --graph
```

### 回滚到某个版本
```bash
# 查看历史
git log

# 回滚（替换 abc123 为实际的 commit id）
git reset --hard abc123
git push -f origin main
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看 Git 状态**
   ```bash
   git status
   ```

2. **查看详细错误**
   ```bash
   git push -v origin main
   ```

3. **重置仓库（最后手段）**
   ```bash
   rm -rf .git
   git init
   # 然后重新执行上面的 5 个步骤
   ```

4. **查阅官方文档**
   - https://docs.github.com/cn/get-started

---

## ✅ 推送检查清单

完成推送后，检查以下事项：

- [ ] 访问 `https://github.com/你的用户名/food-menu-pro` 能看到代码
- [ ] 所有文件都已上传（没有遗漏）
- [ ] README.md 正确显示
- [ ] 提交信息完整
- [ ] 仓库设置为 Public（如果想展示）

---

## 🎉 恭喜！

你的项目现在已经安全地保存在 GitHub 上了！你可以：
- ✅ 随时随地访问代码
- ✅ 分享给朋友或面试官
- ✅ 在其他电脑继续开发
- ✅ 记录开发历史

**项目地址**: https://github.com/你的用户名/food-menu-pro

---

**下一步建议**:
1. 设置 GitHub Pages 展示演示站点
2. 添加更多项目截图到 README
3. 继续开发新功能（购物车、支付等）
