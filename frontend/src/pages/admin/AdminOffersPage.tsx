import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Gift,
  Calendar,
  Copy,
  Trash2,
  Eye,
  X,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';
import { Offer, OfferCreate } from '../../types/admin';

type FilterTab = 'all' | 'active' | 'scheduled' | 'expired';

const AdminOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<OfferCreate>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_spend: 0,
    applicable_days: [],
    applicable_times_start: '',
    applicable_times_end: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_usage: undefined,
  });

  // Extended form state for new fields
  const [_extendedForm, _setExtendedForm] = useState({  // Prefixed as unused
    internal_description: '',
    customer_description: '',
    promo_code: '',
    display_badge: '',
    discount_percentage: 0,
    max_discount_cap: 0,
    applies_to: 'order',
    limit_per_customer: 0,
    require_promo_code: false,
    first_order_only: false,
    show_on_menu: false,
    is_featured: false,
    auto_apply: true,
    priority: 0,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Fetch offers
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOffers();
      setOffers(data || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // Filter offers
  useEffect(() => {
    let filtered = offers;
    const today = new Date().toISOString().split('T')[0];

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((o) => o.is_active && (!o.end_date || o.end_date >= today));
        break;
      case 'scheduled':
        filtered = filtered.filter((o) => o.start_date && o.start_date > today);
        break;
      case 'expired':
        filtered = filtered.filter((o) => o.end_date && o.end_date < today);
        break;
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter((o) =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOffers(filtered);
  }, [offers, activeTab, searchQuery]);

  // Get offer type badge
  const getOfferTypeBadge = (type: string) => {
    const badges: Record<string, {text: string, color: string}> = {
      percentage: { text: 'Percentage', color: 'bg-blue-100 text-blue-700' },
      fixed: { text: 'Fixed Amount', color: 'bg-green-100 text-green-700' },
      bogo: { text: 'BOGO', color: 'bg-purple-100 text-purple-700' },
      free_item: { text: 'Free Item', color: 'bg-pink-100 text-pink-700' },
    };
    const badge = badges[type] || badges.percentage;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (offer: Offer) => {
    const today = new Date().toISOString().split('T')[0];

    if (offer.end_date && offer.end_date < today) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
    }
    if (offer.start_date && offer.start_date > today) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Scheduled</span>;
    }
    if (offer.is_active) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactive</span>;
  };

  // Get discount display
  const getDiscountDisplay = (offer: Offer) => {
    switch (offer.discount_type) {
      case 'percentage':
        return `${offer.discount_value}% Off`;
      case 'fixed':
        return `£${offer.discount_value} Off`;
      case 'bogo':
        return 'Buy One Get One';
      case 'free_item':
        return 'Free Item';
      default:
        return '';
    }
  };

  // Open modal
  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        name: offer.name,
        description: offer.description || '',
        discount_type: offer.discount_type || 'percentage',
        discount_value: Number(offer.discount_value) || 0,
        minimum_spend: Number(offer.minimum_spend) || 0,
        applicable_days: offer.applicable_days || [],
        applicable_times_start: offer.applicable_times_start || '',
        applicable_times_end: offer.applicable_times_end || '',
        start_date: offer.start_date || '',
        end_date: offer.end_date || '',
        is_active: offer.is_active,
        max_usage: offer.max_usage,
      });
      setSelectedDays(offer.applicable_days || []);
    } else {
      setEditingOffer(null);
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        minimum_spend: 0,
        applicable_days: [],
        applicable_times_start: '',
        applicable_times_end: '',
        start_date: '',
        end_date: '',
        is_active: true,
        max_usage: undefined,
      });
      setSelectedDays([]);
      _setExtendedForm({
        internal_description: '',
        customer_description: '',
        promo_code: '',
        display_badge: '',
        discount_percentage: 0,
        max_discount_cap: 0,
        applies_to: 'order',
        limit_per_customer: 0,
        require_promo_code: false,
        first_order_only: false,
        show_on_menu: false,
        is_featured: false,
        auto_apply: true,
        priority: 0,
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  // Handle input change
  const handleInputChange = (field: keyof OfferCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  // Save offer
  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error('Offer name is required');
        return;
      }
      if (formData.discount_value <= 0) {
        toast.error('Discount value must be greater than 0');
        return;
      }
      if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
        toast.error('End date must be after start date');
        return;
      }

      const payload: Partial<OfferCreate> = {
        ...formData,
        applicable_days: selectedDays.length > 0 ? selectedDays : undefined,
      };

      if (editingOffer) {
        await adminApi.updateOffer(editingOffer.id, payload);
        toast.success('Offer updated successfully');
      } else {
        await adminApi.createOffer(payload as OfferCreate);
        toast.success('Offer created successfully');
      }

      closeModal();
      fetchOffers();
    } catch (error: any) {
      console.error('Failed to save offer:', error);
      toast.error(error.response?.data?.detail || 'Failed to save offer');
    }
  };

  // Toggle active status
  const handleToggleActive = async (offerId: number, currentStatus: boolean) => {
    try {
      await adminApi.toggleOfferActive(offerId, !currentStatus);
      toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchOffers();
    } catch (error) {
      console.error('Failed to toggle offer:', error);
      toast.error('Failed to update offer status');
    }
  };

  // Delete offer
  const handleDelete = async (offerId: number) => {
    if (deleteConfirm !== offerId) {
      setDeleteConfirm(offerId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await adminApi.deleteOffer(offerId);
      toast.success('Offer deleted successfully');
      fetchOffers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  // Duplicate offer
  const handleDuplicate = async (offer: Offer) => {
    try {
      const duplicateData: OfferCreate = {
        name: `${offer.name} (Copy)`,
        description: offer.description,
        discount_type: offer.discount_type || 'percentage',
        discount_value: Number(offer.discount_value) || 0,
        minimum_spend: Number(offer.minimum_spend) || 0,
        applicable_days: offer.applicable_days,
        applicable_times_start: offer.applicable_times_start,
        applicable_times_end: offer.applicable_times_end,
        start_date: offer.start_date,
        end_date: offer.end_date,
        is_active: false,
        max_usage: offer.max_usage,
      };
      await adminApi.createOffer(duplicateData);
      toast.success('Offer duplicated successfully');
      fetchOffers();
    } catch (error) {
      console.error('Failed to duplicate offer:', error);
      toast.error('Failed to duplicate offer');
    }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Offers & Promotions</h1>
                <p className="text-sm text-gray-500">Create and manage promotional campaigns</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Offer</span>
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
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {(['all', 'active', 'scheduled', 'expired'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No offers found</p>
            {!searchQuery && activeTab === 'all' && (
              <button
                onClick={() => openModal()}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Offer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                  offer.is_active ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{offer.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        {getOfferTypeBadge(offer.discount_type)}
                        {getStatusBadge(offer)}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offer.is_active}
                        onChange={() => handleToggleActive(offer.id, offer.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {offer.description && (
                    <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                  )}

                  {/* Discount Details */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-700">{getDiscountDisplay(offer)}</span>
                      {offer.minimum_spend > 0 && (
                        <span className="text-xs text-gray-600">Min £{offer.minimum_spend}</span>
                      )}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Used {offer.usage_count || 0} times</span>
                    </div>
                    {offer.max_usage && (
                      <span className="text-xs text-gray-500">Max: {offer.max_usage}</span>
                    )}
                  </div>

                  {/* Dates */}
                  {(offer.start_date || offer.end_date) && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {offer.start_date || 'Now'} - {offer.end_date || 'Ongoing'}
                      </span>
                    </div>
                  )}

                  {/* Days */}
                  {offer.applicable_days && Array.isArray(offer.applicable_days) && offer.applicable_days.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{(offer.applicable_days as string[]).join(', ')}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(offer)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDuplicate(offer)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                        deleteConfirm === offer.id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-160px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Happy Hour 50% Off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your offer..."
                  />
                </div>
              </div>

              {/* Offer Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Offer Type</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => handleInputChange('discount_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="bogo">Buy X Get Y (BOGO)</option>
                    <option value="free_item">Free Item</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount (£)'}  *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_value || ''}
                      onChange={(e) => handleInputChange('discount_value', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Spend (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minimum_spend || ''}
                      onChange={(e) => handleInputChange('minimum_spend', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Availability</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Available
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day.toLowerCase())}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedDays.includes(day.toLowerCase())
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.applicable_times_start}
                      onChange={(e) => handleInputChange('applicable_times_start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.applicable_times_end}
                      onChange={(e) => handleInputChange('applicable_times_end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Uses (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.max_usage || ''}
                    onChange={(e) => handleInputChange('max_usage', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Offer Details</p>
                  <p>
                    This offer will be {formData.is_active ? 'active' : 'inactive'} and will apply
                    {selectedDays.length > 0 ? ` on ${selectedDays.join(', ')}` : ' every day'}
                    {formData.applicable_times_start && formData.applicable_times_end
                      ? ` from ${formData.applicable_times_start} to ${formData.applicable_times_end}`
                      : ' all day'}.
                  </p>
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersPage;
