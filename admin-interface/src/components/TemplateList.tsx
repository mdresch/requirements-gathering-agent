'use client';

import { Template } from '@/types/template';
import { formatRelativeTime, truncateText } from '@/lib/utils';
import { Edit, Trash2, Eye, Tag, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateListProps {
  templates: Template[];
  loading: boolean;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

export default function TemplateList({
  templates,
  loading,
  onEdit,
  onDelete,
  onPageChange,
  currentPage,
  totalPages,
}: TemplateListProps) {
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
          Templates ({templates.length})
        </motion.h2>
        
        <div className="space-y-6">
          <AnimatePresence>
            {templates.filter(template => template && template.name).map((template, index) => (
              <motion.div
                key={template.id}
                className="border border-gray-200/50 rounded-2xl p-6 card-hover bg-gradient-to-r from-white to-gray-50/50 shadow-lg"
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
                    </div>
                    <motion.p 
                      className="text-gray-600 mb-4 text-lg leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {truncateText(template.description, 150)}
                    </motion.p>
                    {/* Debug: Display all available fields from Wix */}
                    <div className="bg-gray-50 rounded p-3 mb-2 text-xs text-gray-700">
                      <strong>All Fields:</strong>
                      <ul>
                        {Object.entries(template).map(([key, value]) => (
                          <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}</li>
                        ))}
                      </ul>
                    </div>
                    {/* ...existing meta and tags rendering... */}
                    <motion.div 
                      className="flex items-center space-x-6 text-sm text-gray-500"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatRelativeTime(template.updatedAt)}</span>
                      </div>
                      {Array.isArray(template.tags) && template.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4" />
                          <span>{template.tags.slice(0, 3).join(', ')}</span>
                          {template.tags.length > 3 && (
                            <span className="text-gray-400">+{template.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      {template.metadata?.framework && (
                        <motion.span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          {template.metadata.framework}
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
                      onClick={() => onEdit(template)}
                      className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 btn-modern"
                      title="Edit template"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(template.id)}
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
