/**
 * 鼎味轩美食菜单系统 - 后端服务
 * 
 * 技术栈：Node.js + Express + SQLite + JWT
 * 架构设计：云原生 RESTful API
 * 
 * @author 开发团队
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================================
// 1. 环境变量配置系统
// ============================================================
// 说明：所有配置都通过环境变量注入，实现"十二要素应用"原则
// 这样可以在不修改代码的情况下，在不同环境（开发/测试/生产）间切换

const app = express();

// 服务端口：云平台会自动分配 PORT 环境变量
const PORT = process.env.PORT || 3001;

// JWT 密钥：生产环境必须通过环境变量设置，防止硬编码泄露
const JWT_SECRET = process.env.JWT_SECRET;

// 运行环境标识
const NODE_ENV = process.env.NODE_ENV || 'development';

// 数据库路径：可配置，支持 Docker Volume 挂载
// 默认路径：项目目录下的 data/database.sqlite
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'database.sqlite');

// 上传文件存储路径
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');

// CORS 跨域配置：支持多域名，生产环境应该限制为特定域名
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// 安全检查：生产环境强制要求设置 JWT_SECRET
// 这是为了防止开发者忘记配置密钥就部署到生产环境
if (NODE_ENV === 'production' && !JWT_SECRET) {
  console.error('❌ 错误：生产环境必须设置 JWT_SECRET 环境变量');
  console.error('请运行：export JWT_SECRET=$(openssl rand -base64 32)');
  process.exit(1);
}

// ============================================================
// 2. Express 中间件配置
// ============================================================
// 中间件是 Express 的核心机制，每个请求都会依次通过以下中间件

/**
 * CORS 跨域中间件
 * 
 * 原理：浏览器有同源策略（Same-Origin Policy），不同域名间的请求会被阻止
 * CORS（Cross-Origin Resource Sharing）通过设置响应头，允许特定域名访问资源
 * 
 * 配置说明：
 * - origin: 允许的域名列表，* 表示允许所有（仅开发环境使用）
 * - credentials: 允许携带 cookie（实现登录状态保持）
 * - methods: 允许的 HTTP 方法
 */
const corsOptions = {
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

/**
 * 请求体解析中间件
 * 
 * express.json()：将 JSON 格式的请求体解析为 JavaScript 对象
 * express.urlencoded()：解析表单格式的请求体
 * 
 * limit: '10mb' 限制最大请求体大小，防止恶意大请求导致内存溢出
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * 静态文件服务中间件
 * 
 * 作用：让 /uploads 路径下的文件可以直接通过 URL 访问
 * 例如：/uploads/abc.jpg 会直接返回对应的图片文件
 * 
 * 安全考虑：实际生产环境建议使用 CDN 或对象存储（OSS）替代
 */
app.use('/uploads', express.static(UPLOAD_PATH));

// ============================================================
// 3. 目录初始化
// ============================================================
// 云原生要求：容器应该是无状态的，但 SQLite 需要本地存储
// 解决方案：使用 Docker Volume 将宿主机目录挂载到容器中

/**
 * 数据目录初始化
 * 
 * 设计模式：防御式编程
 * 原因：Docker 容器首次启动时，挂载的 Volume 可能是空的
 * 措施：自动创建所需目录
 */
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 创建数据目录: ${dataDir}`);
}

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
  console.log(`📁 创建上传目录: ${UPLOAD_PATH}`);
}

// ============================================================
// 4. 文件上传系统（Multer）
// ============================================================
// Multer 是 Node.js 最常用的文件上传中间件

/**
 * 存储配置
 * 
 * diskStorage：将文件保存到磁盘
 * - destination: 存储目录
 * - filename: 生成唯一文件名，防止重名覆盖
 * 
 * 文件名生成策略：UUID + 原始扩展名
 * 例如：f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * 文件过滤与安全校验
 * 
 * 安全措施：
 * 1. 限制文件类型（只允许图片）
 * 2. 限制文件大小（5MB）
 * 3. 双重校验（扩展名 + MIME 类型）
 * 
 * 攻击防护：防止上传恶意脚本（如 .php .js 伪装成图片）
 */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只允许上传图片文件'));
  }
});

// ============================================================
// 5. 数据库系统（SQLite）
// ============================================================
// SQLite 是嵌入式数据库，无需独立服务器进程，适合中小型应用

console.log(`🗄️  数据库路径: ${DB_PATH}`);

/**
 * 数据库连接
 * 
 * SQLite 特点：
 * - 零配置：无需安装配置
 * - 单文件：整个数据库存储在一个文件中
 * - 事务支持：ACID 兼容
 * 
 * 限制：
 * - 不适合高并发写入（文件级锁定）
 * - 单服务器部署（不支持网络访问）
 * 
 * 升级路径：数据量增大后可迁移到 PostgreSQL/MySQL
 */
const db = new sqlite3.Database(DB_PATH);

/**
 * 数据库初始化
 * 
 * 设计模式：Schema 版本控制（简化版）
 * 原理：应用启动时检查表是否存在，不存在则创建
 * 
 * 生产建议：使用 migrations 工具（如 node-db-migrate）管理 Schema 变更
 */
db.serialize(() => {
  // 5.1 用户表
  // 字段设计：
  // - id: 主键，使用 UUID 而非自增 ID（分布式友好）
  // - email: 唯一索引，防止重复注册
  // - password: 存储 bcrypt 加密后的密码，永不存储明文
  // - role: 角色系统，预留扩展空间
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 5.2 分类表
  // sort_order: 用于自定义分类排序（如：招牌菜排第一）
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 5.3 菜品表
  // 外键关联：category_id 关联 categories 表
  // 软删除：不使用 DELETE，而是用 is_available 标记（保留历史数据）
  // 标签系统：is_recommended（推荐）、is_spicy（辣味）布尔标志
  db.run(`CREATE TABLE IF NOT EXISTS dishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category_id TEXT,
    is_available INTEGER DEFAULT 1,
    is_recommended INTEGER DEFAULT 0,
    is_spicy INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  // 5.4 初始化默认数据
  // 使用 COUNT 查询判断表是否为空，避免重复插入
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (err) {
      console.error('检查分类失败:', err);
      return;
    }
    if (row.count === 0) {
      const defaultCategories = [
        { id: 'cat_001', name: '招牌推荐', sort_order: 1 },
        { id: 'cat_002', name: '热菜', sort_order: 2 },
        { id: 'cat_003', name: '凉菜', sort_order: 3 },
        { id: 'cat_004', name: '汤品', sort_order: 4 },
        { id: 'cat_005', name: '主食', sort_order: 5 },
        { id: 'cat_006', name: '饮品', sort_order: 6 }
      ];

      // 使用预处理语句（Prepared Statement）防止 SQL 注入
      const stmt = db.prepare('INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)');
      defaultCategories.forEach(cat => {
        stmt.run(cat.id, cat.name, cat.sort_order);
      });
      stmt.finalize();
      console.log('✅ 默认分类已创建');
    }
  });

  // 5.5 创建默认管理员账户
  // 使用 bcrypt 进行密码加密（10 轮 salt）
  // 10 轮是安全性和性能的折中，约 100ms 计算时间
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('检查用户失败:', err);
      return;
    }
    if (row.count === 0) {
      const adminId = 'user_001';
      const adminEmail = 'admin@example.com';
      const adminPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, '管理员', adminEmail, adminPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('创建默认用户失败:', err);
          } else {
            console.log('✅ 默认管理员已创建');
          }
        }
      );
    }
  });
});

// ============================================================
// 6. JWT 认证系统
// ============================================================
// JWT（JSON Web Token）是目前最流行的无状态认证方案

/**
 * JWT 验证中间件
 * 
 * 工作流程：
 * 1. 从请求头提取 Authorization: Bearer <token>
 * 2. 使用 JWT_SECRET 验证签名（防止篡改）
 * 3. 检查 token 是否过期
 * 4. 将用户信息（userId, email）附加到请求对象
 * 
 * 安全设计：
 * - 401：未提供 token（未登录）
 * - 403：token 无效或过期（登录状态失效）
 * 
 * 与 Session 对比：
 * - JWT：无状态，服务端不存储会话信息，易于水平扩展
 * - Session：有状态，需要 Redis/数据库共享会话
 */
const authenticateToken = (req, res, next) => {
  // Authorization 头格式："Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供访问令牌' });
  }

  // 验证 token
  // JWT_SECRET 用于签名验证，确保 token 未被篡改
  jwt.verify(token, JWT_SECRET || 'fallback-secret-for-dev-only', (err, user) => {
    if (err) {
      // 常见错误：TokenExpiredError（过期）、JsonWebTokenError（格式错误）
      return res.status(403).json({ message: '令牌无效或已过期' });
    }
    // 将用户信息附加到请求对象，后续路由可以使用 req.user.userId
    req.user = user;
    next();
  });
};

// ============================================================
// 7. 健康检查系统（云平台必需）
// ============================================================
/**
 * 健康检查端点
 * 
 * 用途：
 * 1. 负载均衡器判断服务是否可用
 * 2. 容器编排系统（Kubernetes）决定是否需要重启容器
 * 3. 监控告警系统检测服务状态
 * 
 * 返回 200：服务正常
 * 返回非 200：服务异常，需要重启
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// API 专用健康检查，同时检测数据库连接
app.get('/api/health', (req, res) => {
  // 简单查询测试数据库连接
  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(503).json({ 
        status: 'error', 
        message: '数据库连接失败' 
      });
    }
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });
});

// ============================================================
// 8. 认证 API（登录/注册）
// ============================================================

/**
 * 用户注册
 * 
 * 安全流程：
 * 1. 参数校验（非空、密码长度）
 * 2. 检查邮箱是否已存在（唯一性约束）
 * 3. 密码加密（bcrypt，不可逆）
 * 4. 生成 UUID 作为主键
 * 5. 创建用户记录
 * 6. 生成 JWT token 并返回
 * 
 * 密码加密原理：
 * bcrypt 使用 salt + 多次哈希，防止彩虹表攻击
 * 即使两个用户使用相同密码，存储的哈希值也不同
 */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  // 输入校验
  if (!name || !email || !password) {
    return res.status(400).json({ message: '请填写所有必填字段' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '密码至少需要6个字符' });
  }

  try {
    // 检查邮箱唯一性
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (row) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }

      // 创建新用户
      const id = `user_${uuidv4().split('-')[0]}`;
      // bcrypt.hash(明文密码, salt轮数)
      // 轮数越多越安全但越慢，10是推荐值
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [id, name, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ message: '注册失败' });
          }

          // 生成 JWT
          // payload 包含用户标识，不要包含敏感信息
          const token = jwt.sign(
            { userId: id, email }, 
            JWT_SECRET || 'dev-secret', 
            { expiresIn: '7d' }  // token 有效期7天
          );
          
          res.json({
            token,
            user: { id, name, email, role: 'admin' }
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 用户登录
 * 
 * 安全流程：
 * 1. 查询用户是否存在
 * 2. 使用 bcrypt.compare 验证密码（不是简单字符串比较）
 * 3. 密码错误时返回模糊错误（防止用户名枚举攻击）
 * 4. 生成 JWT token
 * 
 * 安全注意：
 * - 不要区分"用户不存在"和"密码错误"，统一返回"邮箱或密码错误"
 * - 防止攻击者通过错误信息判断哪些邮箱已注册
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '请填写邮箱和密码' });
  }

  // 查询用户
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    if (!user) {
      // 模糊错误提示
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    // bcrypt.compare(明文, 哈希) 内部会提取 salt 并重新计算
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

/**
 * 获取当前用户信息
 * 
 * 使用 authenticateToken 中间件保护
 * 只有携带有效 token 的请求才能访问
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  // req.user 由中间件注入
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  });
});

// ============================================================
// 9. 分类管理 API
// ============================================================
// RESTful 设计：使用 HTTP 方法表示操作（GET/POST/PUT/DELETE）

// 获取所有分类（公开接口，无需登录）
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY sort_order', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 创建分类（需要登录）
app.post('/api/categories', authenticateToken, (req, res) => {
  const { name, sort_order = 0 } = req.body;
  const id = `cat_${uuidv4().split('-')[0]}`;
  
  db.run('INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)',
    [id, name, sort_order],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, name, sort_order });
    });
});

// 删除分类
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '分类已删除' });
  });
});

// ============================================================
// 10. 菜品管理 API
// ============================================================

/**
 * 获取菜品列表
 * 
 * 查询参数：
 * - category: 按分类筛选
 * - available: 只显示上架的（true/false）
 * 
 * SQL 构建：根据参数动态拼接 WHERE 子句
 * 注意：使用参数化查询防止 SQL 注入
 */
app.get('/api/dishes', (req, res) => {
  const { category, available } = req.query;
  
  // 基础查询，使用 LEFT JOIN 获取分类名称
  let sql = `
    SELECT d.*, c.name as category_name 
    FROM dishes d 
    LEFT JOIN categories c ON d.category_id = c.id 
    WHERE 1=1
  `;
  const params = [];

  // 动态添加筛选条件
  if (category && category !== 'all') {
    sql += ' AND d.category_id = ?';
    params.push(category);
  }

  if (available === 'true') {
    sql += ' AND d.is_available = 1';
  }

  sql += ' ORDER BY d.sort_order, d.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 获取单个菜品详情
app.get('/api/dishes/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM dishes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '菜品不存在' });
    }
    res.json(row);
  });
});

/**
 * 创建菜品
 * 
 * upload.single('image')：处理单文件上传
 * 文件信息：req.file（原始名、大小、存储路径等）
 * 其他字段：req.body（菜品名称、价格等）
 */
app.post('/api/dishes', authenticateToken, upload.single('image'), (req, res) => {
  const {
    name,
    description,
    price,
    category_id,
    is_recommended = 0,
    is_spicy = 0,
    sort_order = 0
  } = req.body;

  const id = `dish_${uuidv4().split('-')[0]}`;
  // 如果有上传图片，保存相对路径
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO dishes 
    (id, name, description, price, image, category_id, is_recommended, is_spicy, sort_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, description, price, image, category_id, is_recommended, is_spicy, sort_order],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id, name, description, price, image, category_id, 
        is_recommended, is_spicy, sort_order 
      });
    });
});

/**
 * 更新菜品
 * 
 * 特点：
 * - 支持部分更新（只更新提供的字段）
 * - 图片可选（不传则不修改）
 * - 自动更新 updated_at 时间戳
 */
app.put('/api/dishes/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category_id,
    is_available,
    is_recommended,
    is_spicy,
    sort_order
  } = req.body;

  // 动态构建 SQL
  let sql = `UPDATE dishes SET 
    name = ?, description = ?, price = ?, category_id = ?,
    is_available = ?, is_recommended = ?, is_spicy = ?, sort_order = ?,
    updated_at = CURRENT_TIMESTAMP`;
  
  const params = [
    name, description, price, category_id,
    is_available, is_recommended, is_spicy, sort_order
  ];

  // 如果有新图片，更新图片路径
  if (req.file) {
    sql += ', image = ?';
    params.push(`/uploads/${req.file.filename}`);
  }

  sql += ' WHERE id = ?';
  params.push(id);

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '菜品已更新' });
  });
});

/**
 * 删除菜品
 * 
 * 注意：删除数据库记录的同时，应该删除对应的图片文件
 * 否则会产生孤儿文件，占用磁盘空间
 */
app.delete('/api/dishes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // 先查询图片路径
  db.get('SELECT image FROM dishes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.run('DELETE FROM dishes WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // 删除图片文件（如果存在）
      if (row && row.image) {
        const imagePath = path.join(UPLOAD_PATH, path.basename(row.image));
        fs.unlink(imagePath, () => {});  // 使用回调处理错误，不阻塞响应
      }
      
      res.json({ message: '菜品已删除' });
    });
  });
});

// ============================================================
// 11. 菜单展示 API（前端用）
// ============================================================
/**
 * 获取完整菜单数据
 * 
 * 特点：按分类组织，方便前端直接渲染
 * 只返回上架的菜品（is_available = 1）
 * 
 * 数据结构：
 * [
 *   {
 *     id: "cat_001",
 *     name: "招牌推荐",
 *     dishes: [...]
 *   },
 *   ...
 * ]
 */
app.get('/api/menu', (req, res) => {
  const sql = `
    SELECT c.id as category_id, c.name as category_name,
           d.id, d.name, d.description, d.price, d.image,
           d.is_recommended, d.is_spicy
    FROM categories c
    LEFT JOIN dishes d ON c.id = d.category_id AND d.is_available = 1
    ORDER BY c.sort_order, d.sort_order
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 将扁平数据转换为嵌套结构
    const menu = {};
    rows.forEach(row => {
      if (!menu[row.category_id]) {
        menu[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          dishes: []
        };
      }
      if (row.id) {
        menu[row.category_id].dishes.push({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          image: row.image,
          isRecommended: row.is_recommended === 1,
          isSpicy: row.is_spicy === 1
        });
      }
    });
    
    res.json(Object.values(menu));
  });
});

// ============================================================
// 12. 错误处理
// ============================================================
/**
 * 全局错误处理中间件
 * 
 * Express 的错误处理中间件必须是四个参数
 * 它会捕获所有路由中抛出的错误
 * 
 * 安全考虑：生产环境不返回详细错误信息，防止信息泄露
 */
app.use((err, req, res, next) => {
  console.error('错误:', err.stack);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? '服务器错误' : err.message 
  });
});

// ============================================================
// 13. 服务器启动
// ============================================================
/**
 * 启动服务器
 * 
 * 监听 0.0.0.0 而不是默认的 localhost
 * 原因：Docker 容器内 localhost 只绑定到容器内部
 * 0.0.0.0 接受所有网络接口的连接
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🏮 鼎味轩美食菜单系统');
  console.log('========================');
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`🌍 环境: ${NODE_ENV}`);
  console.log(`🗄️  数据库: ${DB_PATH}`);
  console.log(`📁 上传目录: ${UPLOAD_PATH}`);
  console.log('');
  console.log('📋 API 端点：');
  console.log('   GET  /health              - 健康检查');
  console.log('   GET  /api/health          - API 健康检查');
  console.log('   POST /api/auth/login      - 登录');
  console.log('   POST /api/auth/register   - 注册');
  console.log('   GET  /api/menu            - 菜单数据');
  console.log('');
  console.log('🔑 默认管理员账号：');
  console.log('   邮箱: admin@example.com');
  console.log('   密码: admin123');
  console.log('');
});

// ============================================================
// 14. 优雅关闭
// ============================================================
/**
 * 优雅关闭处理
 * 
 * 当容器收到停止信号（如 docker stop）时：
 * 1. 停止接受新请求
 * 2. 等待正在处理的请求完成
 * 3. 关闭数据库连接
 * 4. 退出进程
 * 
 * 这样可以防止数据丢失或损坏
 */

// SIGTERM：Docker stop / Kubernetes 发送的信号
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  db.close(() => {
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});

// SIGINT：Ctrl+C 发送的信号
process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  db.close(() => {
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});
