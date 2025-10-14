import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Star,
  Clock,
  ChefHat,
  UtensilsCrossed,
  BarChart3,
  Package,
  Gift,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

interface DashboardStats {
  today_sales: number;
  today_orders: number;
  average_order_value: number;
  most_popular_item: string | null;
  most_popular_item_count: number;
  pending_orders: number;
  preparing_orders: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    // Get admin info from localStorage
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setAdminName(user.username);
      } catch (e) {
        console.error('Failed to parse admin user', e);
      }
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">La Hacienda</h1>
              <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{adminName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Sales */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.today_sales) : '£0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Orders Today */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.today_orders || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.average_order_value) : '£0.00'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Popular Item */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1">Popular Item Today</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {stats?.most_popular_item || 'No data'}
                </p>
                {stats?.most_popular_item && (
                  <p className="text-sm text-gray-500">
                    {stats.most_popular_item_count} orders
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-full ml-2">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Orders Alert */}
        {stats && (stats.pending_orders > 0 || stats.preparing_orders > 0) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-semibold text-yellow-800">Active Orders</p>
                <p className="text-sm text-yellow-700">
                  {stats.pending_orders} pending payment, {stats.preparing_orders} being prepared
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Management */}
          <button
            onClick={() => navigate('/admin/menu')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <UtensilsCrossed className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-orange-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Menu Management</h3>
            <p className="text-gray-600 text-sm">
              Add, edit, or remove menu items and categories
            </p>
          </button>

          {/* View Orders */}
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-blue-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600 text-sm">
              Monitor and manage customer orders in real-time
            </p>
          </button>

          {/* Reports & Analytics */}
          <button
            onClick={() => navigate('/admin/reports')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-purple-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-600 text-sm">
              View detailed sales reports and analytics
            </p>
          </button>

          {/* Specials Management */}
          <button
            onClick={() => navigate('/admin/specials')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <ChefHat className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-red-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Specials</h3>
            <p className="text-gray-600 text-sm">
              Create and manage daily specials and menu of the day
            </p>
          </button>

          {/* Offers & Promotions */}
          <button
            onClick={() => navigate('/admin/offers')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-green-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Offers & Promotions</h3>
            <p className="text-gray-600 text-sm">
              Set up special offers and promotional campaigns
            </p>
          </button>

          {/* Settings (placeholder for future) */}
          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-gray-600 font-semibold">→</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">
              Configure restaurant settings and preferences
            </p>
          </button>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats?.today_orders || 0}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats?.pending_orders || 0}</p>
              <p className="text-sm text-gray-600">Pending Payment</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats?.preparing_orders || 0}</p>
              <p className="text-sm text-gray-600">Being Prepared</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats ? formatCurrency(stats.today_sales) : '£0.00'}
              </p>
              <p className="text-sm text-gray-600">Today's Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
