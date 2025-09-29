'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDeletedTemplates, restoreTemplate } from '@/lib/api';

interface DeletedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  deletedAt: string;
  deletedBy: string;
  reason?: string;
  metadata?: {
    author?: string;
    framework?: string;
    complexity?: string;
    estimatedTime?: string;
  };
}

interface DeletedTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateRestored?: () => void;
}

export default function DeletedTemplatesModal({ 
  isOpen, 
  onClose, 
  onTemplateRestored 
}: DeletedTemplatesModalProps) {
  const [deletedTemplates, setDeletedTemplates] = useState<DeletedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadDeletedTemplates = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = {
        limit: 10,
        offset: (page - 1) * 10
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (daysFilter !== 'all') {
        params.daysSinceDeleted = parseInt(daysFilter);
      }

      console.log('🔄 Loading deleted templates with params:', params);
      const response = await getDeletedTemplates(params);
      
      if (response.success) {
        setDeletedTemplates(response.data?.templates || []);
        setTotalPages(Math.ceil((response.data?.pagination?.total || 0) / 10));
        setTotalItems(response.data?.pagination?.total || 0);
        console.log('✅ Deleted templates loaded:', response.data?.templates?.length);
      } else {
        console.error('❌ Failed to load deleted templates:', response.error);
        toast.error(response.error || 'Failed to load deleted templates');
      }
    } catch (error) {
      console.error('❌ Error loading deleted templates:', error);
      toast.error('Failed to load deleted templates');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, daysFilter]);

  useEffect(() => {
    if (isOpen) {
      loadDeletedTemplates(currentPage);
    }
  }, [isOpen, currentPage, loadDeletedTemplates]);

  const handleRestore = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to restore "${templateName}"?`)) {
      return;
    }

    setRestoring(templateId);
    try {
      console.log(`🔄 Restoring template: ${templateId}`);
      const response = await restoreTemplate(templateId);
      
      if (response.success) {
        toast.success(`Template "${templateName}" restored successfully`);
        // Reload the list
        await loadDeletedTemplates(currentPage);
        // Notify parent component
        onTemplateRestored?.();
      } else {
        console.error('❌ Failed to restore template:', response.error);
        toast.error(response.error || 'Failed to restore template');
      }
    } catch (error) {
      console.error('❌ Error restoring template:', error);
      toast.error('Failed to restore template');
    } finally {
      setRestoring(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadDeletedTemplates(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadDeletedTemplates(1);
  };

  const filteredTemplates = (deletedTemplates || []).filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const deletedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Trash2 className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Soft Deleted Templates</h2>
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {totalItems} deleted
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="strategic-statements">Strategic Statements</option>
              <option value="business-analysis">Business Analysis</option>
              <option value="project-management">Project Management</option>
              <option value="general">General</option>
            </select>

            {/* Days Filter */}
            <select
              value={daysFilter}
              onChange={(e) => {
                setDaysFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading deleted templates...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted templates found</h3>
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' || daysFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No templates have been soft deleted yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template._id || template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {template.category}
                        </span>
                        {template.metadata?.framework && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {template.metadata.framework}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{template.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Deleted {getDaysAgo(template.deletedAt)} days ago</span>
                        </div>
                        <div>
                          <span>By: {template.deletedBy}</span>
                        </div>
                        {template.metadata?.author && (
                          <div>
                            <span>Author: {template.metadata.author}</span>
                          </div>
                        )}
                        {template.reason && (
                          <div>
                            <span>Reason: {template.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRestore(template.id, template.name)}
                        disabled={restoring === template.id}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                      >
                        {restoring === template.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} deleted templates
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Soft deleted templates can be restored at any time. They are not permanently deleted.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
