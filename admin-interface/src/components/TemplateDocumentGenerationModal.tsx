/**
 * Template Document Generation Modal
 * Generates documents from templates with project context
 */

import React, { useState, useEffect } from 'react';
import { Template } from '@/types/template';
import { apiClient } from '@/lib/api';
import { DocumentConverter, DocumentContent } from '@/lib/documentConverter';
import { toast } from 'sonner';
import DocumentGenerationProgressTracker, { GenerationStep } from './DocumentGenerationProgressTracker';
import { DocumentGenerationProgressService } from '@/services/DocumentGenerationProgressService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DocumentViewerModal from './DocumentViewerModal';
import {
  FileText,
  Play,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Eye,
  Settings,
  Brain,
  Target,
  Clock,
  Zap,
  FolderOpen,
  Type,
  ChevronRight,
  Search,
  ChevronDown,
  File,
  FileImage,
  FileCode
} from 'lucide-react';

interface TemplateDocumentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  projectId?: string;
}

export default function TemplateDocumentGenerationModal({
  isOpen,
  onClose,
  template,
  projectId = 'current-project'
}: TemplateDocumentGenerationModalProps) {
  console.log('🚀 TemplateDocumentGenerationModal rendered with:', { isOpen, template: template?.name, templateId: template?.id });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'md' | 'pdf' | 'docx'>('md');
  
  // Progress tracking state
  const [progressSteps, setProgressSteps] = useState<GenerationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | undefined>();
  const [progressService, setProgressService] = useState<DocumentGenerationProgressService | null>(null);
  const [projectContext, setProjectContext] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  
  // New state for project selection
  const [inputMethod, setInputMethod] = useState<'context' | 'project'>('context');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  // Filter and search state
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  const [projectFrameworkFilter, setProjectFrameworkFilter] = useState<string>('all');

  // Load projects when modal opens and project option is selected
  useEffect(() => {
    if (isOpen && inputMethod === 'project' && projects.length === 0) {
      loadProjects();
    }
  }, [isOpen, inputMethod]);

  // Initialize progress service
  useEffect(() => {
    const service = new DocumentGenerationProgressService((steps, currentStep, overallProgress) => {
      setProgressSteps(steps);
      setCurrentStepIndex(currentStep);
      setOverallProgress(overallProgress);
      setEstimatedTimeRemaining(service.getEstimatedTimeRemaining());
    });
    setProgressService(service);
  }, []);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                         project.description.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesStatus = projectStatusFilter === 'all' || project.status === projectStatusFilter;
    const matchesFramework = projectFrameworkFilter === 'all' || project.framework === projectFrameworkFilter;
    
    return matchesSearch && matchesStatus && matchesFramework;
  });

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(projects.map(p => p.status))];
  const uniqueFrameworks = [...new Set(projects.map(p => p.framework))];

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await apiClient.getProjects();
      if (response.success && response.data?.projects) {
        setProjects(response.data.projects);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleGenerate = async () => {
    if (!template || !progressService) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedDocument(null);
    setGenerationError(null);

    try {
      // Start progress tracking
      progressService.startGeneration();
      
      // Step 1: Validate Input Data
      await progressService.simulateStepProgress('validate-input', 1000);
      progressService.completeStep('validate-input', 'Input data validated successfully');

      // Step 2: Connect to Database
      await progressService.simulateStepProgress('connect-database', 1500);
      progressService.completeStep('connect-database', 'Database connection established');

      // Step 3: Load Template
      await progressService.simulateStepProgress('load-template', 2000);
      progressService.completeStep('load-template', `Template "${template.name}" loaded successfully`);

      // Step 4: Prepare Context
      await progressService.simulateStepProgress('prepare-context', 1000);
      progressService.completeStep('prepare-context', 'Project context prepared for AI processing');

      // Step 5: Initialize AI Processor
      await progressService.simulateStepProgress('initialize-ai', 1500);
      progressService.completeStep('initialize-ai', 'AI processor initialized with template instructions');

      // Prepare generation data based on input method
      let context = '';
      let targetProjectId = projectId;
      
      if (inputMethod === 'project' && selectedProject) {
        context = `Generate ${template.name} document for project: ${selectedProject.name}\n\nProject Description: ${selectedProject.description}\nProject Status: ${selectedProject.status}\nFramework: ${selectedProject.framework}\nCompliance Score: ${selectedProject.complianceScore}%`;
        targetProjectId = selectedProject.id;
      } else {
        context = projectContext || `Generate ${template.name} document for project ${projectId}`;
      }

      const generationData = {
        projectId: targetProjectId,
        context: context,
        documentKeys: [template.documentKey || template.name.toLowerCase().replace(/\s+/g, '-')],
        framework: template.metadata?.framework || 'pmbok'
      };

      console.log('🚀 Starting document generation:', generationData);

      // Step 6: Generate Content (this is the main AI processing step)
      progressService.updateStep({ stepId: 'generate-content', status: 'in-progress', progress: 0 });
      
      // Call the document generation API
      const response = await apiClient.generateDocuments(generationData);
      
      // Update progress during generation
      progressService.updateStep({ stepId: 'generate-content', progress: 50, details: 'AI is processing the request...' });
      progressService.updateStep({ stepId: 'generate-content', progress: 100, details: 'Content generation completed' });
      progressService.completeStep('generate-content', 'AI content generation completed successfully');

      console.log('📋 Generation API response:', response);
      console.log('📋 Response success:', response.success);
      console.log('📋 Response generatedDocuments:', response.generatedDocuments);
      console.log('📋 Response data:', response.data);

      if (response.success && response.generatedDocuments?.length > 0) {
        // Step 7: Validate Content
        await progressService.simulateStepProgress('validate-content', 1000);
        progressService.completeStep('validate-content', 'Generated content validated successfully');

        // Step 8: Format Document
        await progressService.simulateStepProgress('format-document', 1500);
        progressService.completeStep('format-document', 'Document formatted with markdown structure');

        // Step 9: Save to Database
        await progressService.simulateStepProgress('save-database', 2000);
        progressService.completeStep('save-database', 'Document saved to database successfully');

        // Step 10: Finalize Document
        await progressService.simulateStepProgress('finalize', 1000);
        progressService.completeStep('finalize', 'Document generation completed successfully');
        const generatedDoc = response.generatedDocuments[0];
        setGeneratedDocument({
          id: generatedDoc.documentId,
          name: generatedDoc.title,
          type: generatedDoc.documentKey,
          content: generatedDoc.content,
          category: template.category,
          framework: template.metadata?.framework || 'pmbok',
          generatedAt: new Date().toISOString(),
          generatedBy: 'ADPA-System',
          qualityScore: 85,
          wordCount: generatedDoc.content?.split(' ').length || 0,
          tags: [template.category, 'generated', 'template-based'],
          status: 'draft',
          projectId: targetProjectId,
          templateId: template.id,
          templateName: template.name
        });

        toast.success(`Document "${generatedDoc.title}" generated successfully!`);
      } else {
        // Provide more detailed error information
        const errorMessage = response.error || response.message || 'Document generation failed';
        const errorDetails = response.errors ? ` Details: ${JSON.stringify(response.errors)}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }
    } catch (error) {
      console.error('❌ Document generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Mark current step as error
      const currentStep = progressService.getCurrentStep();
      if (currentStep) {
        progressService.errorStep(currentStep.id, error instanceof Error ? error.message : 'Unknown error occurred');
      }
      
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedDocument(null);
    setGenerationError(null);
    setGenerationProgress(0);
    setProjectContext('');
    setInputMethod('context');
    setSelectedProject(null);
    setProjects([]);
    setProjectSearch('');
    setProjectStatusFilter('all');
    setProjectFrameworkFilter('all');
    setShowDocumentViewer(false);
    onClose();
  };

  const clearFilters = () => {
    setProjectSearch('');
    setProjectStatusFilter('all');
    setProjectFrameworkFilter('all');
  };

  const handleViewDocument = () => {
    if (generatedDocument) {
      setShowDocumentViewer(true);
    }
  };

  const handleDownloadDocument = async (format: 'md' | 'pdf' | 'docx' = selectedFormat) => {
    if (generatedDocument) {
      try {
        const loadingToast = toast.loading(`Preparing ${format.toUpperCase()} download...`);
        
        const documentContent: DocumentContent = {
          title: generatedDocument.name,
          content: generatedDocument.content,
          metadata: {
            author: 'Requirements Gathering Agent',
            date: new Date().toLocaleDateString(),
            version: '1.0'
          }
        };

        let blob: Blob;
        let filename: string;

        switch (format) {
          case 'md':
            blob = new Blob([generatedDocument.content], { 
              type: DocumentConverter.getMimeType('md') 
            });
            filename = `${generatedDocument.name}.${DocumentConverter.getFileExtension('md')}`;
            break;
          case 'pdf':
            blob = await DocumentConverter.convertToPDF(documentContent);
            filename = `${generatedDocument.name}.${DocumentConverter.getFileExtension('pdf')}`;
            break;
          case 'docx':
            blob = await DocumentConverter.convertToDOCX(documentContent);
            filename = `${generatedDocument.name}.${DocumentConverter.getFileExtension('docx')}`;
            break;
          default:
            throw new Error('Unsupported format');
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.dismiss(loadingToast);
        toast.success(`Document downloaded as ${format.toUpperCase()}!`);
        
      } catch (error) {
        console.error('Download error:', error);
        toast.error(`Failed to download as ${format.toUpperCase()}`);
      }
    }
  };

  if (!template) {
    console.log('🚀 TemplateDocumentGenerationModal: No template provided, returning null');
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Generate Document from Template</span>
          </DialogTitle>
          <DialogDescription>
            Generate a new document using the "{template.name}" template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Template Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{template.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-sm">{template.category}</Badge>
                    <Badge variant="outline" className="text-sm">v{template.version || '1.0'}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {template.metadata?.framework && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Settings className="w-4 h-4" />
                      <span>Framework: {template.metadata.framework}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Choose Input Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Context Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    inputMethod === 'context' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setInputMethod('context')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      inputMethod === 'context' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Type className={`w-5 h-5 ${
                        inputMethod === 'context' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Type Context</h3>
                      <p className="text-sm text-gray-600">Enter custom project context manually</p>
                    </div>
                    {inputMethod === 'context' && (
                      <ChevronRight className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                </div>

                {/* Project Selection Option */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    inputMethod === 'project' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setInputMethod('project')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      inputMethod === 'project' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <FolderOpen className={`w-5 h-5 ${
                        inputMethod === 'project' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Select Project</h3>
                      <p className="text-sm text-gray-600">Choose from existing projects</p>
                    </div>
                    {inputMethod === 'project' && (
                      <ChevronRight className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Input (when manual context is selected) */}
          {inputMethod === 'context' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Project Context</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={projectContext}
                  onChange={(e) => setProjectContext(e.target.value)}
                  placeholder="Enter project context, requirements, or specific instructions for document generation..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-sm"
                  disabled={isGenerating}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Provide context to help generate more relevant and accurate content.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Selection (when project selection is chosen) */}
          {inputMethod === 'project' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                  <span>Select Project</span>
                </CardTitle>
              </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No projects found</p>
                <p className="text-sm text-gray-500">Create a project first to use this option</p>
              </div>
            ) : (
              <>
                {/* Search and Filter Controls */}
                <div className="space-y-4 mb-6">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search projects by name or description..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Status:</label>
                      <select
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Statuses</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Framework:</label>
                      <select
                        value={projectFrameworkFilter}
                        onChange={(e) => setProjectFrameworkFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Frameworks</option>
                        {uniqueFrameworks.map(framework => (
                          <option key={framework} value={framework}>{framework}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Results Count */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{filteredProjects.length} of {projects.length} projects</span>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {(projectSearch || projectStatusFilter !== 'all' || projectFrameworkFilter !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No projects match your search criteria</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProject?.id === project.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                          </div>
                          {selectedProject?.id === project.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">{project.status}</Badge>
                            <Badge variant="outline" className="text-xs">{project.framework}</Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>Compliance: {project.complianceScore}%</span>
                            <span>Docs: {project.documents}</span>
                            <span>Stakeholders: {project.stakeholders}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </>
              )}
              {selectedProject && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Selected: {selectedProject.name}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Document will be generated using this project's context and data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="font-medium">Generating document...</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Processing template and generating content...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Error */}
          {generationError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Generation Failed</span>
                </div>
                <p className="text-sm text-red-600 mt-2">{generationError}</p>
              </CardContent>
            </Card>
          )}

          {/* Generated Document */}
          {generatedDocument && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>Document Generated Successfully!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{generatedDocument.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{generatedDocument.type}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {generatedDocument.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>{generatedDocument.wordCount} words</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span>Quality Score: {generatedDocument.qualityScore}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={handleViewDocument}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleDownloadDocument('md')}
                            className="flex items-center space-x-2"
                          >
                            <FileCode className="w-4 h-4" />
                            <span>Markdown (.md)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDownloadDocument('pdf')}
                            className="flex items-center space-x-2"
                          >
                            <FileImage className="w-4 h-4" />
                            <span>PDF (.pdf)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDownloadDocument('docx')}
                            className="flex items-center space-x-2"
                          >
                            <File className="w-4 h-4" />
                            <span>Word (.docx)</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isGenerating}
            >
              {generatedDocument ? 'Close' : 'Cancel'}
            </Button>
            {!generatedDocument && !generationError && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (inputMethod === 'project' && !selectedProject)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Generate Document</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Document Viewer Modal */}
    <DocumentViewerModal
      isOpen={showDocumentViewer}
      onClose={() => setShowDocumentViewer(false)}
      document={generatedDocument}
      projectId={generatedDocument?.projectId}
    />

    {/* Progress Tracker Modal */}
    <DocumentGenerationProgressTracker
      isVisible={isGenerating}
      currentStep={currentStepIndex}
      steps={progressSteps}
      overallProgress={overallProgress}
      estimatedTimeRemaining={estimatedTimeRemaining}
      onCancel={() => {
        setIsGenerating(false);
        toast.info('Document generation cancelled');
      }}
      onRetry={() => {
        if (template) {
          handleGenerate();
        }
      }}
    />
  </>
  );
}
