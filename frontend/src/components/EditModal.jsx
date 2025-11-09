import { useState, useEffect } from 'react';

const EditModal = ({ item, isCreateMode, brands, warehouses, categories, sizes, onClose, onSave }) => {
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

  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [showNewWarehouseInput, setShowNewWarehouseInput] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSizeInput, setShowNewSizeInput] = useState(false);

  // Predefined size options
  const sizeOptions = ['XS(36)', 'S(38)', 'M(40)', 'L(42)', 'XL(44)'];
  
  // Gender options
  const genderOptions = ['male', 'female'];

  useEffect(() => {
    if (item && !isCreateMode) {
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
  }, [item, isCreateMode]);

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

  const handleBrandChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewBrandInput(true);
      setFormData(prev => ({ ...prev, brand: '' }));
    } else {
      setShowNewBrandInput(false);
      setFormData(prev => ({ ...prev, brand: value }));
    }
  };

  const handleWarehouseChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewWarehouseInput(true);
      setFormData(prev => ({ ...prev, warehouse: '' }));
    } else {
      setShowNewWarehouseInput(false);
      setFormData(prev => ({ ...prev, warehouse: value }));
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewSizeInput(true);
      setFormData(prev => ({ ...prev, size: '' }));
    } else {
      setShowNewSizeInput(false);
      setFormData(prev => ({ ...prev, size: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const dataToSave = {
      ...formData,
      mrp: parseFloat(formData.mrp),
      selling_price: parseFloat(formData.selling_price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
      quantity: parseInt(formData.quantity)
    };

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreateMode ? "M12 4v16m8-8H4" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
            </svg>
            <span>{isCreateMode ? 'Add New Inventory Item' : 'Edit Inventory Item'}</span>
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
            {/* Brand - Priority Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              {showNewBrandInput || (brands.length === 0 && isCreateMode) ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name (e.g., Nike, Adidas)"
                    required
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                  />
                  {brands.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewBrandInput(false);
                        setFormData(prev => ({ ...prev, brand: '' }));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Select from existing brands
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={formData.brand}
                    onChange={handleBrandChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Brand</option>
                  </select>
                </div>
              )}
            </div>

            {/* Warehouse - Priority Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              {showNewWarehouseInput || (warehouses.length === 0 && isCreateMode) ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="warehouse"
                    value={formData.warehouse}
                    onChange={handleChange}
                    placeholder="Enter warehouse name (e.g., Main Warehouse, Godown A)"
                    required
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                  />
                  {warehouses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewWarehouseInput(false);
                        setFormData(prev => ({ ...prev, warehouse: '' }));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Select from existing warehouses
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={formData.warehouse}
                    onChange={handleWarehouseChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse} value={warehouse}>{warehouse}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Warehouse</option>
                  </select>
                </div>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                disabled={!isCreateMode}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono disabled:bg-slate-100"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              {showNewCategoryInput ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter new category"
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setFormData(prev => ({ ...prev, category: categories[0] || '' }));
                    }}
                    className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="__new__">+ Add New Category</option>
                </select>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                {genderOptions.map(gender => (
                  <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Size <span className="text-red-500">*</span>
              </label>
              {showNewSizeInput ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="Enter custom size"
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSizeInput(false);
                      setFormData(prev => ({ ...prev, size: '' }));
                    }}
                    className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={formData.size}
                  onChange={handleSizeChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Size</option>
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                  {sizes.filter(s => !sizeOptions.includes(s)).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                  <option value="__new__">+ Custom Size</option>
                </select>
              )}
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

            {/* Design */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Design <span className="text-red-500">*</span>
              </label>
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

            {/* Weight (grams) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (grams)</label>
              <input
                type="text"
                name="fabric_weight"
                value={formData.fabric_specs.weight}
                onChange={handleChange}
                placeholder="e.g., 250g"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* MRP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                MRP (₹) <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
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
              {isCreateMode ? 'Create Item' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
