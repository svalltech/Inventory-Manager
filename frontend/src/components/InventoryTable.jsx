import { useState, useMemo } from 'react';

const InventoryTable = ({ data, entriesPerPage, currentPage, setCurrentPage, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({
    category: '',
    name: '',
    sku: '',
    brand: '',
    warehouse: '',
    product_type: '',
    design: '',
    size: '',
    quantity: '',
    selling_price: ''
  });

  // Sortable columns
  const sortableColumns = ['product_type', 'category', 'name', 'sku', 'brand', 'warehouse', 'design', 'size', 'quantity', 'selling_price', 'totalValue'];

  // Apply column filters first, then sort
  const filteredAndSortedData = useMemo(() => {
    // First, filter the data based on column filters
    let filtered = [...data];
    
    Object.keys(columnFilters).forEach(key => {
      const filterValue = columnFilters[key].toLowerCase().trim();
      if (filterValue) {
        filtered = filtered.filter(item => {
          const itemValue = item[key]?.toString().toLowerCase() || '';
          return itemValue.includes(filterValue);
        });
      }
    });

    // Then, sort the filtered data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'totalValue') {
          aValue = a.selling_price * a.quantity;
          bValue = b.selling_price * b.quantity;
        } else if (sortConfig.key === 'name') {
          aValue = a.name;
          bValue = b.name;
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
  }, [data, sortConfig, columnFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Calculate totals
  const totals = useMemo(() => {
    const totalCount = filteredAndSortedData.length;
    const totalValue = filteredAndSortedData.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const totalQuantity = filteredAndSortedData.reduce((sum, item) => sum + item.quantity, 0);
    return { totalCount, totalValue, totalQuantity };
  }, [filteredAndSortedData]);

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            {/* Header Row with Sort Icons */}
            <tr>
              {[
                { key: 'product_type', label: 'Product Type' },
                { key: 'category', label: 'Category' },
                { key: 'name', label: 'Product Name' },
                { key: 'sku', label: 'SKU' },
                { key: 'brand', label: 'Brand' },
                { key: 'warehouse', label: 'Warehouse' },
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
                { key: 'sku', placeholder: 'Search SKU...' },
                { key: 'brand', placeholder: 'Search brand...' },
                { key: 'warehouse', placeholder: 'Search warehouse...' },
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
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-6 py-12 text-center text-slate-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => {
                const isLowStock = item.quantity <= (item.low_stock_threshold || 10);
                return (
                  <tr 
                    key={item.id} 
                    className={`transition ${
                      isLowStock 
                        ? 'bg-orange-50 hover:bg-orange-100' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">{item.product_type || 'Clothing'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{item.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.brand}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                        📦 {item.warehouse}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.design}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.size}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className={isLowStock ? 'text-orange-600' : 'text-slate-900'}>
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-200 text-orange-800" title={`Critical level: ${item.low_stock_threshold || 10}`}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                      ₹{Math.round(item.selling_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                      ₹{Math.round(item.selling_price * item.quantity).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition"
                          title="Edit item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Delete item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Totals Footer */}
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr>
              <td colSpan="8" className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                TOTALS:
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900">
                {totals.totalQuantity.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-500">
                -
              </td>
              <td className="px-6 py-4 text-sm font-bold text-blue-600">
                ₹{Math.round(totals.totalValue).toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
            <tr>
              <td colSpan="12" className="px-6 py-3 text-sm text-slate-600 bg-slate-50">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredAndSortedData.length)}</span> of{' '}
                <span className="font-semibold">{filteredAndSortedData.length}</span> entries
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
