import React from 'react';
import { notFound } from 'next/navigation';
import ProjectDetails from '../../../components/ProjectDetails';
import EnhancedNavbar from '../../../components/EnhancedNavbar';
import { getProjectById } from '../../../lib/api';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { id } = await params;
  
  // Validate ID format before making API call
  if (!id || typeof id !== 'string' || id.length !== 24) {
    return notFound();
  }
  
  const project = await getProjectById(id);
  if (!project) return notFound();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar />
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-open w-4 h-4">
              <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>/</span>
            <span className="font-medium text-gray-900">Projects</span>
            <span>/</span>
            <span className="font-medium text-gray-900">{project.name}</span>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <ProjectDetails project={project} />
      </main>
    </div>
  );
};

export default ProjectPage;
