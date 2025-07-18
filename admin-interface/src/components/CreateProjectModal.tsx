import React, { useState } from 'react';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: {
    name: string;
    description: string;
    framework: 'babok' | 'pmbok' | 'multi';
  }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState<'babok' | 'pmbok' | 'multi'>('babok');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, description, framework });
    setName('');
    setDescription('');
    setFramework('babok');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter project name"
              title="Project Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter project description"
              title="Project Description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Framework</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={framework}
              onChange={e => setFramework(e.target.value as 'babok' | 'pmbok' | 'multi')}
              title="Framework"
            >
              <option value="babok">BABOK v3</option>
              <option value="pmbok">PMBOK 7th</option>
              <option value="multi">Multi-Standard</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
