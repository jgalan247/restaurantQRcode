import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Orders</h1>
              <p className="text-gray-600">Monitor and manage customer orders in real-time</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">This page is under construction</p>
              <p className="text-gray-400 mt-2">Order management features coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
