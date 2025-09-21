// Project Management Component
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\ProjectManager.tsx

'use client';

import { useState, useEffect } from 'react';
import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

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

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading projects...');
        const response = await apiClient.getProjects();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setProjects(response.data);
          console.log('✅ Projects loaded successfully:', response.data.length);
        } else {
          console.error('❌ Projects loading failed:', response.error);
          toast.error(response.error || 'Failed to load projects');
        }
      } catch (error) {
        console.error('❌ Projects loading error:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'babok': return 'bg-purple-100 text-purple-800';
      case 'pmbok': return 'bg-orange-100 text-orange-800';
      case 'multi': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (project.status || 'draft') === statusFilter;
    const matchesFramework = frameworkFilter === 'all' || (project.framework || 'babok') === frameworkFilter;
    
    return matchesSearch && matchesStatus && matchesFramework;
  });


  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleProjectCreate = async (data: { name: string; description: string; framework: 'babok' | 'pmbok' | 'multi' }) => {
    try {
      console.log('🔍 Creating project with data:', data);
      
      const response = await apiClient.createProject(data);
      
      if (response.success) {
        console.log('✅ Project created successfully:', response.data);
        
        // Add the new project to the local state
        setProjects([response.data, ...(projects || [])]);
        setShowCreateModal(false);
        toast.success('Project created successfully');
      } else {
        console.error('❌ Project creation failed:', response.error);
        toast.error(response.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('❌ Project creation error:', error);
      toast.error('Failed to create project');
    }
  };

  const router = useRouter();
  const handleViewProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (projectData: any) => {
    try {
      console.log('🔍 Updating project with data:', projectData);
      
      const response = await apiClient.updateProject(projectData.id, projectData);
      
      if (response.success) {
        console.log('✅ Project updated successfully:', response.data);
        
        // Update the project in the local state
        setProjects((projects || []).map(p => 
          p.id === projectData.id 
            ? { ...p, ...projectData, updatedAt: new Date().toISOString() }
            : p
        ));
        setShowEditModal(false);
        setSelectedProject(null);
        toast.success('Project updated successfully');
      } else {
        console.error('❌ Project update failed:', response.error);
        toast.error(response.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('❌ Project update error:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name || 'this project'}"?`)) {
      try {
        console.log('🔍 Deleting project:', project.id);
        
        const response = await apiClient.deleteProject(project.id);
        
        if (response.success) {
          console.log('✅ Project deleted successfully');
          setProjects((projects || []).filter(p => p.id !== project.id));
          toast.success('Project deleted successfully');
        } else {
          console.error('❌ Project deletion failed:', response.error);
          toast.error(response.error || 'Failed to delete project');
        }
      } catch (error) {
        console.error('❌ Project deletion error:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleGenerateReport = async (project: Project) => {
    try {
      console.log('🔍 Generating report for project:', project.id);
      
      // Simulate report generation
      toast.success(`Generating compliance report for ${project.name || 'Unnamed Project'}...`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success message
      toast.success(`Compliance report generated successfully for ${project.name || 'Unnamed Project'}`);
      
      console.log('✅ Report generation completed');
    } catch (error) {
      console.error('❌ Report generation error:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      <CreateProjectModal
        open={showCreateModal}
        onClose={handleModalClose}
        onCreate={handleProjectCreate}
      />
      
      {selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          project={selectedProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onUpdate={handleUpdateProject}
        />
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage your requirements gathering projects</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by status"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            title="Filter by framework"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Frameworks</option>
            <option value="babok">BABOK v3</option>
            <option value="pmbok">PMBOK 7th</option>
            <option value="multi">Multi-Standard</option>
          </select>

          <div className="flex items-center text-gray-600">
            <Filter className="w-5 h-5 mr-2" />
            <span>{filteredProjects.length} projects</span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name || 'Unnamed Project'}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{project.description || 'No description available'}</p>
                </div>
              </div>

              {/* Status and Framework Badges */}
              <div className="flex space-x-2 mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status || 'draft')}`}>
                  {(project.status || 'draft').charAt(0).toUpperCase() + (project.status || 'draft').slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrameworkColor(project.framework || 'babok')}`}>
                  {(project.framework || 'babok').toUpperCase()}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{project.complianceScore || 0}%</div>
                  <div className="text-xs text-gray-500">Compliance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{project.documents || 0}</div>
                  <div className="text-xs text-gray-500">Documents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{project.stakeholders || 0}</div>
                  <div className="text-xs text-gray-500">Stakeholders</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProject(project)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Project"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditProject(project)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleGenerateReport(project)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Generate Report"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteProject(project)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Last Updated */}
              <div className="mt-3 text-xs text-gray-500">
                Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || frameworkFilter !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first project'}
          </p>
          <button
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Project
          </button>
        </div>
      )}
    </div>
  );
}
