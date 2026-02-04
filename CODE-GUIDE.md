# 📖 代码研究指南

## 概述

本文档指导你如何系统地研究鼎味轩后端代码，理解其核心技术和设计思想。

**阅读时间**: 约 30 分钟  
**前置知识**: 基础 JavaScript、HTTP 协议概念

---

## 🎯 学习目标

完成本指南后，你将理解：
1. 云原生应用的设计原则
2. JWT 认证的实现机制
3. SQLite 数据库操作
4. 文件上传的安全处理
5. 错误处理和优雅关闭

---

## 📚 推荐阅读顺序

### 第一遍：整体架构（10分钟）

**文件**: `backend/server.js`

**阅读重点**:
1. 先看顶部注释（第1-10行）- 了解文件用途
2. 快速浏览大注释块（以 `===` 分隔的部分）- 了解模块划分
3. 看最后的启动代码（第800行左右）- 了解入口

**不用深入**: 具体实现细节、SQL 语句

**思考问题**:
- 这个项目有几个主要模块？
- 数据存储在哪里？
- 如何验证用户身份？

---

### 第二遍：核心技术（15分钟）

#### 模块 1: 环境变量系统（第13-35行）

**关键技术**: 云原生配置管理

**研究要点**:
```javascript
// 为什么要这样设计？
const PORT = process.env.PORT || 3001;
```

**解释**: 
- `process.env.PORT` 读取环境变量
- `|| 3001` 提供默认值（本地开发用）
- 这样无需修改代码就能在不同环境运行

**思考问题**:
- 生产环境的 JWT_SECRET 是如何设置的？
- 如果不设置会有什么后果？

---

#### 模块 2: JWT 认证系统（第200-240行）

**关键技术**: 无状态认证

**研究要点**:
```javascript
// 1. 生成 Token
const token = jwt.sign(
  { userId: id, email }, 
  JWT_SECRET, 
  { expiresIn: '7d' }
);

// 2. 验证 Token
jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ message: '令牌无效' });
  req.user = user;
  next();
});
```

**核心概念**:
- **JWT**: 包含用户信息的加密字符串
- **签名**: 使用 JWT_SECRET 加密，防止篡改
- **过期时间**: 7天后失效，需要重新登录

**比喻**: 
- JWT 就像游乐园的手环
- 入场时给你（登录）
- 每次玩项目都要出示（访问API）
- 手环过期就失效

---

#### 模块 3: 密码加密（第300-320行）

**关键技术**: bcrypt 哈希

**研究要点**:
```javascript
// 加密
const hashedPassword = await bcrypt.hash(password, 10);

// 验证
const validPassword = await bcrypt.compare(password, hashedPassword);
```

**核心概念**:
- **哈希**: 单向转换，无法反推出原始密码
- **Salt**: 随机字符串，让相同密码产生不同哈希
- **10轮**: 计算复杂度，越高越安全但越慢

**为什么不能直接存储明文密码？**
- 数据库泄露 → 所有用户密码暴露
- 哈希后即使泄露也无法还原

---

#### 模块 4: SQLite 数据库（第100-150行）

**关键技术**: 嵌入式数据库

**研究要点**:
```javascript
// 连接数据库
const db = new sqlite3.Database(DB_PATH);

// 创建表
db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// 查询数据
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

**核心概念**:
- **SQL 注入防护**: 使用 `?` 占位符
- **回调模式**: 异步操作完成后执行
- **表设计**: 字段类型、约束（NOT NULL, UNIQUE）

**危险示例**（不要这样做）:
```javascript
// 错误：字符串拼接 SQL
const sql = `SELECT * FROM users WHERE email = '${email}'`;
// 攻击者可以输入：' OR '1'='1
// 结果：SELECT * FROM users WHERE email = '' OR '1'='1'（查出了所有用户）
```

---

#### 模块 5: 文件上传（第80-110行）

**关键技术**: Multer 中间件

**研究要点**:
```javascript
const upload = multer({
  storage,           // 存储配置
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB限制
  fileFilter: (req, file, cb) => {
    // 只允许图片格式
  }
});

// 使用
app.post('/api/dishes', upload.single('image'), handler);
```

**核心概念**:
- **单文件上传**: `upload.single('image')`
- **多文件上传**: `upload.array('images', 5)`
- **文件信息**: `req.file` 包含原始名、大小、保存路径

---

### 第三遍：工程实践（5分钟）

#### 健康检查（第140-160行）

**为什么重要？**
- 云平台用它判断服务是否正常
- 失败时自动重启容器

#### 优雅关闭（第820-840行）

**为什么重要？**
- 防止正在处理的请求被中断
- 防止数据库连接泄露
- 防止数据丢失

---

## 🔍 深入学习建议

### 如果要修改代码

1. **添加新 API 端点**
   - 复制现有的路由代码
   - 修改路径和处理逻辑
   - 添加注释说明用途

2. **修改数据库结构**
   - 在初始化部分添加 ALTER TABLE
   - 或删除数据库文件让它重新创建

3. **调试技巧**
   ```javascript
   // 添加日志
   console.log('调试信息:', variable);
   
   // 查看 SQL 执行
   db.run(sql, params, function(err) {
     console.log('影响的行数:', this.changes);
   });
   ```

---

## 📖 扩展阅读

### 官方文档
- [Express 中文文档](https://expressjs.com/zh-cn/)
- [SQLite 教程](https://www.runoob.com/sqlite/sqlite-tutorial.html)
- [JWT 详解](https://jwt.io/introduction)

### 视频教程
- 搜索 "Node.js JWT 认证实现"
- 搜索 "SQLite 入门教程"

### 实践练习
1. 在代码中添加一个新的 API 端点 `/api/stats` 返回统计数据
2. 给用户表添加一个 `phone` 字段
3. 实现一个限制登录次数的安全机制

---

## ❓ 常见问题

### Q: 为什么要用 SQLite 而不是 MySQL？
**A**: 
- 优点：零配置、单文件、适合小型应用
- 缺点：不支持高并发写入
- 本项目是单餐厅使用，SQLite 完全够用

### Q: JWT 和 Session 有什么区别？
**A**:
- JWT：无状态，服务端不存储信息，易于扩展
- Session：有状态，需要 Redis 共享会话
- 现代应用更倾向 JWT

### Q: 如何升级到 PostgreSQL？
**A**:
1. 安装 pg 模块：`npm install pg`
2. 修改数据库连接代码
3. SQL 语句基本兼容，只需调整少量语法

---

## ✅ 检查清单

读完本指南后，你应该能够：

- [ ] 解释什么是 JWT 以及它如何工作
- [ ] 解释为什么密码要哈希存储
- [ ] 找出防止 SQL 注入的关键代码
- [ ] 说明环境变量的作用
- [ ] 描述优雅关闭的重要性

如果还有不懂的地方，可以：
1. 在代码中添加 `console.log` 观察执行流程
2. 使用 Postman 测试 API 接口
3. 单步调试（VS Code 可以设置断点）

---

**祝你学习愉快！** 🎓
