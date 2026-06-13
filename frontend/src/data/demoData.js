/**
 * 演示数据（Demo Data）
 *
 * 用途：当后端 API 不可用时（例如部署在 GitHub Pages 这类纯静态托管平台），
 * 菜单展示页会自动回退到这里的内置数据，保证页面始终有内容可浏览。
 *
 * 数据结构与后端 /api/menu、/api/categories 返回的格式保持一致，
 * 因此前端组件无需做任何额外适配。
 *
 * 图片使用 Unsplash 公共美食图，加载失败时组件会自动回退为 emoji 占位。
 */

// 分类（对应后端 categories 表，含排序）
export const demoCategories = [
  { id: 'cat_001', name: '招牌推荐', sort_order: 1 },
  { id: 'cat_002', name: '热菜', sort_order: 2 },
  { id: 'cat_003', name: '凉菜', sort_order: 3 },
  { id: 'cat_004', name: '汤品', sort_order: 4 },
  { id: 'cat_005', name: '主食', sort_order: 5 },
  { id: 'cat_006', name: '饮品', sort_order: 6 },
];

// 完整菜单（对应后端 /api/menu 的嵌套结构：分类 -> 菜品列表）
export const demoMenu = [
  {
    id: 'cat_001',
    name: '招牌推荐',
    dishes: [
      {
        id: 'dish_001',
        name: '北京烤鸭',
        description: '果木炭火烤制，皮酥肉嫩，配薄饼、葱丝与甜面酱，百年宫廷风味。',
        price: 198,
        image: 'https://images.unsplash.com/photo-1518983546435-91f8b87fe561?w=600&q=80',
        isRecommended: true,
        isSpicy: false,
      },
      {
        id: 'dish_002',
        name: '清蒸东星斑',
        description: '深海东星斑现杀清蒸，仅以姜葱提鲜，肉质细嫩，原汁原味。',
        price: 268,
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80',
        isRecommended: true,
        isSpicy: false,
      },
      {
        id: 'dish_003',
        name: '佛跳墙',
        description: '鲍参翅肚十余味珍材文火慢煨，醇厚浓香，一坛汇尽山海至味。',
        price: 388,
        image: 'https://images.unsplash.com/photo-1547928576-b822bc410bdf?w=600&q=80',
        isRecommended: true,
        isSpicy: false,
      },
    ],
  },
  {
    id: 'cat_002',
    name: '热菜',
    dishes: [
      {
        id: 'dish_011',
        name: '宫保鸡丁',
        description: '鸡腿肉配花生与干辣椒爆炒，酸甜微辣，糊辣荔枝口，下饭一绝。',
        price: 48,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80',
        isRecommended: false,
        isSpicy: true,
      },
      {
        id: 'dish_012',
        name: '麻婆豆腐',
        description: '川式经典，麻辣鲜香，豆腐嫩滑，牛肉末提味，麻味十足。',
        price: 36,
        image: 'https://images.unsplash.com/photo-1541379889662-9c2e8c3f0d6e?w=600&q=80',
        isRecommended: false,
        isSpicy: true,
      },
      {
        id: 'dish_013',
        name: '红烧狮子头',
        description: '淮扬名菜，手工剁制肥瘦相间，文火慢炖，入口即化，咸鲜回甜。',
        price: 58,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
      {
        id: 'dish_014',
        name: '糖醋里脊',
        description: '精选里脊裹浆炸制，外酥里嫩，浇以晶亮糖醋汁，酸甜开胃。',
        price: 52,
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
    ],
  },
  {
    id: 'cat_003',
    name: '凉菜',
    dishes: [
      {
        id: 'dish_021',
        name: '口水鸡',
        description: '散养土鸡白切，淋红油藤椒蒜汁，麻辣鲜香，皮爽肉滑。',
        price: 42,
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
        isRecommended: false,
        isSpicy: true,
      },
      {
        id: 'dish_022',
        name: '老醋蜇头',
        description: '海蜇头爽脆弹牙，陈醋黄瓜凉拌，清爽解腻，夏日开胃。',
        price: 38,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
    ],
  },
  {
    id: 'cat_004',
    name: '汤品',
    dishes: [
      {
        id: 'dish_031',
        name: '酸辣汤',
        description: '木耳、豆腐、笋丝同煮，胡椒与陈醋调味，酸辣开胃暖身。',
        price: 28,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
        isRecommended: false,
        isSpicy: true,
      },
      {
        id: 'dish_032',
        name: '老火例汤',
        description: '猪骨配时令药材老火慢煲三小时，汤色清亮，温润滋补。',
        price: 32,
        image: 'https://images.unsplash.com/photo-1604908554007-b8e1d2a8e8a7?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
    ],
  },
  {
    id: 'cat_005',
    name: '主食',
    dishes: [
      {
        id: 'dish_041',
        name: '扬州炒饭',
        description: '粒粒分明，火腿、虾仁、青豆与蛋香交融，金黄诱人。',
        price: 26,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
      {
        id: 'dish_042',
        name: '担担面',
        description: '川味红油担担面，芽菜肉臊浇头，麻辣浓香，拌匀更入味。',
        price: 24,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        isRecommended: false,
        isSpicy: true,
      },
    ],
  },
  {
    id: 'cat_006',
    name: '饮品',
    dishes: [
      {
        id: 'dish_051',
        name: '酸梅汤',
        description: '乌梅、山楂、桂花古法熬煮冰镇，生津止渴，老北京风味。',
        price: 16,
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
      {
        id: 'dish_052',
        name: '茉莉香片',
        description: '福建头采茉莉花茶，香气清雅，回甘绵长，佐餐解腻佳品。',
        price: 18,
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80',
        isRecommended: false,
        isSpicy: false,
      },
    ],
  },
];
