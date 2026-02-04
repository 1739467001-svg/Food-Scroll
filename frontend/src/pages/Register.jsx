import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils } from 'lucide-react';
import { useBreakpoint } from '../hooks/useMediaQuery';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    
    const result = await register(name, email, password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 bg-gradient-to-b from-china-beige to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-china-red to-china-red-dark rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-china-lg">
            <Utensils className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-calligraphy text-china-red mb-1 md:mb-2">鼎味轩</h1>
          <p className="text-sm md:text-base text-china-ink-light">创建管理员账号</p>
        </div>

        {/* Register Card */}
        <div className="china-card p-5 md:p-8 relative">
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />
          
          <h2 className="text-xl md:text-2xl font-bold text-center text-china-ink mb-4 md:mb-6">注册账号</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-china-ink-light mb-2">
                姓名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="china-input text-base"
                placeholder="请输入姓名"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-china-ink-light mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="china-input text-base"
                placeholder="请输入邮箱"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-china-ink-light mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="china-input text-base"
                placeholder="请输入密码（至少6位）"
                minLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-china-ink-light mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="china-input text-base"
                placeholder="请再次输入密码"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full china-btn-primary flex items-center justify-center gap-2 text-base py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  注册中...
                </span>
              ) : (
                <>
                  <span>注册</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-5 md:mt-6 text-center">
            <span className="text-china-ink-light text-sm">已有账号？</span>
            <Link to="/login" className="ml-2 text-china-red hover:underline font-medium text-sm">
              立即登录
            </Link>
          </div>
        </div>
        
        {/* Back to Menu */}
        <div className="mt-5 md:mt-6 text-center">
          <Link to="/" className="text-china-ink-light hover:text-china-red transition-colors text-sm flex items-center justify-center gap-1">
            <span>←</span>
            <span>返回菜单展示页</span>
          </Link>
        </div>

        {/* Mobile Safe Area */}
        {isMobile && <div className="h-safe-bottom" />}
      </div>
    </div>
  );
};

export default Register;
