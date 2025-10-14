import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Eye,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  ChefHat
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';
import { Special, MenuItem, SpecialCreate } from '../../types/admin';

type FilterTab = 'all' | 'active' | 'inactive' | 'expired';

interface CategoryGroup {
  category_id: number;
  category_name: string;
  items: MenuItem[];
}

interface CustomItemForm {
  name: string;
  description: string;
  category: string;
}

interface SelectedItem {
  menu_item_id?: number;
  quantity: number;
  display_order: number;
  is_custom?: boolean;
  custom_item_name?: string;
  custom_item_description?: string;
  custom_item_category?: string;
}

const AdminSpecialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [specials, setSpecials] = useState<Special[]>([]);
  const [filteredSpecials, setFilteredSpecials] = useState<Special[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<SpecialCreate>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    is_active: true,
    start_date: '',
    end_date: '',
    display_order: 0,
    items: [],
  });

  // Item selection state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [customItems, setCustomItems] = useState<SelectedItem[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItemForm, setCustomItemForm] = useState<CustomItemForm>({
    name: '',
    description: '',
    category: 'Mains',
  });

  // Fetch data
  useEffect(() => {
    fetchSpecials();
    fetchMenuItems();
  }, []);

  const fetchSpecials = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSpecials();
      setSpecials(data.specials || []);
    } catch (error) {
      console.error('Failed to fetch specials:', error);
      toast.error('Failed to load specials');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await adminApi.getMenuItems({ page_size: 100 });
      const items = response.items || [];
      setMenuItems(items);

      // Auto-expand all categories on initial load
      const categoryIds = new Set(items.map((item: MenuItem) => item.category_id));
      setExpandedCategories(categoryIds);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  // Filter specials
  useEffect(() => {
    let filtered = specials;
    const today = new Date().toISOString().split('T')[0];

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((s) => s.is_active && (!s.end_date || s.end_date >= today));
        break;
      case 'inactive':
        filtered = filtered.filter((s) => !s.is_active);
        break;
      case 'expired':
        filtered = filtered.filter((s) => s.end_date && s.end_date < today);
        break;
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredSpecials(filtered);
  }, [specials, activeTab, searchQuery]);

  // Group menu items by category
  const categoryGroups: CategoryGroup[] = React.useMemo(() => {
    const groups: Record<number, CategoryGroup> = {};

    menuItems.forEach((item) => {
      if (!groups[item.category_id]) {
        groups[item.category_id] = {
          category_id: item.category_id,
          category_name: item.category_name || 'Other',
          items: [],
        };
      }
      groups[item.category_id].items.push(item);
    });

    // Filter by search
    if (itemSearchQuery.trim()) {
      const filtered: CategoryGroup[] = [];
      Object.values(groups).forEach((group) => {
        const filteredItems = group.items.filter((item) =>
          item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
        );
        if (filteredItems.length > 0) {
          filtered.push({ ...group, items: filteredItems });
        }
      });
      return filtered;
    }

    return Object.values(groups);
  }, [menuItems, itemSearchQuery]);

  // Handle item selection
  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Select all in category
  const selectAllInCategory = (categoryId: number) => {
    const group = categoryGroups.find((g) => g.category_id === categoryId);
    if (!group) return;

    const newSelected = new Set(selectedItems);
    group.items.forEach((item) => newSelected.add(item.id));
    setSelectedItems(newSelected);
  };

  // Clear all in category
  const clearAllInCategory = (categoryId: number) => {
    const group = categoryGroups.find((g) => g.category_id === categoryId);
    if (!group) return;

    const newSelected = new Set(selectedItems);
    group.items.forEach((item) => newSelected.delete(item.id));
    setSelectedItems(newSelected);
  };

  // Add custom item
  const handleAddCustomItem = () => {
    if (!customItemForm.name.trim()) {
      toast.error('Custom item name is required');
      return;
    }

    const newCustomItem: SelectedItem = {
      quantity: 1,
      display_order: customItems.length,
      is_custom: true,
      custom_item_name: customItemForm.name,
      custom_item_description: customItemForm.description,
      custom_item_category: customItemForm.category,
    };

    setCustomItems([...customItems, newCustomItem]);
    setCustomItemForm({ name: '', description: '', category: 'Mains' });
    setShowCustomItemForm(false);
    toast.success('Custom item added');
  };

  // Remove custom item
  const removeCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  // Calculate savings
  const calculateSavings = () => {
    let regularPrice = 0;

    // Add regular menu items
    selectedItems.forEach((itemId) => {
      const menuItem = menuItems.find((mi) => mi.id === itemId);
      if (menuItem) {
        regularPrice += menuItem.price;
      }
    });

    const savings = regularPrice - formData.price;
    return { regular: regularPrice, savings };
  };

  // Get all selected item details
  const getSelectedItemsDetails = () => {
    const items: Array<{ name: string; price: number; isCustom: boolean }> = [];

    // Regular menu items
    selectedItems.forEach((itemId) => {
      const menuItem = menuItems.find((mi) => mi.id === itemId);
      if (menuItem) {
        items.push({ name: menuItem.name, price: menuItem.price, isCustom: false });
      }
    });

    // Custom items
    customItems.forEach((item) => {
      items.push({ name: item.custom_item_name || '', price: 0, isCustom: true });
    });

    return items;
  };

  // Open modal for create/edit
  const openModal = (special?: Special) => {
    if (special) {
      setEditingSpecial(special);
      setFormData({
        name: special.name,
        description: special.description || '',
        price: special.price,
        image_url: special.image_url || '',
        is_active: special.is_active,
        start_date: special.start_date || '',
        end_date: special.end_date || '',
        display_order: special.display_order,
        items: special.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          display_order: item.display_order,
          is_custom: item.is_custom,
          custom_item_name: item.custom_item_name,
          custom_item_description: item.custom_item_description,
          custom_item_category: item.custom_item_category,
        })),
      });

      // Set selected items
      const selected = new Set<number>();
      const custom: SelectedItem[] = [];

      special.items.forEach((item) => {
        if (item.is_custom) {
          custom.push({
            quantity: item.quantity,
            display_order: item.display_order,
            is_custom: true,
            custom_item_name: item.custom_item_name,
            custom_item_description: item.custom_item_description,
            custom_item_category: item.custom_item_category,
          });
        } else if (item.menu_item_id) {
          selected.add(item.menu_item_id);
        }
      });

      setSelectedItems(selected);
      setCustomItems(custom);
    } else {
      setEditingSpecial(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        is_active: true,
        start_date: '',
        end_date: '',
        display_order: 0,
        items: [],
      });
      setSelectedItems(new Set());
      setCustomItems([]);
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingSpecial(null);
    setSelectedItems(new Set());
    setCustomItems([]);
    setShowCustomItemForm(false);
  };

  // Handle input change
  const handleInputChange = (field: keyof SpecialCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save special
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error('Special name is required');
        return;
      }
      if (formData.price <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }
      if (selectedItems.size === 0 && customItems.length === 0) {
        toast.error('Please select at least one menu item or add a custom item');
        return;
      }
      if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
        toast.error('End date must be after start date');
        return;
      }

      // Build items array
      const items: SelectedItem[] = [];

      // Add regular menu items
      let order = 0;
      selectedItems.forEach((itemId) => {
        items.push({
          menu_item_id: itemId,
          quantity: 1,
          display_order: order++,
          is_custom: false,
        });
      });

      // Add custom items
      customItems.forEach((item) => {
        items.push({
          ...item,
          display_order: order++,
        });
      });

      const payload = { ...formData, items };

      if (editingSpecial) {
        await adminApi.updateSpecial(editingSpecial.id!, payload);
        toast.success('Special updated successfully');
      } else {
        await adminApi.createSpecial(payload);
        toast.success('Special created successfully');
      }

      closeModal();
      fetchSpecials();
    } catch (error: any) {
      console.error('Failed to save special:', error);
      toast.error(error.response?.data?.detail || 'Failed to save special');
    }
  };

  // Toggle active status
  const handleToggleActive = async (specialId: number, currentStatus: boolean) => {
    try {
      await adminApi.toggleSpecialActive(specialId, !currentStatus);
      toast.success(`Special ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSpecials();
    } catch (error) {
      console.error('Failed to toggle special:', error);
      toast.error('Failed to update special status');
    }
  };

  // Delete special
  const handleDelete = async (specialId: number) => {
    if (deleteConfirm !== specialId) {
      setDeleteConfirm(specialId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await adminApi.deleteSpecial(specialId);
      toast.success('Special deleted successfully');
      fetchSpecials();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete special:', error);
      toast.error('Failed to delete special');
    }
  };

  // Get status badge
  const getStatusBadge = (special: Special) => {
    const today = new Date().toISOString().split('T')[0];

    if (special.end_date && special.end_date < today) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
    }
    if (special.start_date && special.start_date > today) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Scheduled</span>;
    }
    if (special.is_active) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactive</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading specials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Daily Specials</h1>
                <p className="text-sm text-gray-500">Manage special menu offerings</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Special</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search specials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {(['all', 'active', 'inactive', 'expired'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specials List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredSpecials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No specials found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecials.map((special) => (
              <div key={special.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{special.name}</h3>
                      {getStatusBadge(special)}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={special.is_active}
                        onChange={() => handleToggleActive(special.id, special.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {special.description && (
                    <p className="text-sm text-gray-600 mb-4">{special.description}</p>
                  )}

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-orange-600">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold">${special.price.toFixed(2)}</span>
                    </div>
                    {special.start_date && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{special.start_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      {special.items.length} item{special.items.length !== 1 ? 's' : ''} included
                    </p>
                    <div className="space-y-1">
                      {special.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          {item.is_custom && <Star className="w-3 h-3 text-yellow-500 mr-1 flex-shrink-0" />}
                          <span className="truncate">{item.is_custom ? item.custom_item_name : item.menu_item_name}</span>
                        </div>
                      ))}
                      {special.items.length > 3 && (
                        <p className="text-xs text-gray-400">+{special.items.length - 3} more</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(special)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(special.id)}
                      className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                        deleteConfirm === special.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">{deleteConfirm === special.id ? 'Confirm?' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSpecial ? 'Edit Special' : 'Create New Special'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-160px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 2 Course Lunch Special"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe what's included in this special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Included</h3>

                {/* Selected Items Summary */}
                {(selectedItems.size > 0 || customItems.length > 0) && (
                  <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Selected Items ({selectedItems.size + customItems.length})
                      </p>
                      <button
                        onClick={() => {
                          setSelectedItems(new Set());
                          setCustomItems([]);
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Item Chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(selectedItems).map((itemId) => {
                        const item = menuItems.find((mi) => mi.id === itemId);
                        return item ? (
                          <div
                            key={itemId}
                            className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full text-sm border border-orange-300"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-orange-600">${item.price.toFixed(2)}</span>
                            <button
                              onClick={() => toggleItemSelection(itemId)}
                              className="text-gray-400 hover:text-gray-600 ml-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                      {customItems.map((item, idx) => (
                        <div
                          key={`custom-${idx}`}
                          className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 rounded-full text-sm border border-yellow-300"
                        >
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">{item.custom_item_name}</span>
                          <button
                            onClick={() => removeCustomItem(idx)}
                            className="text-gray-400 hover:text-gray-600 ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Price Summary */}
                    {selectedItems.size > 0 && formData.price > 0 && (
                      <div className="text-sm space-y-1 pt-3 border-t border-orange-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Regular Total:</span>
                          <span className="font-medium">${calculateSavings().regular.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Special Price:</span>
                          <span>${formData.price.toFixed(2)}</span>
                        </div>
                        {calculateSavings().savings > 0 && (
                          <div className="flex justify-between text-green-600 font-semibold">
                            <span>Savings:</span>
                            <span>${calculateSavings().savings.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Item Selection Area */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Select from Menu</h4>

                  {/* Search Items */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Category Groups */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {categoryGroups.map((group) => (
                      <div key={group.category_id} className="border border-gray-200 rounded-lg bg-white">
                        {/* Category Header */}
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(group.category_id)}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedCategories.has(group.category_id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="font-medium text-gray-900">{group.category_name}</span>
                            <span className="text-sm text-gray-500">({group.items.length})</span>
                          </div>
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => selectAllInCategory(group.category_id)}
                              className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => clearAllInCategory(group.category_id)}
                              className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Category Items */}
                        {expandedCategories.has(group.category_id) && (
                          <div className="border-t border-gray-200 p-2 space-y-1">
                            {group.items.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => toggleItemSelection(item.id)}
                                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <div className="flex-1 flex items-center justify-between">
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.name}</span>
                                  <span className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Item Button */}
                  <button
                    onClick={() => setShowCustomItemForm(true)}
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">Add Special-Only Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                {editingSpecial ? 'Update Special' : 'Create Special'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Item Modal */}
      {showCustomItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Special-Only Item</h3>
              <button
                onClick={() => setShowCustomItemForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Chef's Special Risotto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={customItemForm.description}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Wild mushroom risotto with truffle oil..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={customItemForm.category}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Sides">Sides</option>
                </select>
              </div>

              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 text-lg">ℹ</span>
                <p className="text-sm text-blue-800">
                  This item only appears in this special, not on the regular menu.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomItemForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomItem}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialsPage;
