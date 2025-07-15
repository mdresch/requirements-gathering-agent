import React from 'react';
import { notFound } from 'next/navigation';
import ProjectDetails from '../../../components/ProjectDetails';
import { getProjectById } from '../../../lib/api';

interface ProjectPageProps {
  params: { id: string };
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const project = await getProjectById(params.id);
  if (!project) return notFound();
  return <ProjectDetails project={project} />;
};

export default ProjectPage;
