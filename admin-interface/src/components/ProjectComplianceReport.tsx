import React from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'review' | 'completed' | 'archived';
  framework: 'babok' | 'pmbok' | 'multi';
  complianceScore: number;
  createdAt: string;
  updatedAt: string;
  documents: number;
  stakeholders: number;
}

interface ProjectComplianceReportProps {
  project: Project;
  onClose: () => void;
}

const ProjectComplianceReport: React.FC<ProjectComplianceReportProps> = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          title="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Compliance Report</h2>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{project.name}</h3>
        <div className="mb-4 text-gray-700">
          <p><span className="font-medium">Description:</span> {project.description}</p>
          <p><span className="font-medium">Framework:</span> {project.framework.toUpperCase()}</p>
          <p><span className="font-medium">Status:</span> {project.status.charAt(0).toUpperCase() + project.status.slice(1)}</p>
          <p><span className="font-medium">Created:</span> {project.createdAt}</p>
          <p><span className="font-medium">Last Updated:</span> {project.updatedAt}</p>
        </div>
        <div className="mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2">{project.complianceScore}%</div>
          <div className="text-sm text-gray-500">Compliance Score</div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Documents</span>
            <span>{project.documents}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Stakeholders</span>
            <span>{project.stakeholders}</span>
          </div>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Report generated on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectComplianceReport;
