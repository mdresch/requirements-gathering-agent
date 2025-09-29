'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CreateRolePlaceholderData } from '../types/stakeholder';

interface RolePlaceholderFormProps {
  projectId: string;
  onSubmit: (data: CreateRolePlaceholderData) => void;
  onCancel: () => void;
}

export default function RolePlaceholderForm({ projectId, onSubmit, onCancel }: RolePlaceholderFormProps) {
  const [formData, setFormData] = useState<CreateRolePlaceholderData & { title: string }>({
    title: '',
    role: 'stakeholder',
    recruitmentPriority: 'medium',
    roleRequirements: [''],
    roleResponsibilities: [''],
    roleSkills: [''],
    roleExperience: '',
    influence: 'medium',
    interest: 'medium',
    recruitmentDeadline: '',
    recruitmentNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Job title is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.recruitmentPriority) {
      newErrors.recruitmentPriority = 'Recruitment priority is required';
    }

    if (!formData.roleExperience.trim()) {
      newErrors.roleExperience = 'Role experience is required';
    }

    if (!formData.influence) {
      newErrors.influence = 'Influence level is required';
    }

    if (!formData.interest) {
      newErrors.interest = 'Interest level is required';
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
      roleRequirements: formData.roleRequirements.filter(req => req.trim() !== ''),
      roleResponsibilities: formData.roleResponsibilities.filter(resp => resp.trim() !== ''),
      roleSkills: formData.roleSkills.filter(skill => skill.trim() !== ''),
      recruitmentDeadline: formData.recruitmentDeadline || undefined,
      recruitmentNotes: formData.recruitmentNotes || undefined
    };

    onSubmit(cleanedData);
  };

  const addArrayItem = (field: 'roleRequirements' | 'roleResponsibilities' | 'roleSkills') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'roleRequirements' | 'roleResponsibilities' | 'roleSkills', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'roleRequirements' | 'roleResponsibilities' | 'roleSkills', index: number, value: string) => {
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
          <h2 className="text-xl font-semibold text-gray-900">Create Role Placeholder</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
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
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Recruitment Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recruitment Priority *
            </label>
            <select
              value={formData.recruitmentPriority}
              onChange={(e) => setFormData(prev => ({ ...prev, recruitmentPriority: e.target.value as any }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.recruitmentPriority ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
            {errors.recruitmentPriority && <p className="text-red-500 text-sm mt-1">{errors.recruitmentPriority}</p>}
          </div>

          {/* Influence and Interest */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Influence Level *
              </label>
              <select
                value={formData.influence}
                onChange={(e) => setFormData(prev => ({ ...prev, influence: e.target.value as any }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.influence ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.influence && <p className="text-red-500 text-sm mt-1">{errors.influence}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Level *
              </label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value as any }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.interest ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.interest && <p className="text-red-500 text-sm mt-1">{errors.interest}</p>}
            </div>
          </div>

          {/* Role Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Experience *
            </label>
            <textarea
              value={formData.roleExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, roleExperience: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.roleExperience ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the experience level and background required for this role..."
            />
            {errors.roleExperience && <p className="text-red-500 text-sm mt-1">{errors.roleExperience}</p>}
          </div>

          {/* Role Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Requirements
            </label>
            <div className="space-y-2">
              {formData.roleRequirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayItem('roleRequirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a requirement..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleRequirements', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('roleRequirements')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Requirement
              </button>
            </div>
          </div>

          {/* Role Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Responsibilities
            </label>
            <div className="space-y-2">
              {formData.roleResponsibilities.map((resp, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => updateArrayItem('roleResponsibilities', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a responsibility..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleResponsibilities', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('roleResponsibilities')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Responsibility
              </button>
            </div>
          </div>

          {/* Role Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <div className="space-y-2">
              {formData.roleSkills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayItem('roleSkills', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a skill..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('roleSkills', index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('roleSkills')}
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
          </div>

          {/* Recruitment Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recruitment Deadline
            </label>
            <input
              type="date"
              value={formData.recruitmentDeadline}
              onChange={(e) => setFormData(prev => ({ ...prev, recruitmentDeadline: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, recruitmentNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about recruitment for this role..."
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Role Placeholder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
