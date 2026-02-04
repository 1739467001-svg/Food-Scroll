import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, Edit2, Trash2, ChefHat, DollarSign, Tag, 
  Eye, Settings, Image as ImageIcon, Flame, AlertCircle
} from 'lucide-react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import { useBreakpoint } from '../hooks/useMediaQuery';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [activeTab, setActiveTab] = useState('dishes');
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    is_recommended: false,
    is_spicy: false,
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dishesRes, catsRes] = await Promise.all([
        axios.get('/api/dishes'),
        axios.get('/api/categories')
      ]);
      setDishes(dishesRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category_id: categories[0]?.id || '',
      is_recommended: false,
      is_spicy: false,
      is_available: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingDish(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingDish) {
        await axios.put(`/api/dishes/${editingDish.id}`, data);
      } else {
        await axios.post('/api/dishes', data);
      }
      
      resetForm();
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save dish:', err);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      price: dish.price,
      description: dish.description || '',
      category_id: dish.category_id,
      is_recommended: dish.is_recommended === 1,
      is_spicy: dish.is_spicy === 1,
      is_available: dish.is_available === 1,
    });
    setImagePreview(dish.image ? `http://localhost:3001${dish.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个菜品吗？')) return;
    
    try {
      await axios.delete(`/api/dishes/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete dish:', err);
      alert('删除失败');
    }
  };

  const stats = {
    total: dishes.length,
    available: dishes.filter(d => d.is_available === 1).length,
    recommended: dishes.filter(d => d.is_recommended === 1).length,
    categories: categories.length,
  };

  // Stats Card Component
  const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="china-card p-4 md:p-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-china flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-china-ink">{value}</p>
          <p className="text-xs md:text-sm text-china-ink-light">{label}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-china-red text-xl font-serif">加载中...</div>
      </div>
    );
  }

  return (
    <ResponsiveLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dishes' && (
        <>
          {/* Stats - 响应式网格 */}
          <div className={`grid gap-4 mb-6 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
          }`}>
            <StatCard 
              icon={ChefHat} 
              value={stats.total} 
              label="总菜品" 
              color="bg-orange-100 text-orange-600"
            />
            <StatCard 
              icon={Eye} 
              value={stats.available} 
              label="在售中" 
              color="bg-green-100 text-green-600"
            />
            <StatCard 
              icon={Flame} 
              value={stats.recommended} 
              label="推荐菜" 
              color="bg-red-100 text-red-600"
            />
            <StatCard 
              icon={Tag} 
              value={stats.categories} 
              label="分类数" 
              color="bg-purple-100 text-purple-600"
            />
          </div>

          {/* Actions */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6`}>
            <div className={`flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide`}>
              <button className="px-4 py-2 bg-white border border-china-gold-light rounded-china text-sm hover:border-china-gold transition-colors whitespace-nowrap">
                全部
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="px-4 py-2 bg-white border border-china-gold-light rounded-china text-sm hover:border-china-gold transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="china-btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>新增菜品</span>
            </button>
          </div>

          {/* Dish Grid - 响应式列数 */}
          <div className={`grid gap-4 md:gap-6 ${
            isMobile ? 'grid-cols-1' : 
            isTablet ? 'grid-cols-2' : 
            'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {dishes.map((dish) => (
              <div key={dish.id} className="china-card overflow-hidden group">
                <div className="h-40 md:h-48 bg-china-beige relative overflow-hidden">
                  {dish.image ? (
                    <img 
                      src={`http://localhost:3001${dish.image}`} 
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl md:text-6xl">
                      🍽️
                    </div>
                  )}
                  
                  {dish.is_recommended === 1 && (
                    <span className="absolute top-2 left-2 md:top-3 md:left-3 px-2 md:px-3 py-1 bg-china-gold text-white text-xs font-bold rounded-full">
                      推荐
                    </span>
                  )}
                  {dish.is_spicy === 1 && (
                    <span className="absolute top-2 right-2 md:top-3 md:right-3 px-2 md:px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      辣
                    </span>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 md:gap-3">
                    <button
                      onClick={() => handleEdit(dish)}
                      className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-china-ink hover:bg-china-gold hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <h3 className="font-bold text-china-ink text-base md:text-lg truncate pr-2">{dish.name}</h3>
                    <span className="text-china-red font-bold whitespace-nowrap">¥{dish.price}</span>
                  </div>
                  <p className="text-sm text-china-ink-light line-clamp-2 mb-2 md:mb-3">
                    {dish.description || '暂无描述'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-china-beige rounded text-china-ink-light">
                      {categories.find(c => c.id === dish.category_id)?.name}
                    </span>
                    <span className={`text-xs ${dish.is_available ? 'text-green-600' : 'text-red-500'}`}>
                      {dish.is_available ? '在售' : '已下架'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="china-card p-6 md:p-8">
          <h3 className="text-xl font-bold text-china-ink mb-6">系统设置</h3>
          <p className="text-china-ink-light">设置功能开发中...</p>
        </div>
      )}

      {/* Dish Form Modal - 响应式弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-china-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-china-gold-light flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-china-ink">
                {editingDish ? '编辑菜品' : '新增菜品'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-china-beige rounded-china text-china-ink-light"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-china-ink-light mb-2">
                  菜品图片
                </label>
                <div
                  onClick={() => document.getElementById('image-input').click()}
                  className="w-full h-40 md:h-48 border-2 border-dashed border-china-gold-light rounded-china-lg flex items-center justify-center cursor-pointer hover:border-china-gold transition-colors overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-china-ink-light">
                      <ImageIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" />
                      <span className="text-sm">点击上传图片</span>
                    </div>
                  )}
                </div>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-china-ink-light mb-2">
                    菜品名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="china-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-china-ink-light mb-2">
                    价格 (¥) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="china-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-china-ink-light mb-2">
                  分类 *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="china-input"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-china-ink-light mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="china-input min-h-[80px] md:min-h-[100px]"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_recommended}
                    onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})}
                    className="w-4 h-4 md:w-5 md:h-5 accent-china-red"
                  />
                  <span className="text-sm">招牌推荐</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_spicy}
                    onChange={(e) => setFormData({...formData, is_spicy: e.target.checked})}
                    className="w-4 h-4 md:w-5 md:h-5 accent-china-red"
                  />
                  <span className="text-sm">辣味</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    className="w-4 h-4 md:w-5 md:h-5 accent-china-red"
                  />
                  <span className="text-sm">上架</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 china-btn-secondary order-2 sm:order-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 china-btn-primary order-1 sm:order-2"
                >
                  {editingDish ? '保存修改' : '创建菜品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default AdminDashboard;
