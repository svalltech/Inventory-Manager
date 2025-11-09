import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExportModal = ({ onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedFields, setSelectedFields] = useState([
    'sku', 'name', 'brand', 'warehouse', 'category', 'gender', 
    'size', 'design', 'color', 'mrp', 'selling_price', 'quantity'
  ]);
  
  // Template management
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isDefaultTemplate, setIsDefaultTemplate] = useState(false);

  const allFields = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'category', label: 'Category' },
    { key: 'gender', label: 'Gender' },
    { key: 'size', label: 'Size' },
    { key: 'design', label: 'Design' },
    { key: 'color', label: 'Color' },
    { key: 'mrp', label: 'MRP' },
    { key: 'selling_price', label: 'Selling Price' },
    { key: 'cost_price', label: 'Cost Price' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'material', label: 'Material' },
    { key: 'weight', label: 'Weight' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Updated Date' }
  ];

  const handleFieldToggle = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleSelectAll = () => {
    setSelectedFields(allFields.map(f => f.key));
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }
    onExport(selectedFormat, selectedFields);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Inventory Data</span>
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

        {/* Content */}
        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedFormat('excel')}
                className={`p-4 border-2 rounded-lg transition ${
                  selectedFormat === 'excel'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Excel</div>
                <div className="text-xs text-slate-500">.xlsx</div>
              </button>
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 border-2 rounded-lg transition ${
                  selectedFormat === 'pdf'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">PDF</div>
                <div className="text-xs text-slate-500">.pdf</div>
              </button>
              <button
                onClick={() => setSelectedFormat('word')}
                className={`p-4 border-2 rounded-lg transition ${
                  selectedFormat === 'word'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold">Word</div>
                <div className="text-xs text-slate-500">.docx</div>
              </button>
            </div>
          </div>

          {/* Field Selection */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Select Fields ({selectedFields.length} selected)
              </label>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {allFields.map(field => (
                  <label key={field.key} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-700">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Export will include data based on currently applied filters (Brand, Warehouse).
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
