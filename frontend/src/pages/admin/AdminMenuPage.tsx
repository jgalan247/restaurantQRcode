import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Upload,
  Download,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';

interface MenuItem {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  description: string | null;
  price: number;
  calories: number | null;
  allergens: string[] | null;
  image_url: string | null;
  is_available: boolean;
  spice_level: string | null;
  is_lite_bite: boolean;
  is_child_friendly: boolean;
  is_salad: boolean;
  is_deal: boolean;
  is_gluten_free: boolean;
  dietary_tags: string[] | null;
  display_order: number | null;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface MenuItemFormData {
  name: string;
  category_id: number | string;
  description: string;
  price: string;
  calories: string;
  allergens: string;
  image_url: string;
  is_available: boolean;
}

export default function AdminMenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    category_id: '',
    description: '',
    price: '',
    calories: '',
    allergens: '',
    image_url: '',
    is_available: true,
  });

  // Deletion confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // CSV Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMenuItems({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch (error: any) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: '',
      description: '',
      price: '',
      calories: '',
      allergens: '',
      image_url: '',
      is_available: true,
    });
    setShowModal(true);
  };

  const handleEdit = (item: MenuItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      description: item.description || '',
      price: item.price.toString(),
      calories: item.calories?.toString() || '',
      allergens: item.allergens?.join(', ') || '',
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.category_id) {
      toast.error('Category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id.toString()),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        calories: formData.calories ? parseInt(formData.calories) : null,
        allergens: formData.allergens
          ? formData.allergens.split(',').map(a => a.trim()).filter(Boolean)
          : [],
        image_url: formData.image_url.trim() || null,
        is_available: formData.is_available,
        dietary_tags: [],
        spice_level: null,
        is_lite_bite: false,
        is_child_friendly: false,
        is_salad: false,
        is_deal: false,
        is_gluten_free: false,
      };

      if (modalMode === 'create') {
        await adminApi.createMenuItem(itemData);
        toast.success('Menu item created successfully');
      } else if (editingItem) {
        await adminApi.updateMenuItem(editingItem.id, itemData);
        toast.success('Menu item updated successfully');
      }

      setShowModal(false);
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to save menu item:', error);
      toast.error(error.response?.data?.detail || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteMenuItem(id);
      toast.success('Menu item deleted successfully');
      setDeleteConfirm(null);
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to delete menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await adminApi.toggleItemAvailability(item.id, !item.is_available);
      toast.success(
        `${item.name} marked as ${!item.is_available ? 'available' : 'out of stock'}`
      );
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to toggle availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleCSVUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const result = await adminApi.uploadMenuCSV(uploadFile, updateExisting);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(`Upload completed with ${result.summary.errors} errors`);
      }

      // Show detailed summary
      const summary = result.summary;
      if (summary.created > 0 || summary.updated > 0) {
        toast.success(
          `Created: ${summary.created}, Updated: ${summary.updated}, Skipped: ${summary.skipped}`,
          { duration: 5000 }
        );
      }

      if (result.errors && result.errors.length > 0) {
        console.error('CSV Upload Errors:', result.errors);
        toast.error(`${result.errors.length} errors occurred. Check console for details.`);
      }

      setShowUploadModal(false);
      setUploadFile(null);
      setUpdateExisting(false);
      fetchMenuItems();
    } catch (error: any) {
      console.error('CSV upload failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await adminApi.downloadCSVTemplate();

      // Create blob and download
      const blob = new Blob([result.template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'menu_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded');
    } catch (error: any) {
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant menu items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add New Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? parseInt(e.target.value) : '');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="category_id-asc">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading menu items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No menu items found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or add a new item</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500 truncate max-w-md">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {item.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              item.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.is_available ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Available
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <X className="w-3 h-3" />
                                Out of Stock
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {deleteConfirm === item.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.category_name}</p>
                      </div>
                      <span className="font-bold text-gray-900 ml-3">{formatPrice(item.price)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.is_available ? 'Available' : 'Out of Stock'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Price and Calories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (£) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergens (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., nuts, dairy, gluten"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Available */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {modalMode === 'create' ? 'Create Item' : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-600" />
                Import Menu from CSV
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUpdateExisting(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-1">Need a template?</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Download our CSV template to see the required format
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {uploadFile ? (
                    <div>
                      <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(uploadFile.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFile(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to select a CSV file</p>
                      <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="update_existing"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="update_existing" className="flex-1">
                  <span className="text-sm font-medium text-gray-900 block">
                    Update existing items
                  </span>
                  <span className="text-xs text-gray-600">
                    If enabled, items with matching names will be updated. Otherwise, duplicates will be skipped.
                  </span>
                </label>
              </div>

              {/* CSV Format Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">CSV Format Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Required:</strong> name, category_name, price</li>
                  <li>• <strong>Optional:</strong> description, calories, allergens, etc.</li>
                  <li>• <strong>Allergens:</strong> Use pipe separator (gluten|dairy)</li>
                  <li>• <strong>Tags:</strong> Use pipe separator (v|vg|gf)</li>
                  <li>• Category names must match existing categories</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUpdateExisting(false);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleCSVUpload}
                disabled={!uploadFile || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
