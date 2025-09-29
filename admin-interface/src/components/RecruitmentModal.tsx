'use client';

import { useState } from 'react';
import { X, Plus, Trash2, UserCheck } from 'lucide-react';
import type { Stakeholder, RecruitStakeholderData } from '../types/stakeholder';

interface RecruitmentModalProps {
  stakeholder: Stakeholder;
  onSubmit: (data: RecruitStakeholderData) => void;
  onCancel: () => void;
}

export default function RecruitmentModal({ stakeholder, onSubmit, onCancel }: RecruitmentModalProps) {
  const [formData, setFormData] = useState<RecruitStakeholderData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    department: '',
    powerLevel: 3,
    engagementLevel: 3,
    requirements: [''],
    concerns: [''],
    expectations: [''],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.powerLevel < 1 || formData.powerLevel > 5) {
      newErrors.powerLevel = 'Power level must be between 1 and 5';
    }

    if (formData.engagementLevel < 1 || formData.engagementLevel > 5) {
      newErrors.engagementLevel = 'Engagement level must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up empty array items
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      concerns: formData.concerns.filter(concern => concern.trim() !== ''),
      expectations: formData.expectations.filter(exp => exp.trim() !== ''),
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      notes: formData.notes || undefined
    };

    onSubmit(cleanedData);
  };

  const addArrayItem = (field: 'requirements' | 'concerns' | 'expectations') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'requirements' | 'concerns' | 'expectations', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'requirements' | 'concerns' | 'expectations', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recruit Stakeholder</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role Information Display */}
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Role Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Role:</span>
              <span className="ml-2 font-medium">{formatRole(stakeholder.role)}</span>
            </div>
            <div>
              <span className="text-gray-600">Priority:</span>
              <span className="ml-2 font-medium capitalize">{stakeholder.recruitmentPriority}</span>
            </div>
            <div>
              <span className="text-gray-600">Influence:</span>
              <span className="ml-2 font-medium capitalize">{stakeholder.influence}</span>
            </div>
            <div>
              <span className="text-gray-600">Interest:</span>
              <span className="ml-2 font-medium capitalize">{stakeholder.interest}</span>
            </div>
          </div>
          
          {stakeholder.roleExperience && (
            <div className="mt-3">
              <span className="text-gray-600 text-sm">Experience Required:</span>
              <p className="text-sm text-gray-800 mt-1">{stakeholder.roleExperience}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name..."
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter job title..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address..."
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter department..."
            />
          </div>

          {/* Power and Engagement Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Power Level (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.powerLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, powerLevel: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.powerLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.powerLevel && <p className="text-red-500 text-sm mt-1">{errors.powerLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engagement Level (1-5) *
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.engagementLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, engagementLevel: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.engagementLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.engagementLevel && <p className="text-red-500 text-sm mt-1">{errors.engagementLevel}</p>}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a requirement..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Requirement
              </button>
            </div>
          </div>

          {/* Concerns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concerns
            </label>
            <div className="space-y-2">
              {formData.concerns.map((concern, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={concern}
                    onChange={(e) => updateArrayItem('concerns', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a concern..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('concerns', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('concerns')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Concern
              </button>
            </div>
          </div>

          {/* Expectations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expectations
            </label>
            <div className="space-y-2">
              {formData.expectations.map((exp, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={exp}
                    onChange={(e) => updateArrayItem('expectations', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter an expectation..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('expectations', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('expectations')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Expectation
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about this stakeholder..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Recruit Stakeholder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
