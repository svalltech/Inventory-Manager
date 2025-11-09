import { useState, useEffect } from 'react';

const EditModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    name: '',
    brand: '',
    warehouse: '',
    category: '',
    gender: '',
    color: '',
    size: '',
    design: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    quantity: '',
    fabric_specs: {
      material: '',
      weight: '',
      composition: ''
    }
  });

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || '',
        sku: item.sku || '',
        name: item.name || '',
        brand: item.brand || '',
        warehouse: item.warehouse || '',
        category: item.category || '',
        gender: item.gender || '',
        color: item.color || '',
        size: item.size || '',
        design: item.design || '',
        mrp: item.mrp || '',
        selling_price: item.selling_price || '',
        cost_price: item.cost_price || '',
        quantity: item.quantity || '',
        fabric_specs: {
          material: item.fabric_specs?.material || '',
          weight: item.fabric_specs?.weight || '',
          composition: item.fabric_specs?.composition || ''
        }
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('fabric_')) {
      const fabricField = name.replace('fabric_', '');
      setFormData(prev => ({
        ...prev,
        fabric_specs: {
          ...prev.fabric_specs,
          [fabricField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Inventory Item</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse</label>
              <input
                type="text"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Design */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Design</label>
              <input
                type="text"
                name="design"
                value={formData.design}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
              <input
                type="text"
                name="fabric_material"
                value={formData.fabric_specs.material}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
