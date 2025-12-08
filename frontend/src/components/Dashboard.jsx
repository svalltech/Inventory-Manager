import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import InventoryTable from './InventoryTable';
import EditModal from './EditModal';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ user, onLogout, onNavigateToSettings }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [weights, setWeights] = useState([]);
  const [productHierarchy, setProductHierarchy] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  // Quick Add Quantity Modal
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddItem, setQuickAddItem] = useState(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState('');
  
  // Import/Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, selectedBrand, selectedWarehouse]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch inventory
      const inventoryRes = await axios.get(`${API}/inventory`, { headers });
      setInventory(inventoryRes.data);

      // Fetch master data from new endpoint
      const masterDataRes = await axios.get(`${API}/master-data`, { headers });
      console.log('=== DASHBOARD: Fetched master data ===');
      console.log('Product Hierarchy from API:', masterDataRes.data.product_hierarchy);
      
      setBrands(masterDataRes.data.brands || []);
      setWarehouses(masterDataRes.data.warehouses || []);
      setProductTypes(masterDataRes.data.product_types || []);
      setCategories(masterDataRes.data.categories || []);
      setSizes(masterDataRes.data.sizes || []);
      setColors(masterDataRes.data.colors || []);
      setMaterials(masterDataRes.data.materials || []);
      setDesigns(masterDataRes.data.designs || []);
      setWeights(masterDataRes.data.weights || []);
      
      const hierarchy = masterDataRes.data.product_hierarchy || {};
      console.log('=== DASHBOARD: Setting product hierarchy ===');
      console.log('Hierarchy to set:', hierarchy);
      console.log('Hierarchy keys:', Object.keys(hierarchy));
      setProductHierarchy(hierarchy);

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

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setIsCreateMode(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setIsCreateMode(true);
    setShowModal(true);
  };

  const handleSaveItem = async (itemData) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // If itemData has no ID or ID is undefined, create new item
      // This handles both create mode and variant creation from edit mode
      if (!itemData.id || isCreateMode) {
        // Create new item
        await axios.post(`${API}/inventory`, itemData, { headers });
        toast.success('Item created successfully!');
      } else {
        // Update existing item (only when ID exists and not in create mode)
        await axios.put(`${API}/inventory/${itemData.id}`, itemData, { headers });
        toast.success('Item updated successfully!');
      }
      
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${!itemData.id || isCreateMode ? 'create' : 'update'} item`);
    }
  };

  const handleDelete = async (item) => {
    // Confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this item?\n\n` +
      `SKU: ${item.sku}\n` +
      `Name: ${item.name}\n` +
      `Brand: ${item.brand}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/inventory/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Item "${item.name}" deleted successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const handleQuickAdd = (item) => {
    setQuickAddItem(item);
    setQuickAddQuantity('');
    setShowQuickAddModal(true);
  };

  const handleQuickAddSubmit = async () => {
    const addQty = parseInt(quickAddQuantity);
    
    if (isNaN(addQty) || addQty <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const newQuantity = quickAddItem.quantity + addQty;
      
      await axios.put(
        `${API}/inventory/${quickAddItem.id}`,
        { ...quickAddItem, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Added ${addQty} units. New quantity: ${newQuantity}`);
      setShowQuickAddModal(false);
      setQuickAddItem(null);
      setQuickAddQuantity('');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update quantity');
    }
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    // Reset warehouse if changing brand
    if (brand !== 'ALL') {
      setSelectedWarehouse('ALL');
    }
  };

  const handleExport = async (format, selectedFields) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API}/inventory/export`,
        {
          format: format,
          fields: selectedFields,
          filters: {
            ...(selectedBrand !== 'ALL' && { brand: selectedBrand }),
            ...(selectedWarehouse !== 'ALL' && { warehouse: selectedWarehouse })
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'docx';
      link.setAttribute('download', `inventory_export_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully!');
      setShowExportModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Export failed');
    }
  };

  const handleImport = async (file) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API}/inventory/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const { inserted, updated, failed, errors, total_rows } = response.data;

      // Show detailed results
      if (failed > 0) {
        // Show error details
        const errorMessages = errors.slice(0, 5).map(err => 
          `Row ${err.row}: ${err.error}`
        ).join('\n');
        
        const moreErrors = errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : '';
        
        toast.error(
          `Import partially completed!\n✅ Inserted: ${inserted}, Updated: ${updated}\n❌ Failed: ${failed} out of ${total_rows}\n\nFirst errors:\n${errorMessages}${moreErrors}`,
          { duration: 10000 }
        );
      } else {
        toast.success(
          `Import successful! 🎉\n✅ Inserted: ${inserted}\n✅ Updated: ${updated}\n📊 Total: ${total_rows} rows processed`,
          { duration: 5000 }
        );
      }
      
      setShowImportModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.detail || 'Import failed. Please check the file format and try again.');
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
            <div className="flex items-center space-x-3">
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import</span>
                  </button>
                  
                  <button
                    onClick={handleAddNew}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition flex items-center space-x-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Inventory</span>
                  </button>
                </>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Filters</h2>
          
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
          onDelete={handleDelete}
          onQuickAdd={handleQuickAdd}
        />
      </main>

      {/* Item Modal (Create/Edit) */}
      {showModal && (() => {
        console.log('=== DASHBOARD: Rendering EditModal ===');
        console.log('Passing productHierarchy:', productHierarchy);
        console.log('Hierarchy keys:', Object.keys(productHierarchy || {}));
        return (
          <EditModal
            item={editItem}
            isCreateMode={isCreateMode}
            brands={brands}
            warehouses={warehouses}
            productTypes={productTypes}
            categories={categories}
            sizes={sizes}
            colors={colors}
            materials={materials}
            designs={designs}
            weights={weights}
            productHierarchy={productHierarchy}
            onClose={() => setShowModal(false)}
            onSave={handleSaveItem}
          />
        );
      })()}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}

      {/* Quick Add Quantity Modal */}
      {showQuickAddModal && quickAddItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Inventory</span>
              </h2>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">Product:</span> {quickAddItem.name}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">Size:</span> {quickAddItem.size} | 
                  <span className="font-semibold"> Color:</span> {quickAddItem.color}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">Current Quantity:</span> 
                  <span className="text-lg font-bold text-slate-900 ml-2">{quickAddItem.quantity}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quickAddQuantity}
                  onChange={(e) => setQuickAddQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuickAddSubmit();
                    }
                  }}
                />
              </div>

              {quickAddQuantity && parseInt(quickAddQuantity) > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700">
                    New quantity will be: 
                    <span className="text-xl font-bold text-green-800 ml-2">
                      {quickAddItem.quantity + parseInt(quickAddQuantity)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAddSubmit}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Add Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Settings Button - Bottom Left */}
      {user?.role === 'admin' && (
        <button
          onClick={onNavigateToSettings}
          className="fixed bottom-6 left-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center space-x-2 z-50"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Settings</span>
        </button>
      )}
    </div>
  );
};

export default Dashboard;
