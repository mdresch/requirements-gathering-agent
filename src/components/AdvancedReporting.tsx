// Phase 4: Advanced Reporting & Export - Advanced Reporting Component
// Comprehensive reporting interface with multiple templates and export formats

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Filter,
  Plus,
  Eye,
  Trash2,
  Edit,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'EXECUTIVE' | 'TECHNICAL' | 'COMPLIANCE' | 'DETAILED' | 'SUMMARY';
  sections: string[];
  estimatedTime: string;
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
}

interface ScheduledReport {
  id: string;
  templateId: string;
  projectId: string;
  schedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    day: string;
    time: string;
  };
  recipients: string[];
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON' | 'HTML';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  nextRun: Date;
}

interface ReportGeneration {
  id: string;
  templateId: string;
  projectId: string;
  format: string;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

export default function AdvancedReporting() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'generate' | 'scheduled' | 'history'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL' | 'CSV' | 'JSON' | 'HTML'>('PDF');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<ReportGeneration[]>([]);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
    loadScheduledReports();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/v1/reports/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load report templates');
    }
  };

  const loadScheduledReports = async () => {
    try {
      const response = await fetch('/api/v1/reports/schedules');
      const data = await response.json();
      if (data.success) {
        setScheduledReports(data.data.scheduledReports);
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      toast.error('Failed to load scheduled reports');
    }
  };

  const generateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a report template');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          projectId: 'current-project',
          format: selectedFormat,
          sections: selectedSections,
          customizations: {}
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Report generation started');
        setActiveTab('history');
        // Add to generating reports
        setGeneratingReports(prev => [...prev, {
          id: data.data.report.id,
          templateId: selectedTemplate,
          projectId: 'current-project',
          format: selectedFormat,
          status: 'GENERATING',
          progress: 0,
          createdAt: new Date()
        }]);
      } else {
        toast.error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/download?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportId}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Very High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Reporting & Export</h1>
              <p className="text-gray-600">Generate comprehensive reports with multiple templates and export formats</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Templates</div>
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Scheduled Reports</div>
                <div className="text-2xl font-bold text-green-600">{scheduledReports.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'templates', label: 'Templates', icon: FileText },
                { id: 'generate', label: 'Generate Report', icon: Plus },
                { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                { id: 'history', label: 'History', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {template.estimatedTime}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Sections:</strong> {template.sections.join(', ')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setActiveTab('generate');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Report</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="EXCEL">Excel Spreadsheet</option>
                    <option value="CSV">CSV File</option>
                    <option value="JSON">JSON Data</option>
                    <option value="HTML">HTML Report</option>
                  </select>
                </div>
              </div>

              {/* Sections Selection */}
              {selectedTemplate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Sections</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {templates.find(t => t.id === selectedTemplate)?.sections.map((section) => (
                      <label key={section} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(section)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSections([...selectedSections, section]);
                            } else {
                              setSelectedSections(selectedSections.filter(s => s !== section));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={generateReport}
                  disabled={!selectedTemplate || isGenerating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Scheduled Reports</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Schedule New Report</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {templates.find(t => t.id === report.templateId)?.name || report.templateId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.schedule.frequency} at {report.schedule.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.format}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.nextRun.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Report History</h2>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatingReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {templates.find(t => t.id === report.templateId)?.name || report.templateId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.format}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.createdAt.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {report.status === 'COMPLETED' ? (
                            <button
                              onClick={() => downloadReport(report.id, report.format)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <span className="text-gray-400">Generating...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
