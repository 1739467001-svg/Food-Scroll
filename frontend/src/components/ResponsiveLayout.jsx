import { useState, useEffect } from 'react';
import { Menu, X, ChefHat, LogOut, LayoutGrid, Settings, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useMediaQuery';

const ResponsiveLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 移动端关闭侧边栏当切换标签
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { id: 'dishes', label: '菜品管理', icon: LayoutGrid },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-china-beige">
      {/* 移动端顶部导航栏 */}
      {(isMobile || isTablet) && (
        <header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-china' 
              : 'bg-gradient-china-header'
          }`}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-china ${isScrolled ? 'text-china-ink' : 'text-white'}`}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isScrolled ? 'bg-china-red' : 'bg-white/20'
              }`}>
                <ChefHat className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`font-calligraphy text-xl ${isScrolled ? 'text-china-red' : 'text-white'}`}>
                鼎味轩
              </span>
            </div>
            
            <div className="w-10" /> {/* 占位保持居中 */}
          </div>
        </header>
      )}

      {/* 侧边栏遮罩 */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-out ${
          (isMobile || isTablet)
            ? sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            : 'translate-x-0 w-64'
        } ${(!isMobile && !isTablet) ? 'border-r border-china-gold-light' : ''}`}
        style={{ 
          width: (isMobile || isTablet) ? '280px' : '256px',
          boxShadow: (isMobile || isTablet) && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-china-gold-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-china-red to-china-red-dark rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-calligraphy text-xl text-china-red">鼎味轩</h1>
                <p className="text-xs text-china-ink-light">管理后台</p>
              </div>
            </div>
            {(isMobile || isTablet) && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-china-beige rounded-china"
              >
                <ChevronLeft className="w-5 h-5 text-china-ink-light" />
              </button>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-china transition-all ${
                    activeTab === item.id 
                      ? 'bg-china-red text-white shadow-lg' 
                      : 'hover:bg-china-beige text-china-ink-light'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* 快速链接 */}
          <div className="mt-8 pt-6 border-t border-china-gold-light">
            <p className="px-4 text-xs text-china-ink-light mb-3">快速链接</p>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 text-sm text-china-ink-light hover:text-china-red transition-colors"
            >
              <span>查看展示页</span>
              <span className="text-xs">→</span>
            </a>
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-china-gold-light bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-china-beige rounded-full flex items-center justify-center">
              <span className="text-china-red font-bold">{user?.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-china-ink truncate">{user?.name}</p>
              <p className="text-xs text-china-ink-light truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-china-red text-china-red rounded-china hover:bg-china-red hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main 
        className={`transition-all duration-300 ${
          (!isMobile && !isTablet) ? 'ml-64' : ''
        } ${(isMobile || isTablet) ? 'pt-14' : ''}`}
      >
        {/* 桌面端头部 */}
        {(!isMobile && !isTablet) && (
          <header className="bg-white border-b border-china-gold-light px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-china-ink">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-china-ink-light mt-1">
                  {activeTab === 'dishes' && '管理您的菜单，添加、编辑或删除菜品'}
                  {activeTab === 'settings' && '系统设置和配置'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-china-ink-light">
                  {new Date().toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </div>
          </header>
        )}

        {/* 内容 */}
        <div className={`${(isMobile || isTablet) ? 'p-4' : 'p-8'}`}>
          {children}
        </div>
      </main>

      {/* 移动端底部安全区域 */}
      {(isMobile || isTablet) && (
        <div className="h-safe-bottom" />
      )}
    </div>
  );
};

export default ResponsiveLayout;
