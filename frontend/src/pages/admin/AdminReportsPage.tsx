import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Award,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

// Color palette for charts
const COLORS = ['#f97316', '#ea580c', '#dc2626', '#fb923c', '#fdba74', '#fed7aa'];

interface KeyMetrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  popular_item: {
    name: string;
    quantity: number;
  };
  revenue_trend: number;
  orders_trend: number;
  avg_order_value_trend: number;
}

export default function AdminReportsPage() {
  const navigate = useNavigate();

  // Date range state
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Last 7 days by default
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data state
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
  const [ordersByTime, setOrdersByTime] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [bottomItems, setBottomItems] = useState<any[]>([]);
  const [salesByTable, setSalesByTable] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any[]>([]);

  // Fetch all report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        revenueData,
        ordersTimeData,
        categoryData,
        topItemsData,
        bottomItemsData,
        tableData,
        paymentData,
        dailyData,
      ] = await Promise.all([
        adminApi.getKeyMetrics(startDate, endDate),
        adminApi.getRevenueOverTime(startDate, endDate, 'day'),
        adminApi.getOrdersByTime(startDate, endDate),
        adminApi.getRevenueByCategory(startDate, endDate),
        adminApi.getTopItems(startDate, endDate, 20),
        adminApi.getBottomItems(startDate, endDate, 10),
        adminApi.getSalesByTable(startDate, endDate),
        adminApi.getPaymentMethods(startDate, endDate),
        adminApi.getDailySummary(startDate, endDate),
      ]);

      setMetrics(metricsData);
      setRevenueOverTime(revenueData);
      setOrdersByTime(ordersTimeData);
      setRevenueByCategory(categoryData);
      setTopItems(topItemsData);
      setBottomItems(bottomItemsData);
      setSalesByTable(tableData);
      setPaymentMethods(paymentData);
      setDailySummary(dailyData);
    } catch (error: any) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch data on mount and when dates change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Quick date range presets
  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Export functions
  const handleExportCSV = async (reportType: string = 'comprehensive') => {
    try {
      const blob = await adminApi.exportReportCSV(startDate, endDate, reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  const handleExportJSON = async () => {
    try {
      const blob = await adminApi.exportReportJSON(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_comprehensive_${startDate}_${endDate}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  // Render trend indicator
  const TrendIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive sales and performance analysis</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExportCSV('comprehensive')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex flex-col md:flex-row gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <span className="flex items-center justify-center text-gray-600">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateRange(7)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => setDateRange(30)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Last 30 days
              </button>
              <button
                onClick={() => setDateRange(90)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Last 90 days
              </button>
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        )}

        {!loading && metrics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800">£{metrics.total_revenue.toFixed(2)}</div>
                <div className="mt-2">
                  <TrendIndicator value={metrics.revenue_trend} />
                  <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Orders</span>
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{metrics.total_orders}</div>
                <div className="mt-2">
                  <TrendIndicator value={metrics.orders_trend} />
                  <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Avg Order Value</span>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800">£{metrics.avg_order_value.toFixed(2)}</div>
                <div className="mt-2">
                  <TrendIndicator value={metrics.avg_order_value_trend} />
                  <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Popular Item</span>
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-800 truncate">{metrics.popular_item.name}</div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">{metrics.popular_item.quantity} sold</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Over Time */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} name="Revenue (£)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Orders by Time of Day */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Orders by Time of Day</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersByTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="order_count" fill="#ea580c" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue by Category</h2>
              <div className="flex flex-col md:flex-row items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry: any) => `${entry.category}: ${(entry.percentage as number).toFixed(1)}%`}
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full md:w-1/2 mt-4 md:mt-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">Category</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByCategory.map((cat, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              />
                              {cat.category}
                            </div>
                          </td>
                          <td className="text-right py-2 text-sm">£{cat.revenue.toFixed(2)}</td>
                          <td className="text-right py-2 text-sm">{cat.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top & Bottom Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Selling Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Top Selling Items</h2>
                  <button
                    onClick={() => handleExportCSV('top-items')}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">#</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topItems.slice(0, 10).map((item) => (
                        <tr key={item.rank} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-sm font-medium">{item.rank}</td>
                          <td className="py-2 text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </td>
                          <td className="text-right py-2 text-sm">{item.quantity}</td>
                          <td className="text-right py-2 text-sm font-medium">£{item.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Worst Performing Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Worst Performing Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">#</th>
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">Item</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bottomItems.map((item) => (
                        <tr key={item.rank} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-sm font-medium">{item.rank}</td>
                          <td className="py-2 text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </td>
                          <td className="text-right py-2 text-sm">{item.quantity}</td>
                          <td className="text-right py-2 text-sm font-medium">£{item.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sales by Table & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sales by Table */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Sales by Table</h2>
                  <button
                    onClick={() => handleExportCSV('sales-by-table')}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-semibold text-gray-700">Table</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Orders</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-2 text-sm font-semibold text-gray-700">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByTable.map((table, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-sm font-medium">Table {table.table_number}</td>
                          <td className="text-right py-2 text-sm">{table.order_count}</td>
                          <td className="text-right py-2 text-sm font-medium">£{table.total_revenue.toFixed(2)}</td>
                          <td className="text-right py-2 text-sm">£{table.avg_order_value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
                <div className="space-y-4">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{method.method}</span>
                        <span className="text-lg font-bold text-gray-800">£{method.revenue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{method.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">{method.order_count} orders</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Sales Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daily Sales Summary</h2>
                <button
                  onClick={() => handleExportCSV('daily-summary')}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Revenue</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySummary.map((day, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{day.date}</td>
                        <td className="text-right py-3 px-4 text-sm">{day.order_count}</td>
                        <td className="text-right py-3 px-4 text-sm font-medium">£{day.total_revenue.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 text-sm">£{day.avg_order_value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-gray-50 font-bold">
                      <td className="py-3 px-4 text-sm">Total</td>
                      <td className="text-right py-3 px-4 text-sm">{metrics.total_orders}</td>
                      <td className="text-right py-3 px-4 text-sm">£{metrics.total_revenue.toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-sm">£{metrics.avg_order_value.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && !metrics && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No data available for the selected date range.</p>
            <p className="text-gray-500 mt-2">Try adjusting your date range or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
