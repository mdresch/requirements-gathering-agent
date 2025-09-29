// Feedback Modal Component
// filepath: admin-interface/src/components/FeedbackModal.tsx

'use client';

import { useState } from 'react';
import { X, Star, AlertTriangle, CheckCircle, FileText, Lightbulb, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  documentType: string;
  documentPath: string;
  documentTitle: string;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
}

interface FeedbackData {
  projectId: string;
  documentType: string;
  documentPath: string;
  feedbackType: 'quality' | 'accuracy' | 'completeness' | 'clarity' | 'compliance' | 'suggestion';
  rating: number;
  title: string;
  description: string;
  suggestedImprovement?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  category: string;
  submittedBy: string;
  submittedByName: string;
}

const feedbackTypes = [
  { value: 'quality', label: 'Quality', icon: Star, description: 'Overall document quality and professionalism' },
  { value: 'accuracy', label: 'Accuracy', icon: Target, description: 'Factual correctness and precision' },
  { value: 'completeness', label: 'Completeness', icon: CheckCircle, description: 'Missing information or sections' },
  { value: 'clarity', label: 'Clarity', icon: FileText, description: 'Readability and understanding' },
  { value: 'compliance', label: 'Compliance', icon: AlertTriangle, description: 'Standards and framework adherence' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, description: 'Ideas for improvement' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' }
];

export default function FeedbackModal({
  isOpen,
  onClose,
  projectId,
  documentType,
  documentPath,
  documentTitle,
  onSubmit
}: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    feedbackType: 'quality' as const,
    rating: 3,
    title: '',
    description: '',
    suggestedImprovement: '',
    priority: 'medium' as const,
    tags: [] as string[],
    category: 'pmbok' // Default category
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData: FeedbackData = {
        projectId,
        documentType,
        documentPath,
        ...formData,
        submittedBy: 'current-user-id', // TODO: Get from auth context
        submittedByName: 'Current User' // TODO: Get from auth context
      };

      await onSubmit(feedbackData);
      
      // Reset form
      setFormData({
        feedbackType: 'quality',
        rating: 3,
        title: '',
        description: '',
        suggestedImprovement: '',
        priority: 'medium',
        tags: [],
        category: 'pmbok'
      });
      
      toast.success('Feedback submitted successfully!');
      onClose();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Submit Feedback</h2>
            <p className="text-sm text-gray-600 mt-1">Document: {documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, feedbackType: type.value as any }))}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.feedbackType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating * (1 = Poor, 5 = Excellent)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating }))}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.rating >= rating
                      ? 'text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 self-center">
                {formData.rating}/5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of your feedback"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm"
              rows={4}
              placeholder="Detailed description of your feedback"
              maxLength={2000}
              required
            />
          </div>

          {/* Suggested Improvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Improvement
            </label>
            <textarea
              value={formData.suggestedImprovement}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestedImprovement: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm"
              rows={3}
              placeholder="How would you improve this document?"
              maxLength={2000}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex space-x-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.priority === priority.value
                      ? priority.color
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
                maxLength={50}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pmbok">PMBOK</option>
              <option value="babok">BABOK</option>
              <option value="dmbok">DMBOK</option>
              <option value="technical">Technical</option>
              <option value="quality">Quality</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}