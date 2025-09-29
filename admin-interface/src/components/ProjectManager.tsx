// Project Management Component
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\ProjectManager.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';
import ProjectReportModal from './ProjectReportModal';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText, BarChart3, RefreshCw } from 'lucide-react';
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
  const [showReportModal, setShowReportModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(9);
  
  // Ref to track if this is the initial mount
  const isInitialMount = useRef(true);
  // Ref to prevent multiple simultaneous API calls
  const isLoadingRef = useRef(false);

  // Load projects function - memoized to prevent infinite loops
  const loadProjects = useCallback(async (page: number = currentPage) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('🔄 API call already in progress, skipping...');
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('🔄 Loading projects...', { page, itemsPerPage, statusFilter, frameworkFilter, searchTerm });
      
      const params = {
        page,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(frameworkFilter !== 'all' && { framework: frameworkFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await apiClient.getProjects(params);
      
      console.log('📊 API Response:', response);
      console.log('📊 Pagination data:', response.data);
      
      if (response.success && response.data) {
        // Handle both array response and paginated response structures
        const projectsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.projects || response.data.data || [];
        
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
          
          // Update pagination info if available
          if (response.data && typeof response.data === 'object' && response.data.pagination) {
            // Pagination data is in response.data.pagination
            console.log('📊 Setting pagination from response.data.pagination:', {
              totalPages: response.data.pagination.totalPages,
              total: response.data.pagination.total,
              page: response.data.pagination.page
            });
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.total || projectsData.length);
            setCurrentPage(response.data.pagination.page || page);
          } else if (response.data && typeof response.data === 'object' && response.data.totalPages) {
            // Fallback to response.data (direct pagination properties)
            console.log('📊 Setting pagination from response.data:', {
              totalPages: response.data.totalPages,
              total: response.data.total,
              page: response.data.page
            });
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.total || projectsData.length);
            setCurrentPage(response.data.page || page);
          } else if (response.pagination && typeof response.pagination === 'object') {
            // Fallback to response.pagination
            console.log('📊 Setting pagination from response.pagination:', response.pagination);
            setTotalPages(response.pagination.totalPages || 1);
            setTotalItems(response.pagination.totalItems || projectsData.length);
            setCurrentPage(response.pagination.currentPage || page);
          } else {
            // Fallback pagination calculation
            console.log('📊 Using fallback pagination calculation');
            setTotalPages(1);
            setTotalItems(projectsData.length);
            setCurrentPage(page);
          }
          
          toast.success(`Loaded ${projectsData.length} projects`);
        } else {
          console.error('❌ Projects data is not an array:', projectsData);
          toast.error('Invalid projects data format');
        }
      } else {
        console.error('❌ Projects loading failed:', response.error || 'Unknown error');
        toast.error(response.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('❌ Projects loading error:', error);
      toast.error(`Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, statusFilter, frameworkFilter, searchTerm]);

  // Refresh projects handler
  const handleRefreshProjects = () => {
    loadProjects();
  };

  // Load projects from API on component mount and when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      // Initial mount - just load projects
      isInitialMount.current = false;
      loadProjects(1);
    } else {
      // Filters changed - reset to page 1 and load
      setCurrentPage(1);
      loadProjects(1);
    }
  }, [searchTerm, statusFilter, frameworkFilter]);

  // Load projects when page changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      loadProjects(currentPage);
    }
  }, [currentPage]);

  // Debug pagination state
  useEffect(() => {
    console.log('📊 Pagination state updated:', { totalPages, currentPage, totalItems, loading });
  }, [totalPages, currentPage, totalItems, loading]);

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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleProjectCreate = async (data: { name: string; description: string; framework: 'babok' | 'pmbok' | 'multi' }) => {
    try {
      
      const response = await apiClient.createProject(data);
      
      if (response.success) {
        
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
      
      const response = await apiClient.updateProject(projectData.id, projectData);
      
      if (response.success) {
        
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
        
        const response = await apiClient.deleteProject(project.id);
        
        if (response.success) {
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

  const handleGenerateReport = (project: Project) => {
    setSelectedProject(project);
    setShowReportModal(true);
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

      {selectedProject && (
        <ProjectReportModal
          isOpen={showReportModal}
          project={selectedProject}
          onClose={() => {
            setShowReportModal(false);
            setSelectedProject(null);
          }}
        />
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage your requirements gathering projects</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshProjects}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>
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
            <span>{totalItems} projects</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading projects...</span>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
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
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 py-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
          
          <div className="text-sm text-gray-600 ml-4">
            Page {currentPage} of {totalPages} ({totalItems} total projects)
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
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

