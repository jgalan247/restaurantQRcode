import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, DollarSign, Package, TrendingUp,
  Search, X, Check, AlertCircle, ChevronDown, ChevronUp,
  RefreshCw, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

interface Order {
  id: number;
  order_number: string;
  table_number: string;
  status: string;
  total_amount: number;
  item_count: number;
  customer_notes?: string;
  created_at: string;
  wait_time_minutes: number;
  items: OrderItem[];
}

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  item_total: number;
  special_notes?: string;
  allergens?: string[];
  dietary_tags?: string[];
}

interface Stats {
  active_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  completed_today: number;
  average_prep_time?: number;
  longest_waiting_order?: any;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200', bgColor: 'bg-orange-50' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800 border-blue-200', bgColor: 'bg-blue-50' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800 border-blue-200', bgColor: 'bg-blue-50' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200', bgColor: 'bg-green-50' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800 border-gray-200', bgColor: 'bg-gray-50' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', bgColor: 'bg-red-50' },
  pending_payment: { label: 'Pending Payment', color: 'bg-orange-100 text-orange-800 border-orange-200', bgColor: 'bg-orange-50' },
};

export default function AdminOrdersPageNew() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15);

  // Fetch data
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab !== 'all' ? activeTab : undefined;
      const data = await adminApi.getOrders({ status: statusFilter, page_size: 100 });
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, countsData] = await Promise.all([
        adminApi.getOrderStats(),
        adminApi.getStatusCounts()
      ]);
      setStats(statsData);
      setStatusCounts(countsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrders, fetchStats]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatusNew(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.table_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusActions = (status: string) => {
    switch (status) {
      case 'pending_payment':
      case 'paid':
        return [{ label: 'Start Preparing', value: 'preparing', color: 'bg-blue-600' }];
      case 'preparing':
        return [{ label: 'Mark as Ready', value: 'ready', color: 'bg-green-600' }];
      case 'ready':
        return [{ label: 'Complete', value: 'completed', color: 'bg-gray-600' }];
      default:
        return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  };

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-600 mt-1">Real-time order monitoring and management</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.active_orders}</p>
                </div>
                <Package className="w-10 h-10 text-orange-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Prep Time</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.average_prep_time ? `${stats.average_prep_time}m` : 'N/A'}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_today}</p>
                </div>
                <Check className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Longest Wait</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.longest_waiting_order ? `${stats.longest_waiting_order.wait_time_minutes}m` : '0m'}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Orders', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'preparing', label: 'Preparing', count: statusCounts.preparing },
              { key: 'ready', label: 'Ready', count: statusCounts.ready },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} {tab.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const isExpanded = expandedOrder === order.id;
              const isUrgent = order.wait_time_minutes > 30 && ['pending_payment', 'paid', 'preparing'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`${statusConfig.bgColor} rounded-xl shadow-md overflow-hidden transition-all ${
                    isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Order #{order.order_number}</p>
                        <p className="text-3xl font-bold text-gray-900">Table {order.table_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Time and Amount */}
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(order.created_at)}</span>
                        {isUrgent && <AlertCircle className="w-4 h-4 text-red-500 ml-1" />}
                      </div>
                      <div className="font-bold text-lg">{formatCurrency(order.total_amount)}</div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                    </div>

                    {order.customer_notes && (
                      <div className="bg-white/50 rounded-lg p-3 mb-4 text-sm">
                        <p className="text-gray-700"><strong>Notes:</strong> {order.customer_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                      {getStatusActions(order.status).map((action) => (
                        <button
                          key={action.value}
                          onClick={() => handleStatusChange(order.id, action.value)}
                          className={`w-full ${action.color} text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium`}
                        >
                          {action.label}
                        </button>
                      ))}

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Hide' : 'View'} Details
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold mb-3">Order Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-white/70 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium">{item.quantity}x {item.name}</p>
                                  {item.special_notes && (
                                    <p className="text-xs text-gray-600 mt-1">Note: {item.special_notes}</p>
                                  )}
                                  {item.allergens && item.allergens.length > 0 && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Allergens: {item.allergens.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <p className="font-semibold">{formatCurrency(item.item_total)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
