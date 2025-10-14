import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Store,
  Clock,
  LayoutGrid,
  DollarSign,
  CreditCard,
  Bell,
  Users,
  Receipt,
  Link2,
  Sliders,
  Save,
  AlertTriangle,
  ChevronRight,
  Home,
  Download,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/adminApi';
import type {
  AllSettings,
  RestaurantInfoSettings,
  TaxCurrencySettings,
  SettingsSection,
  BusinessHours,
  Holiday,
  Table,
} from '../../types/settings';

const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('restaurant_info');
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // All settings data
  const [restaurantInfo, setRestaurantInfo] = useState<Partial<RestaurantInfoSettings>>({});
  const [taxCurrency, setTaxCurrency] = useState<Partial<TaxCurrencySettings>>({});
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  // Form states for each section
  const [restaurantForm, setRestaurantForm] = useState<Partial<RestaurantInfoSettings>>({});
  const [taxForm, setTaxForm] = useState<Partial<TaxCurrencySettings>>({});

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllSettings();

      setRestaurantInfo(data.restaurant_info);
      setRestaurantForm(data.restaurant_info);

      setTaxCurrency(data.tax_currency);
      setTaxForm(data.tax_currency);

      setBusinessHours(data.business_hours);
      setHolidays(data.holidays);
      setTables(data.tables);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantFormChange = (field: string, value: any) => {
    setRestaurantForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTaxFormChange = (field: string, value: any) => {
    setTaxForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const saveRestaurantInfo = async () => {
    try {
      await adminApi.updateSettings({
        settings: restaurantForm,
        section: 'restaurant_info',
      });
      setRestaurantInfo(restaurantForm);
      setHasUnsavedChanges(false);
      toast.success('Restaurant information updated successfully');
    } catch (error) {
      console.error('Failed to update restaurant info:', error);
      toast.error('Failed to update restaurant information');
    }
  };

  const saveTaxCurrency = async () => {
    try {
      await adminApi.updateSettings({
        settings: taxForm,
        section: 'tax_currency',
      });
      setTaxCurrency(taxForm);
      setHasUnsavedChanges(false);
      toast.success('Tax & currency settings updated successfully');
    } catch (error) {
      console.error('Failed to update tax/currency:', error);
      toast.error('Failed to update settings');
    }
  };

  const toggleTableActive = async (tableId: number, isActive: boolean) => {
    try {
      await adminApi.updateTable(tableId, { is_active: isActive });
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, is_active: isActive } : t))
      );
      toast.success(`Table ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to update table:', error);
      toast.error('Failed to update table');
    }
  };

  const updateBusinessHours = async (id: number, isOpen: boolean, openTime?: string, closeTime?: string) => {
    try {
      await adminApi.updateBusinessHours(id, {
        is_open: isOpen,
        open_time: openTime,
        close_time: closeTime,
      });
      setBusinessHours((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, is_open: isOpen, open_time: openTime || h.open_time, close_time: closeTime || h.close_time }
            : h
        )
      );
      toast.success('Business hours updated');
    } catch (error) {
      console.error('Failed to update business hours:', error);
      toast.error('Failed to update business hours');
    }
  };

  const addHoliday = async () => {
    const name = prompt('Holiday name:');
    const date = prompt('Date (YYYY-MM-DD):');
    if (!name || !date) return;

    try {
      const newHoliday = await adminApi.createHoliday({
        name,
        date,
        is_closed: true,
      });
      setHolidays((prev) => [...prev, newHoliday]);
      toast.success('Holiday added');
    } catch (error) {
      console.error('Failed to add holiday:', error);
      toast.error('Failed to add holiday');
    }
  };

  const deleteHoliday = async (id: number) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      await adminApi.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      toast.success('Holiday deleted');
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  const downloadQRCode = async (tableId: number, tableNumber: number) => {
    try {
      const data = await adminApi.getTableQRCode(tableId);
      window.open(data.qr_code_url, '_blank');
      toast.success(`QR code for Table ${tableNumber} opened`);
    } catch (error) {
      console.error('Failed to get QR code:', error);
      toast.error('Failed to get QR code');
    }
  };

  const sidebarSections = [
    { id: 'restaurant_info', label: 'Restaurant Info', icon: Store },
    { id: 'business_hours', label: 'Business Hours', icon: Clock },
    { id: 'tables', label: 'Tables & Layout', icon: LayoutGrid },
    { id: 'tax_currency', label: 'Tax & Currency', icon: DollarSign },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'receipt', label: 'Receipt Settings', icon: Receipt },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Home className="w-4 h-4" />
                <span
                  onClick={() => navigate('/admin/dashboard')}
                  className="cursor-pointer hover:text-blue-600"
                >
                  Dashboard
                </span>
                <ChevronRight className="w-4 h-4" />
                <span>Settings</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-0">
          <nav className="p-4">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">You have unsaved changes</span>
              </div>
            )}

            {/* Restaurant Info Section - Part 1 */}
            {activeSection === 'restaurant_info' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Restaurant Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.restaurant_name || ''}
                      onChange={(e) => handleRestaurantFormChange('restaurant_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="La Hacienda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Business Name
                    </label>
                    <input
                      type="text"
                      value={restaurantForm.legal_business_name || ''}
                      onChange={(e) => handleRestaurantFormChange('legal_business_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="For invoices"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={restaurantForm.phone || ''}
                        onChange={(e) => handleRestaurantFormChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+44 1234 567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={restaurantForm.email || ''}
                        onChange={(e) => handleRestaurantFormChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="info@restaurant.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={restaurantForm.address || ''}
                      onChange={(e) => handleRestaurantFormChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={restaurantForm.city || ''}
                        onChange={(e) => handleRestaurantFormChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                      <input
                        type="text"
                        value={restaurantForm.postcode || ''}
                        onChange={(e) => handleRestaurantFormChange('postcode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={restaurantForm.country || ''}
                        onChange={(e) => handleRestaurantFormChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={restaurantForm.website || ''}
                      onChange={(e) => handleRestaurantFormChange('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.restaurant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={restaurantForm.description || ''}
                      onChange={(e) => handleRestaurantFormChange('description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      maxLength={500}
                      placeholder="Brief description shown on customer menu"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(restaurantForm.description || '').length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <select
                      value={restaurantForm.cuisine_type || ''}
                      onChange={(e) => handleRestaurantFormChange('cuisine_type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select cuisine type</option>
                      <option value="Mexican">Mexican</option>
                      <option value="Italian">Italian</option>
                      <option value="British">British</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Indian">Indian</option>
                      <option value="Japanese">Japanese</option>
                      <option value="American">American</option>
                      <option value="French">French</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button
                    onClick={saveRestaurantInfo}
                    className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Restaurant Info
                  </button>
                </div>
              </div>
            )}

            {/* Business Hours Section - continuing in next part due to length... */}

            {/* Business Hours Section */}
            {activeSection === 'business_hours' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Business Hours</h2>
                <div className="space-y-4">
                  {businessHours.map((hours) => (
                    <div key={hours.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <span className="font-medium capitalize">{hours.day_of_week}</span>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.is_open}
                          onChange={(e) => updateBusinessHours(hours.id, e.target.checked, hours.open_time || undefined, hours.close_time || undefined)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm">Open</span>
                      </label>
                      {hours.is_open && (
                        <>
                          <input
                            type="time"
                            value={hours.open_time || ''}
                            onChange={(e) => updateBusinessHours(hours.id, hours.is_open, e.target.value, hours.close_time || undefined)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close_time || ''}
                            onChange={(e) => updateBusinessHours(hours.id, hours.is_open, hours.open_time || undefined, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </>
                      )}
                    </div>
                  ))}

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Hours / Holidays</h3>
                    <button
                      onClick={addHoliday}
                      className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Add Holiday Closure
                    </button>
                    <div className="space-y-2">
                      {holidays.map((holiday) => (
                        <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{holiday.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(holiday.date).toLocaleDateString()} -{' '}
                              {holiday.is_closed ? 'Closed' : `${holiday.special_hours_start} to ${holiday.special_hours_end}`}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteHoliday(holiday.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tables Section */}
            {activeSection === 'tables' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tables & Layout</h2>
                <div className="space-y-3">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Table {table.table_number}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={table.is_active}
                            onChange={(e) => toggleTableActive(table.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">Active</span>
                        </label>
                        <span className="text-sm text-gray-500">Seats: {table.capacity || table.seating_capacity || 2}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadQRCode(table.id, table.table_number)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </button>
                        <button
                          onClick={() => downloadQRCode(table.id, table.table_number)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax & Currency Section */}
            {activeSection === 'tax_currency' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tax & Currency Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Settings</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                          <input
                            type="text"
                            value={taxForm.tax_name || ''}
                            onChange={(e) => handleTaxFormChange('tax_name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VAT, GST, Sales Tax"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={taxForm.tax_rate || ''}
                            onChange={(e) => handleTaxFormChange('tax_rate', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT Number</label>
                        <input
                          type="text"
                          value={taxForm.tax_id || ''}
                          onChange={(e) => handleTaxFormChange('tax_id', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="For invoices"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Included in Prices</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={taxForm.tax_included === true}
                              onChange={() => handleTaxFormChange('tax_included', true)}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={taxForm.tax_included === false}
                              onChange={() => handleTaxFormChange('tax_included', false)}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={taxForm.currency || ''}
                          onChange={(e) => handleTaxFormChange('currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="GBP">GBP (£) - Pound Sterling</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="USD">USD ($) - US Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol Position</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={taxForm.currency_position === 'before'}
                              onChange={() => handleTaxFormChange('currency_position', 'before')}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span>Before amount (£10.00)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={taxForm.currency_position === 'after'}
                              onChange={() => handleTaxFormChange('currency_position', 'after')}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span>After amount (10.00£)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={saveTaxCurrency}
                    className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Tax & Currency Settings
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder sections for other tabs */}
            {(activeSection === 'payment' ||
              activeSection === 'notifications' ||
              activeSection === 'users' ||
              activeSection === 'receipt' ||
              activeSection === 'integrations' ||
              activeSection === 'advanced') && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                  {activeSection.replace('_', ' & ')}
                </h2>
                <p className="text-gray-600">This section is coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Button (shown when changes detected) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-gray-700 font-medium">You have unsaved changes</span>
            <button
              onClick={() => {
                if (activeSection === 'restaurant_info') saveRestaurantInfo();
                else if (activeSection === 'tax_currency') saveTaxCurrency();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
