import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductHierarchy = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [hierarchy, setHierarchy] = useState({});
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newProductName, setNewProductName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API}/master-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductTypes(response.data.product_types || []);
      setHierarchy(response.data.product_hierarchy || {});
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleAddCategory = async () => {
    if (!selectedProductType || !newCategory.trim()) {
      toast.error('Please select product type and enter category name');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API}/master-data/hierarchy/category`,
        { product_type: selectedProductType, category: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Category added successfully');
      setNewCategory('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add category');
    }
  };

  const handleAddProductName = async () => {
    if (!selectedProductType || !selectedCategory || !newProductName.trim()) {
      toast.error('Please select product type, category and enter product name');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API}/master-data/hierarchy/product-name`,
        {
          product_type: selectedProductType,
          category: selectedCategory,
          product_name: newProductName.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Product name added successfully');
      setNewProductName('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add product name');
    }
  };

  const handleDeleteCategory = async (productType, category) => {
    if (!window.confirm(`Delete category "${category}"? This will also delete all product names under it.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/master-data/hierarchy/category`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { product_type: productType, category }
      });
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteProductName = async (productType, category, productName) => {
    if (!window.confirm(`Delete product "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/master-data/hierarchy/product_name`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { product_type: productType, category, product_name: productName }
      });
      toast.success('Product name deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product name');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Product Hierarchy:</strong> Product Type → Category → Product Name
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example: Clothing → Trackpants → Mesh Trackpant
        </p>
      </div>

      {/* Add Category Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Add Category</h3>
        <div className="flex space-x-3">
          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product Type</option>
            {productTypes.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Add Product Name Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Add Product Name</h3>
        <div className="flex space-x-3">
          <select
            value={selectedProductType}
            onChange={(e) => {
              setSelectedProductType(e.target.value);
              setSelectedCategory('');
            }}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product Type</option>
            {productTypes.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={!selectedProductType}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          >
            <option value="">Select Category</option>
            {selectedProductType && hierarchy[selectedProductType] &&
              Object.keys(hierarchy[selectedProductType]).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
          </select>
          <input
            type="text"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="Enter product name"
            disabled={!selectedCategory}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
          <button
            onClick={handleAddProductName}
            disabled={!selectedCategory}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-slate-300"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Hierarchy Tree Display */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Product Hierarchy Tree</h3>
        {Object.keys(hierarchy).length === 0 ? (
          <p className="text-slate-500 text-center py-8">No hierarchy data yet. Add categories and products above.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(hierarchy).map(([productType, categories]) => (
              <div key={productType} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📦</span>
                  <h4 className="font-bold text-lg text-slate-800">{productType}</h4>
                </div>
                <div className="ml-8 space-y-3">
                  {Object.entries(categories).map(([category, products]) => (
                    <div key={category} className="border-l-2 border-blue-300 pl-4">
                      <div className="flex items-center justify-between mb-2 bg-blue-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">📂</span>
                          <span className="font-semibold text-slate-700">{category}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(productType, category)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="ml-8 space-y-1">
                        {products.length === 0 ? (
                          <p className="text-xs text-slate-400">No products yet</p>
                        ) : (
                          products.map(product => (
                            <div key={product} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">📄</span>
                                <span className="text-sm text-slate-600">{product}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteProductName(productType, category, product)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHierarchy;
