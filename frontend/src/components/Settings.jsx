import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('brands');
  const [masterData, setMasterData] = useState({
    brands: [],
    warehouses: [],
    product_types: [],
    categories: [],
    product_names: [],
    designs: [],
    colors: [],
    sizes: [],
    materials: [],
    weights: []
  });
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const tabs = [
    { key: 'brands', label: 'Brands', icon: '🏷️' },
    { key: 'warehouses', label: 'Warehouses', icon: '🏭' },
    { key: 'product_types', label: 'Product Types', icon: '📦' },
    { key: 'categories', label: 'Categories', icon: '📂' },
    { key: 'product_names', label: 'Product Names', icon: '🏷️' },
    { key: 'designs', label: 'Designs', icon: '🎨' },
    { key: 'colors', label: 'Colors', icon: '🌈' },
    { key: 'sizes', label: 'Sizes', icon: '📏' },
    { key: 'materials', label: 'Materials', icon: '🧵' },
    { key: 'weights', label: 'Weights', icon: '⚖️' }
  ];

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API}/master-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasterData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load master data');
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API}/master-data/${activeTab}`,
        { value: newValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added successfully');
      setNewValue('');
      fetchMasterData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add');
    }
  };

  const handleDelete = async (value) => {
    if (!window.confirm(`Are you sure you want to delete "${value}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/master-data/${activeTab}/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deleted successfully');
      fetchMasterData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleUpdate = async (oldValue, newValueEdit) => {
    if (!newValueEdit.trim()) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API}/master-data/${activeTab}/${encodeURIComponent(oldValue)}`,
        { new_value: newValueEdit.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Updated successfully');
      setEditingItem(null);
      fetchMasterData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update');
    }
  };

  const currentTabData = masterData[activeTab] || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Master Data Settings</h1>
                <p className="text-xs text-slate-500">Manage preset values for inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {user?.email} • <span className="font-semibold capitalize">{user?.role}</span>
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex">
            {/* Sidebar Tabs */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
              <div className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                      activeTab === tab.key
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {tabs.find(t => t.key === activeTab)?.label}
                </h2>
                <p className="text-sm text-slate-600">
                  Manage {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} master data
                </p>
              </div>

              {/* Add New Form */}
              <div className="mb-6 flex space-x-3">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder={`Add new ${tabs.find(t => t.key === activeTab)?.label.toLowerCase().slice(0, -1)}`}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add</span>
                </button>
              </div>

              {/* Data List */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                {currentTabData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium">No data yet</p>
                    <p className="text-sm">Add your first item above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentTabData.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between hover:shadow-md transition"
                      >
                        {editingItem === item ? (
                          <input
                            type="text"
                            defaultValue={item}
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdate(item, e.target.value);
                              }
                            }}
                            onBlur={(e) => handleUpdate(item, e.target.value)}
                            className="flex-1 px-3 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-slate-800 font-medium">{item}</span>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
