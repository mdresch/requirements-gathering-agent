import React from 'react';
import type { Project } from '../types/project';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  if (!project) return <div>No project data available.</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <div className="mb-4 text-gray-600">Status: {project.status}</div>
      <div className="mb-2">{project.description}</div>
      <div className="mb-2 text-sm text-gray-500">Owner: {project.owner || 'N/A'}</div>
      <div className="mb-2 text-sm text-gray-500">Created: {project.createdAt}</div>
      <div className="mb-2 text-sm text-gray-500">Last Updated: {project.updatedAt}</div>
      {/* Add more fields as needed */}
    </div>
  );
};

export default ProjectDetails;
