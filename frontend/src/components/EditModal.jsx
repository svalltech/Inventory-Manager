import { useState, useEffect } from 'react';

const EditModal = ({ item, isCreateMode, brands, warehouses, productTypes, categories, sizes, colors, materials, designs, weights, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    warehouse: '',
    brand: '',
    product_type: 'Clothing',
    category: '',
    name: '',
    sku: '',
    design: '',
    color: '',
    size: '',
    fabric_specs: {
      material: '',
      weight: '',
      composition: ''
    },
    gender: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    quantity: '',
    low_stock_threshold: '10'
  });

  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [showNewWarehouseInput, setShowNewWarehouseInput] = useState(false);
  const [showNewProductTypeInput, setShowNewProductTypeInput] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSizeInput, setShowNewSizeInput] = useState(false);
  const [showNewColorInput, setShowNewColorInput] = useState(false);
  const [showNewMaterialInput, setShowNewMaterialInput] = useState(false);
  const [showNewDesignInput, setShowNewDesignInput] = useState(false);
  const [showNewWeightInput, setShowNewWeightInput] = useState(false);

  // Variants modal state
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [variantRows, setVariantRows] = useState([
    { size: '', quantity: '', selling_price: '', mrp: '', cost_price: '', low_stock_threshold: '10' }
  ]);

  // Predefined size options
  const sizeOptions = ['XS(36)', 'S(38)', 'M(40)', 'L(42)', 'XL(44)'];
  
  // Gender options (added Unisex)
  const genderOptions = ['male', 'female', 'unisex'];

  useEffect(() => {
    if (item && !isCreateMode) {
      setFormData({
        id: item.id || '',
        warehouse: item.warehouse || '',
        brand: item.brand || '',
        product_type: item.product_type || 'Clothing',
        category: item.category || '',
        name: item.name || '',
        sku: item.sku || '',
        design: item.design || '',
        color: item.color || '',
        size: item.size || '',
        fabric_specs: {
          material: item.fabric_specs?.material || '',
          weight: item.fabric_specs?.weight || '',
          composition: item.fabric_specs?.composition || ''
        },
        gender: item.gender || '',
        mrp: item.mrp || '',
        selling_price: item.selling_price || '',
        cost_price: item.cost_price || '',
        quantity: item.quantity || '',
        low_stock_threshold: item.low_stock_threshold || '10'
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

  const handleProductTypeChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewProductTypeInput(true);
      setFormData(prev => ({ ...prev, product_type: '' }));
    } else {
      setShowNewProductTypeInput(false);
      setFormData(prev => ({ ...prev, product_type: value }));
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

  const handleColorChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewColorInput(true);
      setFormData(prev => ({ ...prev, color: '' }));
    } else {
      setShowNewColorInput(false);
      setFormData(prev => ({ ...prev, color: value }));
    }
  };

  const handleDesignChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewDesignInput(true);
      setFormData(prev => ({ ...prev, design: '' }));
    } else {
      setShowNewDesignInput(false);
      setFormData(prev => ({ ...prev, design: value }));
    }
  };

  const handleMaterialChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewMaterialInput(true);
      setFormData(prev => ({
        ...prev,
        fabric_specs: { ...prev.fabric_specs, material: '' }
      }));
    } else {
      setShowNewMaterialInput(false);
      setFormData(prev => ({
        ...prev,
        fabric_specs: { ...prev.fabric_specs, material: value }
      }));
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewWeightInput(true);
      setFormData(prev => ({
        ...prev,
        fabric_specs: { ...prev.fabric_specs, weight: '' }
      }));
    } else {
      setShowNewWeightInput(false);
      setFormData(prev => ({
        ...prev,
        fabric_specs: { ...prev.fabric_specs, weight: value }
      }));
    }
  };

  const handleAddVariants = () => {
    // Validate required fields before opening variants modal
    if (!formData.warehouse || !formData.brand || !formData.product_type || !formData.category || 
        !formData.name || !formData.sku || !formData.design || !formData.gender) {
      alert('Please fill in all required fields (Warehouse, Brand, Product Type, Category, Product Name, SKU, Design, Gender) before adding variants.');
      return;
    }
    
    // Initialize first row with current form data
    setVariantRows([{
      size: formData.size,
      quantity: formData.quantity,
      selling_price: formData.selling_price,
      mrp: formData.mrp,
      cost_price: formData.cost_price,
      low_stock_threshold: formData.low_stock_threshold
    }]);
    setShowVariantsModal(true);
  };

  const addVariantRow = () => {
    setVariantRows(prev => [...prev, {
      size: '',
      quantity: formData.quantity,
      selling_price: formData.selling_price,
      mrp: formData.mrp,
      cost_price: formData.cost_price,
      low_stock_threshold: formData.low_stock_threshold
    }]);
  };

  const removeVariantRow = (index) => {
    setVariantRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariantRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
  };

  const handleSaveVariants = () => {
    // Validate all variant rows
    const errors = [];
    const sizes = [];
    
    variantRows.forEach((variant, index) => {
      // Check for empty required fields
      if (!variant.size || !variant.quantity || !variant.selling_price || !variant.mrp) {
        errors.push(`Row ${index + 1}: Please fill in all required fields (Size, Quantity, Selling Price, MRP)`);
      }
      
      // Check for duplicate sizes
      if (variant.size) {
        if (sizes.includes(variant.size)) {
          errors.push(`Row ${index + 1}: Duplicate size "${variant.size}" detected. Each variant must have a unique size.`);
        } else {
          sizes.push(variant.size);
        }
      }
      
      // Validate numeric values
      if (variant.quantity && (isNaN(variant.quantity) || parseInt(variant.quantity) <= 0)) {
        errors.push(`Row ${index + 1}: Quantity must be a positive number`);
      }
      if (variant.selling_price && (isNaN(variant.selling_price) || parseFloat(variant.selling_price) <= 0)) {
        errors.push(`Row ${index + 1}: Selling Price must be a positive number`);
      }
      if (variant.mrp && (isNaN(variant.mrp) || parseFloat(variant.mrp) <= 0)) {
        errors.push(`Row ${index + 1}: MRP must be a positive number`);
      }
    });
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    
    // Create multiple items from variants
    const promises = variantRows.map(variant => {
      const dataToSave = {
        ...formData,
        size: variant.size,
        quantity: parseInt(variant.quantity),
        selling_price: parseFloat(variant.selling_price),
        mrp: parseFloat(variant.mrp),
        cost_price: variant.cost_price ? parseFloat(variant.cost_price) : undefined,
        low_stock_threshold: parseInt(variant.low_stock_threshold) || 10
      };
      return onSave(dataToSave);
    });

    Promise.all(promises).then(() => {
      setShowVariantsModal(false);
      onClose();
    }).catch(error => {
      console.error('Error saving variants:', error);
      alert('Error saving variants: ' + (error.response?.data?.detail || error.message));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const dataToSave = {
      ...formData,
      mrp: parseFloat(formData.mrp),
      selling_price: parseFloat(formData.selling_price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
      quantity: parseInt(formData.quantity),
      low_stock_threshold: parseInt(formData.low_stock_threshold)
    };

    onSave(dataToSave);
  };

  return (
    <>
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
              {/* 1. Warehouse */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                {!isCreateMode ? (
                  <div>
                    <input
                      type="text"
                      name="warehouse"
                      value={formData.warehouse}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Same SKU can exist in different warehouses</p>
                  </div>
                ) : showNewWarehouseInput || (warehouses.length === 0) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="warehouse"
                      value={formData.warehouse}
                      onChange={handleChange}
                      placeholder="Enter warehouse name"
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
                )}
              </div>

              {/* 2. Brand */}
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
                      placeholder="Enter brand name"
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
                )}
              </div>

              {/* 3. Product Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Type <span className="text-red-500">*</span>
                </label>
                {showNewProductTypeInput || (productTypes.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleChange}
                      placeholder="Enter product type (e.g., Shoes, Equipment)"
                      required
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {productTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewProductTypeInput(false);
                          setFormData(prev => ({ ...prev, product_type: 'Clothing' }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing types
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.product_type}
                    onChange={handleProductTypeChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Product Type --</option>
                    <option value="Clothing">Clothing</option>
                    {productTypes.filter(pt => pt !== 'Clothing').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Type</option>
                  </select>
                )}
              </div>

              {/* 4. Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                {showNewCategoryInput || (categories.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter category"
                      required
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setFormData(prev => ({ ...prev, category: '' }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing categories
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Category</option>
                  </select>
                )}
              </div>

              {/* 5. Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Sports T-Shirt"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 6. SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., NIKE-TS-M-BLU-40"
                  required
                  disabled={!isCreateMode}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono disabled:bg-slate-100 disabled:text-slate-600"
                />
                {!isCreateMode && (
                  <p className="text-xs text-slate-500 mt-1">SKU cannot be changed</p>
                )}
              </div>

              {/* 7. Design */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Design <span className="text-red-500">*</span>
                </label>
                {showNewDesignInput || (designs.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="design"
                      value={formData.design}
                      onChange={handleChange}
                      placeholder="Enter design"
                      required
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {designs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewDesignInput(false);
                          setFormData(prev => ({ ...prev, design: '' }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing designs
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.design}
                    onChange={handleDesignChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Design --</option>
                    {designs.map(design => (
                      <option key={design} value={design}>{design}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Design</option>
                  </select>
                )}
              </div>

              {/* 8. Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                {showNewColorInput || (colors.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Enter color"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {colors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewColorInput(false);
                          setFormData(prev => ({ ...prev, color: '' }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing colors
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.color}
                    onChange={handleColorChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Color --</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Color</option>
                  </select>
                )}
              </div>

              {/* 9. Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Size <span className="text-red-500">*</span>
                </label>
                {showNewSizeInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="Enter custom size"
                      required
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewSizeInput(false);
                        setFormData(prev => ({ ...prev, size: '' }));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Select from standard sizes
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.size}
                    onChange={handleSizeChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Size --</option>
                    <optgroup label="Standard Sizes">
                      {sizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </optgroup>
                    {sizes.filter(s => !sizeOptions.includes(s)).length > 0 && (
                      <optgroup label="Other Sizes">
                        {sizes.filter(s => !sizeOptions.includes(s)).map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </optgroup>
                    )}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Enter Custom Size</option>
                  </select>
                )}
              </div>

              {/* 10. Material */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
                {showNewMaterialInput || (materials.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="fabric_material"
                      value={formData.fabric_specs.material}
                      onChange={handleChange}
                      placeholder="Enter material"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {materials.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewMaterialInput(false);
                          setFormData(prev => ({
                            ...prev,
                            fabric_specs: { ...prev.fabric_specs, material: '' }
                          }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing materials
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.fabric_specs.material}
                    onChange={handleMaterialChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Material --</option>
                    {materials.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Material</option>
                  </select>
                )}
              </div>

              {/* 11. Gender */}
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
                  <option value="">-- Select Gender --</option>
                  {genderOptions.map(gender => (
                    <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* 12. Weight (grams) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (grams)</label>
                {showNewWeightInput || (weights.length === 0 && isCreateMode) ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="fabric_weight"
                      value={formData.fabric_specs.weight}
                      onChange={handleChange}
                      placeholder="Enter weight"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                    />
                    {weights.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewWeightInput(false);
                          setFormData(prev => ({
                            ...prev,
                            fabric_specs: { ...prev.fabric_specs, weight: '' }
                          }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ← Select from existing weights
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.fabric_specs.weight}
                    onChange={handleWeightChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Weight --</option>
                    {weights.map(weight => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">➕ Add New Weight</option>
                  </select>
                )}
              </div>

              {/* 13. MRP (₹) */}
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

              {/* 14. Selling Price (₹) */}
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

              {/* 15. Cost Price (₹) */}
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

              {/* 16. Quantity */}
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

              {/* 17. Critical Qty (Low Stock Threshold) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Critical Qty <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Alert when stock falls below this quantity</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-between items-center">
              {isCreateMode && (
                <button
                  type="button"
                  onClick={handleAddVariants}
                  className="px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-300 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Size Variants</span>
                </button>
              )}
              <div className="flex justify-end space-x-3 ml-auto">
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
            </div>
          </form>
        </div>
      </div>

      {/* Variants Modal */}
      {showVariantsModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Size Variants</h2>
              <button
                onClick={() => setShowVariantsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">All fields are pre-filled from the main form. You can edit any field for each size variant.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-300 rounded-lg">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Size *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Quantity *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Selling Price (₹) *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">MRP (₹) *</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Cost Price (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Critical Qty</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantRows.map((row, index) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={row.size}
                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            placeholder="e.g., M(40)"
                            required
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                            required
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.selling_price}
                            onChange={(e) => handleVariantChange(index, 'selling_price', e.target.value)}
                            step="0.01"
                            required
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.mrp}
                            onChange={(e) => handleVariantChange(index, 'mrp', e.target.value)}
                            step="0.01"
                            required
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.cost_price}
                            onChange={(e) => handleVariantChange(index, 'cost_price', e.target.value)}
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.low_stock_threshold}
                            onChange={(e) => handleVariantChange(index, 'low_stock_threshold', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {variantRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariantRow(index)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addVariantRow}
                className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-300 rounded-lg hover:bg-indigo-100 transition flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Another Variant</span>
              </button>

              {/* Save Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVariantsModal(false)}
                  className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveVariants}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition"
                >
                  Save All Variants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
