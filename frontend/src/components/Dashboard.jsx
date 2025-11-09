import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import InventoryTable from './InventoryTable';
import EditModal from './EditModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, selectedBrand, selectedWarehouse, searchQuery]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch inventory
      const inventoryRes = await axios.get(`${API}/inventory`, { headers });
      setInventory(inventoryRes.data);

      // Fetch filter options
      const optionsRes = await axios.get(`${API}/inventory/filter-options`, { headers });
      setBrands(optionsRes.data.brands || []);
      setWarehouses(optionsRes.data.warehouses || []);
      
      // Extract unique categories and sizes from inventory data
      const uniqueCategories = [...new Set(inventoryRes.data.map(item => item.category))].filter(Boolean);
      const uniqueSizes = [...new Set(inventoryRes.data.map(item => item.size))].filter(Boolean);
      setCategories(uniqueCategories);
      setSizes(uniqueSizes);

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    if (selectedBrand !== 'ALL') {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }

    if (selectedWarehouse !== 'ALL') {
      filtered = filtered.filter(item => item.warehouse === selectedWarehouse);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          item.category?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query) ||
          item.design?.toLowerCase().includes(query) ||
          item.size?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.warehouse?.toLowerCase().includes(query) ||
          item.color?.toLowerCase().includes(query) ||
          String(item.quantity).includes(query) ||
          String(item.selling_price).includes(query)
        );
      });
    }

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API}/inventory/${updatedItem.id}`,
        updatedItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Item updated successfully!');
      setShowEditModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update item');
    }
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    // Reset warehouse if changing brand
    if (brand !== 'ALL') {
      setSelectedWarehouse('ALL');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading inventory...</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Inventory Dashboard</h1>
                <p className="text-xs text-slate-500">{user?.email} ({user?.role})</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Filters & Search</h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by category, name, SKU, design, size, brand, warehouse..."
                className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="ALL">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Warehouse Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Warehouse</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </select>
            </div>

            {/* Entries Per Page */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Show Entries</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={filteredInventory.length}>ALL ({filteredInventory.length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <InventoryTable
          data={filteredInventory}
          entriesPerPage={entriesPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onEdit={handleEdit}
        />
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          item={editItem}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateItem}
        />
      )}
    </div>
  );
};

export default Dashboard;
