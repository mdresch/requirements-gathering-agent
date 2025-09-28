// Document Generation Interface
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\DocumentGenerator.tsx

'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Settings, Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTemplates } from '../lib/api';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  framework?: 'babok' | 'pmbok' | 'multi';
  metadata?: {
    framework?: string;
    [key: string]: any;
  };
  outputFormats?: string[];
  estimatedTime?: string;
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    getTemplates()
      .then((result) => {
        if (result.success && result.data && result.data.templates) {
          setTemplates(result.data.templates);
        } else {
          setError(result.error || 'Failed to load templates');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

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
    setOutputFormat(template.outputFormats?.[0] || 'PDF');
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

    const newJob: GenerationJob = {
      id: Date.now().toString(),
      templateName: selectedTemplate.name,
      status: 'pending',
      progress: 0,
      outputFormat: outputFormat,
      createdAt: new Date().toISOString()
    };

    setGenerationJobs([newJob, ...generationJobs]);
    toast.success('Document generation started');

    // Simulate generation process
    setTimeout(() => {
      setGenerationJobs(jobs => 
        jobs.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'processing', progress: 25 }
            : job
        )
      );
    }, 1000);

    setTimeout(() => {
      setGenerationJobs(jobs => 
        jobs.map(job => 
          job.id === newJob.id 
            ? { ...job, progress: 75 }
            : job
        )
      );
    }, 3000);

    setTimeout(() => {
      setGenerationJobs(jobs => 
        jobs.map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100,
                downloadUrl: `/api/v1/documents/download/${newJob.id}`
              }
            : job
        )
      );
      toast.success('Document generated successfully');
    }, 5000);
  };

  const handlePreview = () => {
    if (!selectedTemplate || !inputData.trim()) {
      toast.error('Please select a template and provide input data');
      return;
    }

    setPreviewContent(`
# ${selectedTemplate.name}

## Generated Preview

**Framework:** ${(selectedTemplate.framework || selectedTemplate.metadata?.framework || 'general').toUpperCase()}
**Output Format:** ${outputFormat}

### Input Analysis
${inputData}

### Generated Content
This is a preview of the document that would be generated using the ${selectedTemplate.name} template.

*Note: This is a simplified preview. The actual generated document will include comprehensive analysis, formatting, and professional layout.*
    `);
    setShowPreview(true);
  };

  const handleDownload = async (job: GenerationJob) => {
    if (!job.downloadUrl) {
      toast.error('Download not available yet');
      return;
    }

    try {
      // Find the template used for this job
      const template = templates.find(t => t.name === job.templateName);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      // Generate document content based on template and format
      const documentContent = generateDocumentContent(template, job.outputFormat, inputData);
      
      // Create and download the file
      const blob = new Blob([documentContent.content], { type: documentContent.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.templateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${documentContent.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${job.templateName}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const generateDocumentContent = (template: Template, format: string, inputData: string) => {
    const framework = template.framework || template.metadata?.framework || 'general';
    const category = template.category || 'General';
    
    // Generate comprehensive document content
    const documentText = `# ${template.name}

## Document Information
- **Framework**: ${framework.toUpperCase()}
- **Category**: ${category}
- **Generated**: ${new Date().toLocaleString()}
- **Format**: ${format}

## Executive Summary

This document has been generated using the ${template.name} template with the ${framework.toUpperCase()} framework. The content below is based on the provided input data and follows industry best practices for ${category.toLowerCase()} documentation.

## Input Analysis

${inputData}

## Generated Content

### 1. Project Overview
Based on the input data provided, this document outlines the key aspects of the project or initiative being documented.

### 2. Requirements and Specifications
${generateRequirementsSection(inputData)}

### 3. Stakeholder Analysis
${generateStakeholderSection(inputData)}

### 4. Implementation Plan
${generateImplementationSection(inputData)}

### 5. Risk Assessment
${generateRiskSection(inputData)}

### 6. Success Criteria
${generateSuccessCriteriaSection(inputData)}

## Conclusion

This document serves as a comprehensive guide for the project or initiative outlined above. It follows the ${framework.toUpperCase()} framework principles and incorporates best practices for ${category.toLowerCase()} documentation.

---

*This document was generated on ${new Date().toLocaleString()} using the ADPA Document Generation System.*`;

    // Return appropriate format
    switch (format.toLowerCase()) {
      case 'pdf':
        // For PDF, we'll create an HTML file that can be easily converted to PDF by the browser
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${template.name}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info strong { color: #2c3e50; }
        ul { margin: 10px 0; }
        li { margin: 5px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #bdc3c7; font-style: italic; color: #7f8c8d; }
        @media print {
            body { margin: 20px; }
            .info { background: #f8f9fa; border: 1px solid #dee2e6; }
        }
    </style>
</head>
<body>
    <h1>${template.name}</h1>
    
    <div class="info">
        <strong>Framework:</strong> ${framework.toUpperCase()}<br>
        <strong>Category:</strong> ${category}<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
        <strong>Format:</strong> ${format}
    </div>

    <h2>Executive Summary</h2>
    <p>This document has been generated using the ${template.name} template with the ${framework.toUpperCase()} framework. The content below is based on the provided input data and follows industry best practices for ${category.toLowerCase()} documentation.</p>

    <h2>Input Analysis</h2>
    <p>${inputData.replace(/\n/g, '<br>')}</p>

    <h2>Generated Content</h2>
    
    <h3>1. Project Overview</h3>
    <p>Based on the input data provided, this document outlines the key aspects of the project or initiative being documented.</p>

    <h3>2. Requirements and Specifications</h3>
    <div>${generateRequirementsSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>3. Stakeholder Analysis</h3>
    <div>${generateStakeholderSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>4. Implementation Plan</h3>
    <div>${generateImplementationSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>5. Risk Assessment</h3>
    <div>${generateRiskSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>6. Success Criteria</h3>
    <div>${generateSuccessCriteriaSection(inputData).replace(/\n/g, '<br>')}</div>

    <h2>Conclusion</h2>
    <p>This document serves as a comprehensive guide for the project or initiative outlined above. It follows the ${framework.toUpperCase()} framework principles and incorporates best practices for ${category.toLowerCase()} documentation.</p>

    <div class="footer">
        <p><em>This document was generated on ${new Date().toLocaleString()} using the ADPA Document Generation System.</em></p>
    </div>
</body>
</html>`;
        return {
          content: htmlContent,
          mimeType: 'text/html',
          extension: 'html'
        };
      case 'docx':
        // For DOCX, we'll create an HTML file that can be opened in Word
        const docxHtmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <title>${template.name}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; margin: 1in; }
        h1 { font-size: 18pt; font-weight: bold; color: #2c3e50; margin-top: 0; margin-bottom: 12pt; }
        h2 { font-size: 16pt; font-weight: bold; color: #34495e; margin-top: 12pt; margin-bottom: 6pt; }
        h3 { font-size: 14pt; font-weight: bold; color: #7f8c8d; margin-top: 12pt; margin-bottom: 6pt; }
        p { margin: 0 0 6pt 0; text-align: justify; }
        .info { background: #f8f9fa; border: 1pt solid #dee2e6; padding: 6pt; margin: 6pt 0; }
        .info strong { font-weight: bold; }
        ul { margin: 6pt 0; padding-left: 18pt; }
        li { margin: 3pt 0; }
        .footer { margin-top: 24pt; padding-top: 12pt; border-top: 1pt solid #bdc3c7; font-style: italic; color: #6c757d; font-size: 10pt; }
    </style>
</head>
<body>
    <h1>${template.name}</h1>
    
    <div class="info">
        <strong>Framework:</strong> ${framework.toUpperCase()}<br>
        <strong>Category:</strong> ${category}<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
        <strong>Format:</strong> ${format}
    </div>

    <h2>Executive Summary</h2>
    <p>This document has been generated using the ${template.name} template with the ${framework.toUpperCase()} framework. The content below is based on the provided input data and follows industry best practices for ${category.toLowerCase()} documentation.</p>

    <h2>Input Analysis</h2>
    <p>${inputData.replace(/\n/g, '<br>')}</p>

    <h2>Generated Content</h2>
    
    <h3>1. Project Overview</h3>
    <p>Based on the input data provided, this document outlines the key aspects of the project or initiative being documented.</p>

    <h3>2. Requirements and Specifications</h3>
    <div>${generateRequirementsSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>3. Stakeholder Analysis</h3>
    <div>${generateStakeholderSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>4. Implementation Plan</h3>
    <div>${generateImplementationSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>5. Risk Assessment</h3>
    <div>${generateRiskSection(inputData).replace(/\n/g, '<br>')}</div>

    <h3>6. Success Criteria</h3>
    <div>${generateSuccessCriteriaSection(inputData).replace(/\n/g, '<br>')}</div>

    <h2>Conclusion</h2>
    <p>This document serves as a comprehensive guide for the project or initiative outlined above. It follows the ${framework.toUpperCase()} framework principles and incorporates best practices for ${category.toLowerCase()} documentation.</p>

    <div class="footer">
        <p><em>This document was generated on ${new Date().toLocaleString()} using the ADPA Document Generation System.</em></p>
    </div>
</body>
</html>`;
        return {
          content: docxHtmlContent,
          mimeType: 'application/msword',
          extension: 'doc'
        };
      case 'txt':
        return {
          content: documentText,
          mimeType: 'text/plain',
          extension: 'txt'
        };
      default:
        return {
          content: documentText,
          mimeType: 'text/plain',
          extension: 'txt'
        };
    }
  };

  const generateRequirementsSection = (inputData: string) => {
    return `The requirements for this project are derived from the input data provided:

${inputData}

Key requirements identified:
- Functional requirements based on the specified needs
- Non-functional requirements for performance and reliability
- Compliance requirements relevant to the project domain
- Integration requirements with existing systems`;
  };

  const generateStakeholderSection = (inputData: string) => {
    return `Stakeholders involved in this project include:

Primary Stakeholders:
- Project sponsors and decision makers
- End users and beneficiaries
- Technical team members
- Quality assurance representatives

Secondary Stakeholders:
- External vendors and suppliers
- Regulatory bodies (if applicable)
- Community representatives (if applicable)

Stakeholder engagement will be managed through regular communication, feedback sessions, and progress updates.`;
  };

  const generateImplementationSection = (inputData: string) => {
    return `Implementation approach:

Phase 1: Planning and Preparation
- Detailed project planning
- Resource allocation
- Risk mitigation strategies

Phase 2: Execution
- Core implementation activities
- Quality assurance processes
- Stakeholder communication

Phase 3: Testing and Validation
- Comprehensive testing
- User acceptance testing
- Performance validation

Phase 4: Deployment and Support
- Production deployment
- User training
- Ongoing support and maintenance`;
  };

  const generateRiskSection = (inputData: string) => {
    return `Risk assessment and mitigation:

High Priority Risks:
- Technical complexity and integration challenges
- Resource availability and skill gaps
- Timeline and scope changes

Medium Priority Risks:
- External dependencies
- Regulatory compliance requirements
- Market or business environment changes

Mitigation Strategies:
- Regular risk assessment and monitoring
- Contingency planning for critical risks
- Proactive stakeholder communication
- Quality assurance and testing protocols`;
  };

  const generateSuccessCriteriaSection = (inputData: string) => {
    return `Success criteria for this project:

Functional Success Criteria:
- All specified requirements are met
- System performance meets defined benchmarks
- User acceptance criteria are satisfied

Non-Functional Success Criteria:
- Project delivered within budget and timeline
- Quality standards are maintained
- Stakeholder satisfaction is achieved

Measurement and Validation:
- Regular progress reviews and assessments
- Performance metrics and KPIs
- Stakeholder feedback and satisfaction surveys
- Post-implementation evaluation and lessons learned`;
  };

  // Render templates from backend
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrameworkColor(template.framework || template.metadata?.framework || 'general')}`}>
                      {(template.framework || template.metadata?.framework || 'general').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category: {template.category || 'General'}</span>
                    <span className="text-gray-500">{template.estimatedTime || template.metadata?.estimatedTime || 'N/A'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(template.outputFormats || ['PDF', 'DOCX', 'TXT']).map((format) => (
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
                    {(selectedTemplate.outputFormats || ['PDF', 'DOCX', 'TXT']).map((format) => (
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
