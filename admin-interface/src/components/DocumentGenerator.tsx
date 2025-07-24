// Document Generation Interface
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\DocumentGenerator.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, Settings, Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  framework: 'babok' | 'pmbok' | 'multi';
  outputFormats: string[];
  estimatedTime: string;
}

interface GenerationJob {
  id: string;
  templateName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputFormat: string;
  createdAt: string;
  downloadUrl?: string;
}

export default function DocumentGenerator() {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Business Requirements Document',
      category: 'Requirements',
      description: 'Comprehensive business requirements analysis and documentation',
      framework: 'babok',
      outputFormats: ['PDF', 'DOCX', 'HTML', 'INDD'],
      estimatedTime: '5-10 minutes'
    },
    {
      id: '2',
      name: 'Project Charter',
      category: 'Project Management',
      description: 'PMBOK-compliant project charter with stakeholder analysis',
      framework: 'pmbok',
      outputFormats: ['PDF', 'DOCX', 'AI', 'PSD'],
      estimatedTime: '3-5 minutes'
    },
    {
      id: '3',
      name: 'Stakeholder Analysis Report',
      category: 'Analysis',
      description: 'Multi-standard stakeholder identification and analysis',
      framework: 'multi',
      outputFormats: ['PDF', 'DOCX', 'HTML'],
      estimatedTime: '7-12 minutes'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('PDF');
  const [inputData, setInputData] = useState<string>('');
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([
    {
      id: '1',
      templateName: 'Business Requirements Document',
      status: 'completed',
      progress: 100,
      outputFormat: 'PDF',
      createdAt: '2025-01-13T10:30:00Z',
      downloadUrl: '/api/v1/documents/download/1'
    },
    {
      id: '2',
      templateName: 'Project Charter',
      status: 'processing',
      progress: 65,
      outputFormat: 'DOCX',
      createdAt: '2025-01-13T11:15:00Z'
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setOutputFormat(template.outputFormats[0]);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    if (!inputData.trim()) {
      toast.error('Please provide input data for document generation');
      return;
    }
    try {
      toast.loading('Submitting document generation request...');
      // Infer inputFormat from template or default to 'markdown'
      let inputFormat: string = 'markdown';
      if (selectedTemplate.framework === 'babok' || selectedTemplate.framework === 'multi') {
        inputFormat = 'markdown';
      } else if (selectedTemplate.framework === 'pmbok') {
        inputFormat = 'markdown'; // Adjust if you want to support other formats
      }
      const response = await axios.post(
        '/api/v1/documents/convert',
        {
          content: inputData,
          inputFormat,
          outputFormat: outputFormat.toLowerCase()
        },
        {
          headers: { 'x-api-key': 'dev-api-key-123' }
        }
      );
      toast.dismiss();
      if (response.data && (response.data.jobId || response.data.data?.jobId)) {
        const jobId = response.data.jobId || response.data.data.jobId;
        const newJob: GenerationJob = {
          id: jobId,
          templateName: selectedTemplate.name,
          status: 'pending',
          progress: 0,
          outputFormat: outputFormat,
          createdAt: new Date().toISOString()
        };
        setGenerationJobs(jobs => [newJob, ...jobs]);
        pollJobStatus(jobId, newJob);
        toast.success('Document generation started');
      } else {
        toast.error('Failed to start document generation');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Error submitting document generation request');
    }
  };

  // Poll job status from backend
  const pollJobStatus = (jobId: string, job: GenerationJob) => {
    const poll = async (attempt = 0) => {
      try {
        const res = await axios.get(`/api/v1/documents/jobs/${jobId}`,
          { headers: { 'x-api-key': 'dev-api-key-123' } }
        );
        const status = res.data?.status;
        let progress = res.data?.progress ?? 0;
        let downloadUrl = res.data?.downloadUrl;
        setGenerationJobs(jobs => jobs.map(j =>
          j.id === jobId ? { ...j, status, progress, downloadUrl } : j
        ));
        if (status === 'completed' && downloadUrl) {
          toast.success('Document generated successfully');
        } else if (status === 'failed') {
          toast.error('Document generation failed');
        } else if (attempt < 60) { // poll up to 5 minutes
          setTimeout(() => poll(attempt + 1), 5000);
        }
      } catch (e) {
        if (attempt < 60) setTimeout(() => poll(attempt + 1), 5000);
      }
    };
    poll();
  };

  const handlePreview = () => {
    if (!selectedTemplate || !inputData.trim()) {
      toast.error('Please select a template and provide input data');
      return;
    }

    setPreviewContent(`
# ${selectedTemplate.name}

## Generated Preview

**Framework:** ${selectedTemplate.framework.toUpperCase()}
**Output Format:** ${outputFormat}

### Input Analysis
${inputData}

### Generated Content
This is a preview of the document that would be generated using the ${selectedTemplate.name} template.

*Note: This is a simplified preview. The actual generated document will include comprehensive analysis, formatting, and professional layout.*
    `);
    setShowPreview(true);
  };

  const handleDownload = (job: GenerationJob) => {
    if (job.downloadUrl) {
      axios.get(job.downloadUrl, {
        responseType: 'blob',
        headers: { 'x-api-key': 'dev-api-key-123' }
      })
        .then((response) => {
          const contentDisposition = response.headers['content-disposition'];
          let filename = job.templateName + '.' + (job.outputFormat?.toLowerCase() || 'pdf');
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^";]+)"?/);
            if (match && match[1]) filename = match[1];
          }
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success(`Downloading ${filename}`);
        })
        .catch(() => {
          toast.error('Failed to download document');
        });
    } else {
      toast.error('Download not available yet');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Generation</h1>
        <p className="text-gray-600 mt-1">Generate professional documents using AI-powered templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates Grid */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrameworkColor(template.framework)}`}>
                      {template.framework.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category: {template.category}</span>
                    <span className="text-gray-500">{template.estimatedTime}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.outputFormats.map((format) => (
                      <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input and Configuration */}
          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configure Generation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    title="Select output format"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {selectedTemplate.outputFormats.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Data
                  </label>
                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Enter your project requirements, stakeholder information, or business context..."
                    className="w-full h-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Document</span>
                  </button>
                  <button
                    onClick={handlePreview}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Jobs */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generation Jobs</h2>
            
            {generationJobs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No generation jobs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generationJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{job.templateName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(job.createdAt).toLocaleString()} • {job.outputFormat}
                    </div>

                    {job.status === 'processing' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {job.status === 'completed' && job.downloadUrl && (
                      <button
                        onClick={() => handleDownload(job)}
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}

                    {job.status === 'failed' && (
                      <button
                        onClick={() => toast.error('Retry functionality coming soon')}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{previewContent}</pre>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
