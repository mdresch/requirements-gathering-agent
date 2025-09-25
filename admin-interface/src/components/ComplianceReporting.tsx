// Advanced Reporting Component for Standards Compliance Dashboard
// Provides comprehensive reporting and export capabilities

'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Users,
  Settings,
  Share2,
  Mail,
  Printer,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'PDF' | 'Excel' | 'PowerPoint' | 'Word';
  sections: string[];
  estimatedTime: string;
  customizable: boolean;
}

interface ReportSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  lastGenerated?: Date;
  nextGeneration?: Date;
  status: 'active' | 'paused' | 'error';
}

interface ComplianceReportingProps {
  onGenerateReport?: (template: ReportTemplate) => void;
  onScheduleReport?: (schedule: ReportSchedule) => void;
}

export default function ComplianceReporting({ onGenerateReport, onScheduleReport }: ComplianceReportingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level compliance overview for senior management',
      format: 'PDF',
      sections: ['Overall Score', 'Key Findings', 'Risk Assessment', 'Recommendations'],
      estimatedTime: '2-3 minutes',
      customizable: true
    },
    {
      id: 'detailed-analysis',
      name: 'Detailed Compliance Analysis',
      description: 'Comprehensive analysis with all standards and deviations',
      format: 'Excel',
      sections: ['All Standards', 'Deviation Details', 'Historical Trends', 'Action Items'],
      estimatedTime: '5-7 minutes',
      customizable: true
    },
    {
      id: 'audit-ready',
      name: 'Audit-Ready Report',
      description: 'Formatted report suitable for external audits',
      format: 'PDF',
      sections: ['Compliance Evidence', 'Documentation', 'Process Maps', 'Certifications'],
      estimatedTime: '3-4 minutes',
      customizable: false
    },
    {
      id: 'stakeholder-presentation',
      name: 'Stakeholder Presentation',
      description: 'Visual presentation for stakeholder meetings',
      format: 'PowerPoint',
      sections: ['Dashboard Views', 'Charts', 'Key Metrics', 'Action Plans'],
      estimatedTime: '4-5 minutes',
      customizable: true
    },
    {
      id: 'technical-documentation',
      name: 'Technical Documentation',
      description: 'Detailed technical compliance documentation',
      format: 'Word',
      sections: ['Technical Details', 'Implementation Notes', 'Code References', 'Standards Mapping'],
      estimatedTime: '6-8 minutes',
      customizable: true
    }
  ];

  const scheduledReports: ReportSchedule[] = [
    {
      id: 'weekly-exec',
      name: 'Weekly Executive Summary',
      frequency: 'weekly',
      recipients: ['ceo@company.com', 'cto@company.com'],
      lastGenerated: new Date('2024-01-15'),
      nextGeneration: new Date('2024-01-22'),
      status: 'active'
    },
    {
      id: 'monthly-audit',
      name: 'Monthly Audit Report',
      frequency: 'monthly',
      recipients: ['audit@company.com', 'compliance@company.com'],
      lastGenerated: new Date('2024-01-01'),
      nextGeneration: new Date('2024-02-01'),
      status: 'active'
    }
  ];

  const handleGenerateReport = async (template: ReportTemplate) => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      onGenerateReport?.(template);
      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      console.error('Report generation failed:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileText className="w-4 h-4 text-red-600" />;
      case 'Excel': return <BarChart3 className="w-4 h-4 text-green-600" />;
      case 'PowerPoint': return <BarChart3 className="w-4 h-4 text-orange-600" />;
      case 'Word': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Create Custom Template
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Generate comprehensive compliance reports</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div 
                key={template.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFormatIcon(template.format)}
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                  </div>
                  {template.customizable && (
                    <Settings className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.sections.slice(0, 3).map((section, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {section}
                      </span>
                    ))}
                    {template.sections.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        +{template.sections.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedTemplate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">{selectedTemplate.name}</h4>
                <div className="flex items-center space-x-2">
                  {getFormatIcon(selectedTemplate.format)}
                  <span className="text-sm text-gray-600">{selectedTemplate.format}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Sections Included</h5>
                  <ul className="space-y-1">
                    {selectedTemplate.sections.map((section, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{section}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Export Options</h5>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border">
                      <Download className="w-4 h-4" />
                      <span>Download {selectedTemplate.format}</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border">
                      <Mail className="w-4 h-4" />
                      <span>Email Report</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border">
                      <Share2 className="w-4 h-4" />
                      <span>Share Link</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleGenerateReport(selectedTemplate)}
                  disabled={generating}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
                
                {selectedTemplate.customizable && (
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                    <span>Customize</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
            </div>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Schedule New Report
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Automated report generation and distribution</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {scheduledReports.map((schedule) => (
              <div key={schedule.id} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{schedule.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Frequency:</span> {schedule.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Recipients:</span> {schedule.recipients.length}
                  </div>
                  <div>
                    <span className="font-medium">Next:</span> {schedule.nextGeneration?.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    <Eye className="w-3 h-3 inline mr-1" />
                    View Last Report
                  </button>
                  <button className="text-xs text-gray-600 hover:text-gray-800">
                    <Settings className="w-3 h-3 inline mr-1" />
                    Edit Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
