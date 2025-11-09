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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API}/export-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data);
      
      // Auto-load default template if exists
      const defaultTemplate = response.data.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
        setSelectedFields(defaultTemplate.fields);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) {
      return;
    }

    // Load custom template
    const customTemplate = templates.find(t => t.id === templateId);
    if (customTemplate) {
      setSelectedFields(customTemplate.fields);
    }
  };

  const handleFieldToggle = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
    setSelectedTemplate(''); // Clear template selection when manually changing fields
  };

  const handleSelectAll = () => {
    setSelectedFields(allFields.map(f => f.key));
    setSelectedTemplate('');
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
    setSelectedTemplate('');
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API}/export-templates`,
        {
          name: newTemplateName,
          fields: selectedFields,
          is_default: isDefaultTemplate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Template saved successfully!');
      setNewTemplateName('');
      setIsDefaultTemplate(false);
      setShowSaveTemplate(false);
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/export-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Template deleted successfully!');
      fetchTemplates();
      if (selectedTemplate === templateId) {
        setSelectedTemplate('');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete template');
    }
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
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
          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Saved Template (Optional)
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">-- Select a Template --</option>
                {templates.length > 0 ? (
                  templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} {template.is_default ? '(Default)' : ''}
                    </option>
                  ))
                ) : (
                  <option disabled>No saved templates</option>
                )}
              </select>
              <button
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 hover:bg-green-100 rounded-lg transition flex items-center space-x-1"
                title="Save current selection as template"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save</span>
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate)}
                  className="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-300 hover:bg-red-100 rounded-lg transition flex items-center space-x-1"
                  title="Delete template"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Save Template Form */}
          {showSaveTemplate && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <h3 className="text-sm font-semibold text-green-800">Save Current Selection as Template</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Monthly Stock Report, Full Inventory Export"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <label className="flex items-center space-x-2 text-sm text-green-800 cursor-pointer hover:bg-green-100 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={isDefaultTemplate}
                    onChange={(e) => setIsDefaultTemplate(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <span>Set as my default template (auto-loads on open)</span>
                </label>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleSaveTemplate}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition shadow-md"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveTemplate(false);
                      setNewTemplateName('');
                      setIsDefaultTemplate(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 hover:bg-green-50 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Export Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Export includes data based on currently applied filters (Brand, Warehouse)</li>
                  <li>Save frequently used field combinations as templates for quick reuse</li>
                  <li>Your default template will auto-load when opening export modal</li>
                </ul>
              </div>
            </div>
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
