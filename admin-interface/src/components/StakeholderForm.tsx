'use client';

import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building, Star, AlertTriangle, Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { Stakeholder, CreateStakeholderData } from '../types/stakeholder';

interface StakeholderFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  stakeholder?: Stakeholder | null;
  onSave: (stakeholder: CreateStakeholderData) => void;
}

export default function StakeholderForm({ 
  isOpen, 
  onClose, 
  projectId, 
  stakeholder, 
  onSave 
}: StakeholderFormProps) {
  const [formData, setFormData] = useState<CreateStakeholderData>({
    name: '',
    title: '',
    role: 'stakeholder',
    email: '',
    phone: '',
    department: '',
    influence: 'medium',
    interest: 'medium',
    powerLevel: 3,
    engagementLevel: 3,
    communicationPreference: 'email',
    requirements: [''],
    concerns: [''],
    expectations: [''],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stakeholder) {
      const { id, isActive, createdAt, updatedAt, ...stakeholderData } = stakeholder;
      setFormData(stakeholderData);
    } else {
      setFormData({
        name: '',
        title: '',
        role: 'stakeholder',
        email: '',
        phone: '',
        department: '',
        influence: 'medium',
        interest: 'medium',
        powerLevel: 3,
        engagementLevel: 3,
        communicationPreference: 'email',
        requirements: [''],
        concerns: [''],
        expectations: [''],
        notes: ''
      });
    }
  }, [stakeholder]);

  const handleInputChange = (field: keyof CreateStakeholderData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'requirements' | 'concerns' | 'expectations', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error('Name and title are required');
      return;
    }

    setIsLoading(true);
    try {
      // Filter out empty array items
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        concerns: formData.concerns.filter(concern => concern.trim() !== ''),
        expectations: formData.expectations.filter(expectation => expectation.trim() !== '')
      };

      let response;
      if (stakeholder?.id) {
        // Update existing stakeholder
        response = await apiClient.updateStakeholder(stakeholder.id, cleanedData);
      } else {
        // Create new stakeholder
        response = await apiClient.createStakeholder(projectId, cleanedData);
      }

      if (response.success) {
        toast.success(stakeholder?.id ? 'Stakeholder updated successfully' : 'Stakeholder created successfully');
        onSave(cleanedData);
        onClose();
      } else {
        toast.error(response.error || 'Failed to save stakeholder');
      }
    } catch (error) {
      console.error('Error saving stakeholder:', error);
      toast.error('Failed to save stakeholder');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_manager': return <UserCheck className="w-4 h-4" />;
      case 'sponsor': return <Star className="w-4 h-4" />;
      case 'team_member': return <Users className="w-4 h-4" />;
      case 'end_user': return <UserX className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getRoleIcon(formData.role)}
            <h3 className="text-lg font-semibold text-gray-900">
              {stakeholder?.id ? 'Edit Stakeholder' : 'Add New Stakeholder'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="project_manager">Project Manager</option>
                <option value="sponsor">Sponsor</option>
                <option value="team_member">Team Member</option>
                <option value="end_user">End User</option>
                <option value="stakeholder">Stakeholder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Influence Level
              </label>
              <select
                value={formData.influence}
                onChange={(e) => handleInputChange('influence', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Level
              </label>
              <select
                value={formData.interest}
                onChange={(e) => handleInputChange('interest', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Preference
              </label>
              <select
                value={formData.communicationPreference}
                onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="meeting">Meeting</option>
                <option value="portal">Portal</option>
              </select>
            </div>
          </div>

          {/* Power and Engagement Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Power Level (1-5): {formData.powerLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.powerLevel}
                onChange={(e) => handleInputChange('powerLevel', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engagement Level (1-5): {formData.engagementLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.engagementLevel}
                onChange={(e) => handleInputChange('engagementLevel', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter requirement"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Requirement
            </button>
          </div>

          {/* Concerns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concerns
            </label>
            {formData.concerns.map((concern, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={concern}
                  onChange={(e) => handleArrayChange('concerns', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter concern"
                />
                {formData.concerns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('concerns', index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('concerns')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Concern
            </button>
          </div>

          {/* Expectations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expectations
            </label>
            {formData.expectations.map((expectation, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={expectation}
                  onChange={(e) => handleArrayChange('expectations', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expectation"
                />
                {formData.expectations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('expectations', index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('expectations')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Expectation
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes about this stakeholder"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{stakeholder?.id ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
