import { useState, useMemo } from 'react';

const InventoryTable = ({ data, entriesPerPage, currentPage, setCurrentPage, onEdit }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sortable columns
  const sortableColumns = ['category', 'name', 'sku', 'design', 'size', 'quantity', 'selling_price', 'totalValue'];

  // Sort data
  const sortedData = useMemo(() => {
    let sortableData = [...data];
    
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
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

    return sortableData;
  }, [data, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Calculate totals
  const totals = useMemo(() => {
    const totalCount = sortedData.length;
    const totalValue = sortedData.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const totalQuantity = sortedData.reduce((sum, item) => sum + item.quantity, 0);
    return { totalCount, totalValue, totalQuantity };
  }, [sortedData]);

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
            <tr>
              {[
                { key: 'category', label: 'Category' },
                { key: 'name', label: 'Product Name' },
                { key: 'sku', label: 'SKU' },
                { key: 'design', label: 'Design' },
                { key: 'size', label: 'Size' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'selling_price', label: 'Selling Price' },
                { key: 'totalValue', label: 'Total Value' },
                { key: 'actions', label: 'Actions' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${
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
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-900">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.design}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.size}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                    ₹{item.selling_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                    ₹{(item.selling_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition"
                      title="Edit item"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Totals Footer */}
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr>
              <td colSpan="5" className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                TOTALS:
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900">
                {totals.totalQuantity.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-500">
                -
              </td>
              <td className="px-6 py-4 text-sm font-bold text-blue-600">
                ₹{totals.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td colSpan="8" className="px-6 py-3 text-sm text-slate-600 bg-slate-50">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, sortedData.length)}</span> of{' '}
                <span className="font-semibold">{sortedData.length}</span> entries
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
