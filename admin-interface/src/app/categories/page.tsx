'use client';

import { useState, useEffect, useRef } from 'react';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';
import { categoryApiClient } from '@/lib/categoryApi';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Save, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);
  
  // High-quality, applicable icons for categories
  const categoryIcons = [
    // Business & Management
    { icon: '🏢', name: 'Business', category: 'Business & Management' },
    { icon: '📊', name: 'Analytics', category: 'Business & Management' },
    { icon: '📈', name: 'Growth', category: 'Business & Management' },
    { icon: '💰', name: 'Finance', category: 'Business & Management' },
    { icon: '🎯', name: 'Strategy', category: 'Business & Management' },
    { icon: '📋', name: 'Planning', category: 'Business & Management' },
    { icon: '👥', name: 'Team', category: 'Business & Management' },
    { icon: '🤝', name: 'Partnership', category: 'Business & Management' },
    
    // Technology & Development
    { icon: '⚙️', name: 'Technical', category: 'Technology & Development' },
    { icon: '🔧', name: 'Tools', category: 'Technology & Development' },
    { icon: '💻', name: 'Software', category: 'Technology & Development' },
    { icon: '🌐', name: 'Web', category: 'Technology & Development' },
    { icon: '📱', name: 'Mobile', category: 'Technology & Development' },
    { icon: '🔌', name: 'Integration', category: 'Technology & Development' },
    { icon: '⚡', name: 'Performance', category: 'Technology & Development' },
    { icon: '🛠️', name: 'Development', category: 'Technology & Development' },
    
    // Security & Compliance
    { icon: '🔒', name: 'Security', category: 'Security & Compliance' },
    { icon: '🛡️', name: 'Protection', category: 'Security & Compliance' },
    { icon: '🔐', name: 'Privacy', category: 'Security & Compliance' },
    { icon: '✅', name: 'Compliance', category: 'Security & Compliance' },
    { icon: '📜', name: 'Standards', category: 'Security & Compliance' },
    { icon: '🔍', name: 'Audit', category: 'Security & Compliance' },
    { icon: '⚖️', name: 'Legal', category: 'Security & Compliance' },
    { icon: '📋', name: 'Regulation', category: 'Security & Compliance' },
    
    // User Experience & Design
    { icon: '👤', name: 'User', category: 'User Experience & Design' },
    { icon: '🎨', name: 'Design', category: 'User Experience & Design' },
    { icon: '✨', name: 'Experience', category: 'User Experience & Design' },
    { icon: '🎭', name: 'Interface', category: 'User Experience & Design' },
    { icon: '🌈', name: 'Branding', category: 'User Experience & Design' },
    { icon: '📐', name: 'Layout', category: 'User Experience & Design' },
    { icon: '🖼️', name: 'Visual', category: 'User Experience & Design' },
    { icon: '🎪', name: 'Creative', category: 'User Experience & Design' },
    
    // Data & Analytics
    { icon: '📊', name: 'Data', category: 'Data & Analytics' },
    { icon: '📈', name: 'Metrics', category: 'Data & Analytics' },
    { icon: '📉', name: 'Reports', category: 'Data & Analytics' },
    { icon: '🗄️', name: 'Database', category: 'Data & Analytics' },
    { icon: '🔢', name: 'Statistics', category: 'Data & Analytics' },
    { icon: '📊', name: 'Analytics', category: 'Data & Analytics' },
    { icon: '💡', name: 'Insights', category: 'Data & Analytics' },
    { icon: '🎯', name: 'KPIs', category: 'Data & Analytics' },
    
    // Communication & Documentation
    { icon: '📝', name: 'Documentation', category: 'Communication & Documentation' },
    { icon: '📄', name: 'Documents', category: 'Communication & Documentation' },
    { icon: '📚', name: 'Knowledge', category: 'Communication & Documentation' },
    { icon: '📖', name: 'Manual', category: 'Communication & Documentation' },
    { icon: '📃', name: 'Reports', category: 'Communication & Documentation' },
    { icon: '📋', name: 'Checklist', category: 'Communication & Documentation' },
    { icon: '📝', name: 'Notes', category: 'Communication & Documentation' },
    { icon: '📄', name: 'Specification', category: 'Communication & Documentation' },
    
    // Process & Workflow
    { icon: '🔄', name: 'Process', category: 'Process & Workflow' },
    { icon: '⚡', name: 'Workflow', category: 'Process & Workflow' },
    { icon: '🎯', name: 'Goals', category: 'Process & Workflow' },
    { icon: '✅', name: 'Tasks', category: 'Process & Workflow' },
    { icon: '⏰', name: 'Timeline', category: 'Process & Workflow' },
    { icon: '🚀', name: 'Delivery', category: 'Process & Workflow' },
    { icon: '📂', name: 'Project', category: 'Process & Workflow' },
    { icon: '📊', name: 'Progress', category: 'Process & Workflow' },
    
    // Quality & Testing
    { icon: '🔍', name: 'Quality', category: 'Quality & Testing' },
    { icon: '🧪', name: 'Testing', category: 'Quality & Testing' },
    { icon: '✅', name: 'Validation', category: 'Quality & Testing' },
    { icon: '🔬', name: 'Analysis', category: 'Quality & Testing' },
    { icon: '📊', name: 'Metrics', category: 'Quality & Testing' },
    { icon: '🎯', name: 'Standards', category: 'Quality & Testing' },
    { icon: '👁️', name: 'Review', category: 'Quality & Testing' },
    { icon: '👍', name: 'Approval', category: 'Quality & Testing' },
    
    // Risk & Issues
    { icon: '⚠️', name: 'Risk', category: 'Risk & Issues' },
    { icon: '🚨', name: 'Alert', category: 'Risk & Issues' },
    { icon: '🔴', name: 'Critical', category: 'Risk & Issues' },
    { icon: '🟡', name: 'Warning', category: 'Risk & Issues' },
    { icon: '🟢', name: 'Safe', category: 'Risk & Issues' },
    { icon: '📊', name: 'Assessment', category: 'Risk & Issues' },
    { icon: '👁️', name: 'Monitoring', category: 'Risk & Issues' },
    { icon: '🛠️', name: 'Mitigation', category: 'Risk & Issues' },
    
    // General & Miscellaneous
    { icon: '📁', name: 'Folder', category: 'General & Miscellaneous' },
    { icon: '🏷️', name: 'Tag', category: 'General & Miscellaneous' },
    { icon: '⭐', name: 'Important', category: 'General & Miscellaneous' },
    { icon: '🎉', name: 'Celebration', category: 'General & Miscellaneous' },
    { icon: '💡', name: 'Idea', category: 'General & Miscellaneous' },
    { icon: '🔔', name: 'Notification', category: 'General & Miscellaneous' },
    { icon: '📌', name: 'Pin', category: 'General & Miscellaneous' },
    { icon: '🔗', name: 'Link', category: 'General & Miscellaneous' }
  ];

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    isActive: true
  });

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryApiClient.getCategories(
          { search: searchTerm || undefined },
          { page: 1, limit: 100, sort: 'name', order: 'asc' }
        );
        setCategories(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [searchTerm]);

  // Handle click outside to close icon dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setShowIconDropdown(false);
      }
    };

    if (showIconDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconDropdown]);

  // Group icons by category
  const groupedIcons = categoryIcons.reduce((acc, iconItem) => {
    if (!acc[iconItem.category]) {
      acc[iconItem.category] = [];
    }
    acc[iconItem.category].push(iconItem);
    return acc;
  }, {} as Record<string, typeof categoryIcons>);

  // Handle icon selection
  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
    setShowIconDropdown(false);
  };

  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApiClient.getCategories(
        { search: searchTerm || undefined },
        { page: 1, limit: 100, sort: 'name', order: 'asc' }
      );
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateCategory = async () => {
    try {
      setError(null);
      const response = await categoryApiClient.createCategory(formData);
      setCategories(prev => [...prev, response.data]);
      setShowCreateForm(false);
      setShowIconDropdown(false);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '📁',
        isActive: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      setError(null);
      const response = await categoryApiClient.updateCategory(editingCategory._id, formData);
      setCategories(prev => prev.map(cat => 
        cat._id === editingCategory._id ? response.data : cat
      ));
      setEditingCategory(null);
      setShowIconDropdown(false);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '📁',
        isActive: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setError(null);
      await categoryApiClient.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      setError(null);
      const response = await categoryApiClient.updateCategory(category._id, {
        isActive: !category.isActive
      });
      setCategories(prev => prev.map(cat => 
        cat._id === category._id ? response.data : cat
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color || '#3B82F6',
      icon: category.icon || '📁',
      isActive: category.isActive
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setShowIconDropdown(false);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '📁',
      isActive: true
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage document categories for template organization
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={refreshCategories}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingCategory) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="relative" ref={iconDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowIconDropdown(!showIconDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{formData.icon}</span>
                      <span className="text-gray-500 text-sm">
                        {categoryIcons.find(i => i.icon === formData.icon)?.name || 'Select Icon'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showIconDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showIconDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 mt-1 w-full max-h-96 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden"
                    >
                      <div className="max-h-96 overflow-y-auto">
                        {Object.entries(groupedIcons).map(([category, icons]) => (
                          <div key={category}>
                            <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">
                              {category}
                            </div>
                            <div className="grid grid-cols-8 gap-1 p-2">
                              {icons.map((iconItem, index) => (
                                <button
                                  key={`${iconItem.icon}-${index}`}
                                  type="button"
                                  onClick={() => handleIconSelect(iconItem.icon)}
                                  className={`p-2 rounded-md hover:bg-blue-50 hover:border-blue-200 border-2 transition-colors ${
                                    formData.icon === iconItem.icon
                                      ? 'bg-blue-100 border-blue-300'
                                      : 'bg-white border-transparent'
                                  }`}
                                  title={iconItem.name}
                                >
                                  <span className="text-lg block">{iconItem.icon}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                onClick={editingCategory ? cancelEdit : () => {
                  setShowCreateForm(false);
                  setShowIconDropdown(false);
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Categories List */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium mr-3"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.isSystem && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                System
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!category.isSystem && (
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
