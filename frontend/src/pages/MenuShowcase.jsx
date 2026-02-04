import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Phone, MapPin, Clock, ChevronUp, Menu } from 'lucide-react';
import { useBreakpoint } from '../hooks/useMediaQuery';

const MenuShowcase = () => {
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const categoryRefs = useRef({});
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    fetchMenu();
    
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchMenu = async () => {
    try {
      const [menuRes, catsRes] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/categories')
      ]);
      setMenuData(menuRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menuData.filter(category => {
    if (activeCategory === 'all') return true;
    return category.id === activeCategory;
  });

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setMobileMenuOpen(false);
    
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (categoryRefs.current[categoryId]) {
      const offset = isMobile ? 140 : 180; // 考虑固定导航高度
      const element = categoryRefs.current[categoryId];
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (name) => {
    const icons = {
      '招牌': '🔥',
      '推荐': '⭐',
      '热菜': '🍲',
      '凉菜': '🥗',
      '汤': '🥣',
      '主食': '🍚',
      '饮品': '🍵',
      '甜点': '🍰',
      '海鲜': '🦐',
      '烧烤': '🍢',
    };
    for (const key in icons) {
      if (name.includes(key)) return icons[key];
    }
    return '🍽️';
  };

  // 搜索过滤
  const searchResults = searchQuery
    ? menuData.flatMap(cat => 
        cat.dishes.filter(dish => 
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ).map(dish => ({ ...dish, categoryName: cat.name }))
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-china-beige">
        <div className="text-center">
          <div className="text-5xl md:text-6xl mb-4 animate-bounce">🥢</div>
          <p className="text-china-ink-light font-serif text-lg">正在准备美味...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-china-beige">
      {/* Header */}
      <header className="bg-gradient-china-header text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
          <div className="absolute top-4 left-4 md:top-6 md:left-6 right-4 md:right-6 h-10 md:h-12 border-2 border-china-gold/30 border-b-0">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-0.5 bg-china-gold" />
          </div>
          
          <h1 className="font-calligraphy text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">鼎味轩</h1>
          <p className="text-china-gold text-xs md:text-sm tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6">SINCE 1920</p>
          
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-china-gold" />
            <span className="text-china-gold text-lg md:text-xl">◆</span>
            <div className="h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-china-gold" />
          </div>
          
          <p className="text-white/80 max-w-md mx-auto leading-relaxed text-sm md:text-base px-4">
            传承百年烹饪技艺<br className="md:hidden" />
            <span className="hidden md:inline"> · </span>
            品味中华美食精髓
          </p>
          
          {/* Info Bar */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-6 md:mt-8 text-xs md:text-sm text-white/70">
            <span className="flex items-center gap-1.5 md:gap-2">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              10:00 - 22:00
            </span>
            <span className="flex items-center gap-1.5 md:gap-2">
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
              400-888-8888
            </span>
            <span className="hidden sm:flex items-center gap-1.5 md:gap-2">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
              北京市朝阳区
            </span>
          </div>
        </div>
      </header>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-china-gold-light shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          {/* Search Bar - Mobile */}
          <div className="py-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-china-ink-light" />
              <input
                type="text"
                placeholder="搜索菜品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-china-beige rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-china-gold"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className={`flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide ${isMobile ? 'pb-3' : 'py-4'}`}>
            <button
              onClick={() => scrollToCategory('all')}
              className={`flex-shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-china-red text-white shadow-lg'
                  : 'bg-china-beige text-china-ink-light hover:bg-china-gold-light'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-china-red text-white shadow-lg'
                    : 'bg-china-beige text-china-ink-light hover:bg-china-gold-light'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Search Results */}
        {searchQuery && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg md:text-xl">🔍</span>
              <h2 className="text-lg md:text-xl font-bold text-china-ink">
                搜索结果 ({searchResults.length})
              </h2>
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-auto text-sm text-china-red"
              >
                清除
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-china-ink-light">
                <p>未找到相关菜品</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {searchResults.map((dish) => (
                  <SearchResultCard key={dish.id} dish={dish} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Menu Sections */}
        {!searchQuery && filteredMenu.map((category, index) => (
          <section 
            key={category.id} 
            ref={el => categoryRefs.current[category.id] = el}
            className="mb-8 md:mb-12 scroll-mt-32 md:scroll-mt-40"
          >
            {/* Section Header */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="h-px flex-1 max-w-[60px] md:max-w-[100px] bg-gradient-to-r from-transparent to-china-gold" />
              <div className="w-10 h-10 md:w-12 md:h-12 bg-china-gold-light rounded-full flex items-center justify-center text-xl md:text-2xl">
                {getCategoryIcon(category.name)}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-china-red">{category.name}</h2>
              <div className="h-px flex-1 max-w-[60px] md:max-w-[100px] bg-gradient-to-l from-transparent to-china-gold" />
            </div>

            {/* Dishes */}
            <div className="space-y-4 md:space-y-6">
              {category.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} category={category} isMobile={isMobile} />
              ))}
            </div>
          </section>
        ))}

        {filteredMenu.length === 0 && !searchQuery && (
          <div className="text-center py-12 md:py-20">
            <div className="text-5xl md:text-6xl mb-4">🥡</div>
            <h3 className="text-lg md:text-xl font-bold text-china-ink mb-2">暂无菜品</h3>
            <p className="text-china-ink-light">该分类下暂时没有菜品</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-china-ink text-white/60 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="font-calligraphy text-2xl md:text-3xl text-china-gold mb-3 md:mb-4">鼎味轩</h3>
          <p className="text-sm md:text-base mb-1">用心烹饪每一道菜品 · 期待您的光临</p>
          <p className="text-xs opacity-60">© 2024 鼎味轩. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-10 h-10 md:w-12 md:h-12 bg-china-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-china-red-dark transition-colors z-40"
        >
          <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Admin Link */}
      <a
        href="/login"
        className="fixed bottom-6 left-6 w-10 h-10 md:w-12 md:h-12 bg-china-gold text-white rounded-full shadow-lg flex items-center justify-center hover:bg-china-gold-dark transition-colors z-40"
        title="管理员入口"
      >
        <span className="text-base md:text-lg">🔐</span>
      </a>
    </div>
  );
};

// Dish Card Component
const DishCard = ({ dish, category, isMobile }) => (
  <div className="china-card p-4 md:p-6 relative group">
    <div className="corner-tl" />
    <div className="corner-tr" />
    <div className="corner-bl" />
    <div className="corner-br" />
    
    <div className={`flex gap-4 md:gap-6 ${isMobile ? 'flex-col' : ''}`}>
      {/* Image */}
      <div className={`${isMobile ? 'w-full h-40' : 'w-24 h-24 md:w-32 md:h-32'} bg-china-beige rounded-china flex-shrink-0 overflow-hidden border-2 border-china-gold-light`}>
        {dish.image ? (
          <img
            src={`http://localhost:3001${dish.image}`}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl">
            🍽️
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 md:gap-4 mb-2">
          <h3 className="text-lg md:text-xl font-bold text-china-ink flex items-center gap-2 flex-wrap">
            {dish.name}
            {dish.isRecommended && (
              <span className="px-2 py-0.5 bg-china-gold text-white text-xs rounded-full">
                镇店之宝
              </span>
            )}
            {dish.isSpicy && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                辣
              </span>
            )}
          </h3>
          <span className="text-xl md:text-2xl font-bold text-china-red whitespace-nowrap">
            <span className="text-sm md:text-base">¥</span>{dish.price}
          </span>
        </div>
        
        {dish.description && (
          <p className="text-sm md:text-base text-china-ink-light mb-3 leading-relaxed">
            {dish.description}
          </p>
        )}
        
        {/* Story Quote */}
        <div className="bg-china-gold-light/30 border-l-3 md:border-l-4 border-china-gold pl-3 md:pl-4 py-2 rounded-r">
          <p className="text-xs md:text-sm text-china-ink-light italic">
            "{dish.description || '传承经典，品味非凡'}"
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Search Result Card
const SearchResultCard = ({ dish }) => (
  <div className="china-card p-4 relative">
    <div className="corner-tl" />
    <div className="corner-tr" />
    
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-china-beige rounded-china flex-shrink-0 overflow-hidden">
        {dish.image ? (
          <img src={`http://localhost:3001${dish.image}`} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-china-ink">{dish.name}</h4>
            <span className="text-xs text-china-gold">{dish.categoryName}</span>
          </div>
          <span className="text-lg font-bold text-china-red">¥{dish.price}</span>
        </div>
        {dish.description && (
          <p className="text-sm text-china-ink-light mt-1 line-clamp-2">{dish.description}</p>
        )}
      </div>
    </div>
  </div>
);

export default MenuShowcase;
