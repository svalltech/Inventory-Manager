import { useState, useMemo } from 'react';

const InventoryTable = ({ data, entriesPerPage, currentPage, setCurrentPage, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({
    product_type: '',
    category: '',
    name: '',
    design: '',
    size: '',
    quantity: '',
    selling_price: ''
  });
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Sortable columns
  const sortableColumns = ['product_type', 'category', 'name', 'design', 'size', 'quantity', 'selling_price', 'totalValue'];

  // Group data by product (everything except size, warehouse, selling_price, mrp)
  const groupedData = useMemo(() => {
    const groups = {};
    
    data.forEach(item => {
      // Create a unique key for each product group
      // Include: product_type, category, name, design, color, material, gender
      // Exclude: size, warehouse, selling_price, mrp (these create variants)
      const material = item.fabric_specs?.material || '';
      const color = item.color || '';
      const gender = item.gender || '';
      
      const groupKey = `${item.product_type || 'Clothing'}-${item.category}-${item.name}-${item.design}-${color}-${material}-${gender}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          product_type: item.product_type || 'Clothing',
          category: item.category,
          name: item.name,
          design: item.design,
          color: color,
          material: material,
          gender: gender,
          variants: []
        };
      }
      
      groups[groupKey].variants.push(item);
    });
    
    // Sort variants within each group by size
    Object.values(groups).forEach(group => {
      group.variants.sort((a, b) => {
        const sizeOrder = ['XS(36)', 'S(38)', 'M(40)', 'L(42)', 'XL(44)', '2XL(46)'];
        const aIndex = sizeOrder.indexOf(a.size);
        const bIndex = sizeOrder.indexOf(b.size);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        return a.size.localeCompare(b.size);
      });
    });
    
    return Object.values(groups);
  }, [data]);

  // Apply column filters to groups
  const filteredGroups = useMemo(() => {
    let filtered = [...groupedData];
    
    Object.keys(columnFilters).forEach(key => {
      const filterValue = columnFilters[key].toLowerCase().trim();
      if (filterValue) {
        if (key === 'size' || key === 'quantity' || key === 'selling_price') {
          // For variant-specific fields, filter groups that have matching variants
          filtered = filtered.filter(group => 
            group.variants.some(variant => {
              const itemValue = variant[key]?.toString().toLowerCase() || '';
              return itemValue.includes(filterValue);
            })
          );
        } else {
          // For group-level fields
          filtered = filtered.filter(group => {
            const itemValue = group[key]?.toString().toLowerCase() || '';
            return itemValue.includes(filterValue);
          });
        }
      }
    });

    // Sort groups
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'totalValue') {
          aValue = a.variants.reduce((sum, v) => sum + (v.selling_price * v.quantity), 0);
          bValue = b.variants.reduce((sum, v) => sum + (v.selling_price * v.quantity), 0);
        } else if (sortConfig.key === 'quantity') {
          aValue = a.variants.reduce((sum, v) => sum + v.quantity, 0);
          bValue = b.variants.reduce((sum, v) => sum + v.quantity, 0);
        } else if (sortConfig.key === 'selling_price') {
          aValue = Math.min(...a.variants.map(v => v.selling_price));
          bValue = Math.min(...b.variants.map(v => v.selling_price));
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [groupedData, columnFilters, sortConfig]);

  // Flatten filtered groups for pagination and totals
  const flattenedData = useMemo(() => {
    return filteredGroups.flatMap(group => group.variants);
  }, [filteredGroups]);

  // Pagination
  const totalPages = Math.ceil(flattenedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = flattenedData.slice(startIndex, endIndex);

  // Calculate totals
  const totals = useMemo(() => {
    const totalCount = flattenedData.length;
    const totalValue = flattenedData.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const totalQuantity = flattenedData.reduce((sum, item) => sum + item.quantity, 0);
    return { totalCount, totalValue, totalQuantity };
  }, [flattenedData]);

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSort = (key) => {
    if (!sortableColumns.includes(key)) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (column) => {
    if (!sortableColumns.includes(column)) return null;
    
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            {/* Header Row with Sort Icons */}
            <tr>
              {[
                { key: 'product_type', label: 'Product Type' },
                { key: 'category', label: 'Category' },
                { key: 'name', label: 'Product Name' },
                { key: 'design', label: 'Design' },
                { key: 'size', label: 'Size' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'selling_price', label: 'Selling Price' },
                { key: 'totalValue', label: 'Total Value' },
                { key: 'actions', label: 'Actions' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => key !== 'actions' && handleSort(key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${
                    sortableColumns.includes(key) ? 'cursor-pointer hover:bg-blue-100 transition' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
            </tr>
            {/* Search Row */}
            <tr className="bg-white border-t border-slate-200">
              {[
                { key: 'product_type', placeholder: 'Search type...' },
                { key: 'category', placeholder: 'Search category...' },
                { key: 'name', placeholder: 'Search name...' },
                { key: 'design', placeholder: 'Search design...' },
                { key: 'size', placeholder: 'Search size...' },
                { key: 'quantity', placeholder: 'Search qty...' },
                { key: 'selling_price', placeholder: 'Search price...' },
                { key: 'totalValue', placeholder: '' },
                { key: 'actions', placeholder: '' }
              ].map(({ key, placeholder }) => (
                <th key={key} className="px-6 py-2">
                  {key !== 'totalValue' && key !== 'actions' ? (
                    <input
                      type="text"
                      value={columnFilters[key] || ''}
                      onChange={(e) => handleColumnFilterChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center text-slate-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              filteredGroups.map((group, groupIndex) => {
                const isExpanded = expandedGroups.has(group.key);
                const hasMultipleVariants = group.variants.length > 1;
                
                // Calculate aggregated values
                const totalQuantity = group.variants.reduce((sum, v) => sum + v.quantity, 0);
                const minPrice = Math.min(...group.variants.map(v => v.selling_price));
                const maxPrice = Math.max(...group.variants.map(v => v.selling_price));
                const totalValue = group.variants.reduce((sum, v) => sum + (v.quantity * v.selling_price), 0);
                const hasLowStock = group.variants.some(v => v.quantity <= (v.low_stock_threshold || 10));
                
                // Color scheme for grouped items
                const groupColors = [
                  'bg-blue-50 hover:bg-blue-100',
                  'bg-purple-50 hover:bg-purple-100',
                  'bg-green-50 hover:bg-green-100',
                  'bg-yellow-50 hover:bg-yellow-100',
                  'bg-pink-50 hover:bg-pink-100',
                  'bg-indigo-50 hover:bg-indigo-100'
                ];
                const groupColor = groupColors[groupIndex % groupColors.length];
                
                if (!isExpanded && hasMultipleVariants) {
                  // Collapsed view - show aggregated data
                  return (
                    <tr 
                      key={group.key}
                      className={`transition ${hasLowStock ? 'bg-orange-50 hover:bg-orange-100' : groupColor}`}
                    >
                      <td className="px-3 py-3 text-sm text-slate-600">{group.product_type}</td>
                      <td className="px-3 py-3 text-sm text-slate-900">{group.category}</td>
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">{group.name}</td>
                      <td className="px-3 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          {group.color && (
                            <div className="relative group/color">
                              <div 
                                className="w-5 h-5 rounded border-2 border-slate-300 shadow-sm cursor-help"
                                style={{ backgroundColor: group.color.toLowerCase() }}
                              />
                              <div className="invisible group-hover/color:visible absolute left-0 top-7 z-50 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
                                {group.color}
                              </div>
                            </div>
                          )}
                          <span>{group.design}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-600">
                        <button
                          onClick={() => setExpandedGroups(prev => new Set([...prev, group.key]))}
                          className="flex items-center space-x-1 hover:text-blue-600 transition"
                        >
                          <span className="font-medium">{group.variants[0].size}</span>
                          <span className="text-xs text-slate-500">+{group.variants.length - 1}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center">
                          <span className={`font-semibold ${hasLowStock ? 'text-orange-700' : 'text-slate-900'} w-16 text-left`}>
                            {totalQuantity}
                          </span>
                          {group.variants.length > 1 && (
                            <div className="relative group/tooltip ml-1">
                              <svg className="w-3.5 h-3.5 text-slate-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <div className="invisible group-hover/tooltip:visible absolute left-0 top-6 z-50 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg">
                                <div className="font-semibold mb-1">Warehouses:</div>
                                {group.variants.map((v, i) => (
                                  <div key={i} className="flex justify-between py-0.5">
                                    <span className="text-slate-300">{v.size}:</span>
                                    <span>{v.warehouse}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-900 font-medium">
                        {minPrice === maxPrice 
                          ? `₹${minPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                          : `₹${minPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - ₹${maxPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        }
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-900 font-bold">
                        ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-slate-500">{group.variants.length} items</span>
                      </td>
                    </tr>
                  );
                } else {
                  // Expanded view or single variant - show individual rows
                  return group.variants.map((item, variantIndex) => {
                    const isLowStock = item.quantity <= (item.low_stock_threshold || 10);
                    const isFirstVariant = variantIndex === 0;
                    
                    return (
                      <tr 
                        key={item.id}
                        className={`transition ${hasLowStock ? 'bg-orange-50 hover:bg-orange-100' : groupColor}`}
                      >
                        <td className="px-3 py-3 text-sm text-slate-600">{item.product_type || 'Clothing'}</td>
                        <td className="px-3 py-3 text-sm text-slate-900">{item.category}</td>
                        <td className="px-3 py-3 text-sm font-medium text-slate-900">
                          {item.name}
                          {hasMultipleVariants && isFirstVariant && (
                            <span className="ml-2 text-xs text-slate-500">({group.variants.length} variants)</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600">{item.design}</td>
                        <td className="px-3 py-3 text-sm text-slate-600">
                          {hasMultipleVariants && isFirstVariant ? (
                            <button
                              onClick={() => setExpandedGroups(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(group.key);
                                return newSet;
                              })}
                              className="flex items-center space-x-1 hover:text-blue-600 transition"
                            >
                              <span className="font-medium">{item.size}</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          ) : (
                            <span>{item.size}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <div className="flex items-center">
                            <span className={`font-semibold ${isLowStock ? 'text-orange-700' : 'text-slate-900'} w-16 text-left`}>
                              {item.quantity}
                            </span>
                            <div className="relative group/tooltip ml-1">
                              <svg className="w-3.5 h-3.5 text-slate-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <div className="invisible group-hover/tooltip:visible absolute left-0 top-6 z-50 w-36 p-2 bg-slate-800 text-white text-xs rounded shadow-lg">
                                <div className="font-semibold">Warehouse:</div>
                                <div className="text-slate-100">{item.warehouse}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-900 font-medium">
                          ₹{item.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-900 font-bold">
                          ₹{(item.quantity * item.selling_price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => onEdit(item)}
                              title="Edit item"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(item)}
                              title="Delete item"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                }
              })
            )}
          </tbody>
          {/* Totals Footer */}
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr>
              <td colSpan="5" className="px-4 py-3 text-sm font-bold text-slate-800 text-right">
                TOTALS:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-slate-900">
                {totals.totalQuantity.toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-slate-500">
                -
              </td>
              <td className="px-4 py-3 text-sm font-bold text-blue-600">
                ₹{Math.round(totals.totalValue).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
            <tr>
              <td colSpan="9" className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, flattenedData.length)}</span> of{' '}
                <span className="font-semibold">{flattenedData.length}</span> entries
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              })
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && page - array[index - 1] > 1) {
                  return [
                    <span key={`ellipsis-${page}`} className="px-2 text-slate-400">...</span>,
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ];
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
