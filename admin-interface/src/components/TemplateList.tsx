'use client';

import { Template } from '@/types/template';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import { Edit, Trash2, Eye, Tag, Calendar, FileText, Key, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuditTrail } from '../hooks/useAuditTrail';

interface TemplateListProps {
  templates: Template[];
  loading: boolean;
  onEdit: (template: Template) => void;
  onViewDetails: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  selectedTemplate?: Template | null;
}

export default function TemplateList({
  templates,
  loading,
  onEdit,
  onViewDetails,
  onDelete,
  onPageChange,
  currentPage,
  totalPages,
  totalCount,
  selectedTemplate,
}: TemplateListProps) {
  const auditTrail = useAuditTrail();

  const handleViewDetails = async (template: Template) => {
    // Log template view to audit trail
    try {
      await auditTrail.logTemplateViewed({
        templateId: template.id,
        templateName: template.name,
        templateType: template.templateType
      });
    } catch (error) {
      console.error('Failed to log template view:', error);
    }
    
    // Call the original onViewDetails function
    onViewDetails(template);
  };

  const handleDelete = async (templateId: string, templateName: string, templateType?: string) => {
    // Log template deletion to audit trail
    try {
      await auditTrail.logTemplateDeleted({
        templateId,
        templateName,
        templateType
      });
    } catch (error) {
      console.error('Failed to log template deletion:', error);
    }
    
    // Call the original onDelete function
    onDelete(templateId);
  };
  if (loading) {
    return (
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i} 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/4 animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (templates.length === 0) {
    return (
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-float" />
          </motion.div>
          <motion.h3 
            className="text-xl font-semibold text-gray-900 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            No templates found
          </motion.h3>
          <motion.p 
            className="text-gray-500 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Try adjusting your search filters or create a new template.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8">
        <motion.h2 
          className="text-2xl font-bold gradient-text mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Templates ({templates.length} out of {totalCount})
        </motion.h2>
        
        <div className="space-y-6">
          <AnimatePresence>
            {templates.filter(template => template && template.name).map((template, index) => (
              <motion.div
                key={template.id}
                className={`border rounded-2xl p-6 card-hover shadow-lg transition-all duration-300 ${
                  selectedTemplate && selectedTemplate.id === template.id
                    ? 'border-blue-500 border-2 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-blue-200 shadow-xl'
                    : 'border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50'
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                layout
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <motion.h3 
                        className="text-xl font-semibold text-gray-900 truncate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {template.name}
                      </motion.h3>
                      <motion.span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {template.category}
                      </motion.span>
                      {selectedTemplate && selectedTemplate.id === template.id && (
                        <motion.span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          Selected
                        </motion.span>
                      )}
                    </div>
                    <motion.p 
                      className="text-gray-600 mb-4 text-base leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {truncateText(template.description, 120)}
                    </motion.p>
                    
                    {/* Template Summary Information */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      {/* Template Type */}
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {template.templateType || 'Document Template'}
                        </span>
                      </div>
                      
                      {/* Context Priority */}
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          template.contextPriority === 'critical' ? 'bg-red-500' :
                          template.contextPriority === 'high' ? 'bg-orange-500' :
                          template.contextPriority === 'medium' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="text-sm text-gray-600">
                          {template.contextPriority || 'medium'} priority
                        </span>
                      </div>
                      
                      {/* Version */}
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          v{template.version || '1.0'}
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600">
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Document Key */}
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600 font-mono">
                          {template.documentKey || 'Not set'}
                        </span>
                      </div>

                      {/* Generation Function */}
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-600 font-mono">
                          {template.generationFunction || 'Not set'}
                        </span>
                      </div>
                    </motion.div>
                    
                    {/* Key Fields Preview */}
                    {template.contextRequirements && Array.isArray(template.contextRequirements) && template.contextRequirements.length > 0 && (
                      <motion.div 
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Fields:</span>
                          {template.contextRequirements.slice(0, 4).map((field: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {field}
                            </span>
                          ))}
                          {template.contextRequirements.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                              +{template.contextRequirements.length - 4} more
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Footer with last updated and framework */}
                    <motion.div 
                      className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {formatRelativeTime(template.updatedAt)}</span>
                      </div>
                      {template.metadata?.framework && (
                        <motion.span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          whileHover={{ scale: 1.05 }}
                        >
                          {template.metadata.framework.toUpperCase()}
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                  <motion.div 
                    className="flex items-center space-x-3 ml-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <motion.button
                      onClick={() => handleViewDetails(template)}
                      className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 btn-modern"
                      title="View details"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onEdit(template)}
                      className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 btn-modern"
                      title="Edit template"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(template.id, template.name, template.templateType)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 btn-modern"
                      title="Delete template"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="text-sm text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 btn-modern"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              
              <motion.span 
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                {currentPage}
              </motion.span>
              
              <motion.button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 btn-modern"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
