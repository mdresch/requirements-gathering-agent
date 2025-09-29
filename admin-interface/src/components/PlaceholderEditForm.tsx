'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, User, Target, FileText } from 'lucide-react';
import { Stakeholder } from '@/types/stakeholder';

interface PlaceholderEditFormProps {
  stakeholder: Stakeholder;
  onSave: (updatedData: Partial<Stakeholder>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const PlaceholderEditForm: React.FC<PlaceholderEditFormProps> = ({
  stakeholder,
  onSave,
  onCancel,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    title: stakeholder.title || '',
    role: stakeholder.role || 'stakeholder',
    recruitmentStatus: stakeholder.recruitmentStatus || 'identified',
    recruitmentPriority: stakeholder.recruitmentPriority || 'medium',
    roleRequirements: stakeholder.roleRequirements || [''],
    roleResponsibilities: stakeholder.roleResponsibilities || [''],
    roleSkills: stakeholder.roleSkills || [''],
    roleExperience: stakeholder.roleExperience || '',
    recruitmentNotes: stakeholder.recruitmentNotes || '',
    recruitmentDeadline: stakeholder.recruitmentDeadline || '',
    influence: stakeholder.influence || 'medium',
    interest: stakeholder.interest || 'medium'
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && stakeholder) {
      setFormData({
        title: stakeholder.title || '',
        role: stakeholder.role || 'stakeholder',
        recruitmentStatus: stakeholder.recruitmentStatus || 'identified',
        recruitmentPriority: stakeholder.recruitmentPriority || 'medium',
        roleRequirements: stakeholder.roleRequirements || [''],
        roleResponsibilities: stakeholder.roleResponsibilities || [''],
        roleSkills: stakeholder.roleSkills || [''],
        roleExperience: stakeholder.roleExperience || '',
        recruitmentNotes: stakeholder.recruitmentNotes || '',
        recruitmentDeadline: stakeholder.recruitmentDeadline || '',
        influence: stakeholder.influence || 'medium',
        interest: stakeholder.interest || 'medium'
      });
    }
  }, [isOpen, stakeholder]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field]?.map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev as any)[field], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Job title is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.recruitmentStatus) {
      newErrors.recruitmentStatus = 'Recruitment status is required';
    }

    if (!formData.recruitmentPriority) {
      newErrors.recruitmentPriority = 'Recruitment priority is required';
    }

    // Validate that at least one requirement exists and is not empty
    const validRequirements = formData.roleRequirements.filter(req => req.trim());
    if (validRequirements.length === 0) {
      newErrors.roleRequirements = 'At least one role requirement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        roleRequirements: formData.roleRequirements.filter(req => req.trim()),
        roleResponsibilities: formData.roleResponsibilities.filter(resp => resp.trim()),
        roleSkills: formData.roleSkills.filter(skill => skill.trim()),
        recruitmentDeadline: formData.recruitmentDeadline || undefined,
        recruitmentNotes: formData.recruitmentNotes || undefined
      };

      await onSave(cleanedData);
    } catch (error) {
      console.error('Error saving placeholder:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruited': return 'text-green-600 bg-green-50 border-green-200';
      case 'contacted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'identified': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'declined': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Role Placeholder
              </h2>
              <p className="text-sm text-gray-600">
                {formData.title || formatRole(formData.role)} • {stakeholder.name || 'Unnamed Placeholder'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Lead Developer, Senior Project Manager, Product Owner"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              The specific job title or position name for this role placeholder
            </p>
          </div>

          {/* Role and Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="project_manager">Project Manager</option>
                <option value="sponsor">Sponsor</option>
                <option value="team_member">Team Member</option>
                <option value="end_user">End User</option>
                <option value="stakeholder">Stakeholder</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruitment Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.recruitmentStatus}
                onChange={(e) => handleInputChange('recruitmentStatus', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.recruitmentStatus ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="identified">Identified</option>
                <option value="contacted">Contacted</option>
                <option value="recruited">Recruited</option>
                <option value="declined">Declined</option>
              </select>
              {errors.recruitmentStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.recruitmentStatus}</p>
              )}
            </div>
          </div>

          {/* Priority and Deadline Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruitment Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.recruitmentPriority}
                onChange={(e) => handleInputChange('recruitmentPriority', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.recruitmentPriority ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.recruitmentPriority && (
                <p className="mt-1 text-sm text-red-600">{errors.recruitmentPriority}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruitment Deadline
              </label>
              <input
                type="date"
                value={formData.recruitmentDeadline}
                onChange={(e) => handleInputChange('recruitmentDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Influence and Interest Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Influence Level
              </label>
              <select
                value={formData.influence}
                onChange={(e) => handleInputChange('influence', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Role Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Requirements <span className="text-red-500">*</span>
            </label>
            {formData.roleRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayChange('roleRequirements', index, e.target.value)}
                  placeholder={`Requirement ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.roleRequirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleRequirements', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('roleRequirements')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>+ Add Requirement</span>
            </button>
            {errors.roleRequirements && (
              <p className="mt-1 text-sm text-red-600">{errors.roleRequirements}</p>
            )}
          </div>

          {/* Role Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Responsibilities
            </label>
            {formData.roleResponsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => handleArrayChange('roleResponsibilities', index, e.target.value)}
                  placeholder={`Responsibility ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.roleResponsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleResponsibilities', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('roleResponsibilities')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>+ Add Responsibility</span>
            </button>
          </div>

          {/* Role Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            {formData.roleSkills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange('roleSkills', index, e.target.value)}
                  placeholder={`Skill ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.roleSkills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleSkills', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('roleSkills')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>+ Add Skill</span>
            </button>
          </div>

          {/* Role Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Experience
            </label>
            <textarea
              value={formData.roleExperience}
              onChange={(e) => handleInputChange('roleExperience', e.target.value)}
              placeholder="Describe the required experience level and background..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Recruitment Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recruitment Notes
            </label>
            <textarea
              value={formData.recruitmentNotes}
              onChange={(e) => handleInputChange('recruitmentNotes', e.target.value)}
              placeholder="Add any notes about the recruitment process..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceholderEditForm;
