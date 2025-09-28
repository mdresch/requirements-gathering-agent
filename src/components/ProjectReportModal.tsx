// Project Report Modal Component
// filepath: admin-interface/src/components/ProjectReportModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, Users, BarChart3, TrendingUp, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    framework: string;
    complianceScore: number;
    documents: number;
    stakeholders: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface ReportData {
  project: any;
  stakeholders: any[];
  documents: any[];
  feedback: any[];
  qualityScores: any;
  complianceMetrics: any;
  generatedAt: string;
}

export default function ProjectReportModal({ isOpen, onClose, project }: ProjectReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);

  // Load comprehensive project data
  const loadReportData = async () => {
    if (!project?.id) return;

    setLoading(true);
    try {
      console.log('📊 Loading comprehensive project report data...');
      
      // Fetch all related data in parallel
      const [stakeholdersRes, documentsRes, feedbackRes] = await Promise.all([
        apiClient.getProjectStakeholders(project.id),
        apiClient.getProjectDocuments(project.id),
        apiClient.getProjectFeedback(project.id)
      ]);

      // Calculate quality scores and compliance metrics
      const qualityScores = calculateQualityMetrics(documentsRes.data || []);
      const complianceMetrics = calculateComplianceMetrics(documentsRes.data || [], project);

      const data: ReportData = {
        project,
        stakeholders: stakeholdersRes.data?.stakeholders || [],
        documents: documentsRes.data || [],
        feedback: feedbackRes.data || [],
        qualityScores,
        complianceMetrics,
        generatedAt: new Date().toISOString()
      };

      setReportData(data);
      console.log('✅ Report data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate quality metrics
  const calculateQualityMetrics = (documents: any[]) => {
    const totalDocuments = documents.length;
    const documentsWithScores = documents.filter(doc => doc.qualityScore > 0);
    const averageQuality = documentsWithScores.length > 0 
      ? documentsWithScores.reduce((sum, doc) => sum + (doc.qualityScore || 0), 0) / documentsWithScores.length
      : 0;
    
    const qualityDistribution = {
      excellent: documents.filter(doc => (doc.qualityScore || 0) >= 90).length,
      good: documents.filter(doc => (doc.qualityScore || 0) >= 70 && (doc.qualityScore || 0) < 90).length,
      fair: documents.filter(doc => (doc.qualityScore || 0) >= 50 && (doc.qualityScore || 0) < 70).length,
      poor: documents.filter(doc => (doc.qualityScore || 0) < 50).length
    };

    return {
      totalDocuments,
      documentsWithScores: documentsWithScores.length,
      averageQuality: Math.round(averageQuality),
      qualityDistribution
    };
  };

  // Calculate compliance metrics
  const calculateComplianceMetrics = (documents: any[], project: any) => {
    const totalDocuments = documents.length;
    const compliantDocuments = documents.filter(doc => (doc.metadata?.complianceScore || doc.qualityScore || 0) >= 70);
    const averageCompliance = project.complianceScore || 0;
    
    const frameworkCompliance = {
      pmbok: documents.filter(doc => doc.framework === 'pmbok' && (doc.metadata?.complianceScore || 0) >= 70).length,
      babok: documents.filter(doc => doc.framework === 'babok' && (doc.metadata?.complianceScore || 0) >= 70).length,
      multi: documents.filter(doc => doc.framework === 'multi' && (doc.metadata?.complianceScore || 0) >= 70).length
    };

    return {
      totalDocuments,
      compliantDocuments: compliantDocuments.length,
      averageCompliance,
      frameworkCompliance,
      complianceRate: totalDocuments > 0 ? Math.round((compliantDocuments.length / totalDocuments) * 100) : 0
    };
  };

  // Generate and download report
  const handleGenerateReport = async () => {
    if (!reportData) return;

    setGenerating(true);
    try {
      console.log('📄 Generating comprehensive project report...');
      
      const reportContent = generateReportContent(reportData);
      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project_report_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Project report generated and downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Generate report content
  const generateReportContent = (data: ReportData) => {
    const { project, stakeholders, documents, feedback, qualityScores, complianceMetrics } = data;
    
    return `# Project Report: ${project.name}

## Executive Summary
- **Project Name**: ${project.name}
- **Status**: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
- **Framework**: ${project.framework.toUpperCase()}
- **Overall Compliance Score**: ${project.complianceScore}%
- **Generated On**: ${new Date(data.generatedAt).toLocaleString()}

## Project Overview
${project.description}

### Key Metrics
- **Total Documents**: ${documents.length}
- **Active Stakeholders**: ${stakeholders.length}
- **Average Quality Score**: ${qualityScores.averageQuality}%
- **Compliance Rate**: ${complianceMetrics.complianceRate}%

## Stakeholder Analysis
### Stakeholder Summary
- **Total Stakeholders**: ${stakeholders.length}
- **Project Managers**: ${stakeholders.filter(s => s.role === 'project_manager').length}
- **Sponsors**: ${stakeholders.filter(s => s.role === 'sponsor').length}
- **Team Members**: ${stakeholders.filter(s => s.role === 'team_member').length}
- **End Users**: ${stakeholders.filter(s => s.role === 'end_user').length}
- **Other Stakeholders**: ${stakeholders.filter(s => !['project_manager', 'sponsor', 'team_member', 'end_user'].includes(s.role)).length}

### Stakeholder Details
${stakeholders.map(stakeholder => `
#### ${stakeholder.name}
- **Role**: ${stakeholder.role}
- **Title**: ${stakeholder.title}
- **Department**: ${stakeholder.department || 'N/A'}
- **Influence Level**: ${stakeholder.influence}
- **Engagement Level**: ${stakeholder.engagementLevel}
- **Communication Preference**: ${stakeholder.communicationPreference}
`).join('\n')}

## Document Analysis
### Document Summary
- **Total Documents**: ${documents.length}
- **Documents with Quality Scores**: ${qualityScores.documentsWithScores}
- **Average Quality Score**: ${qualityScores.averageQuality}%

### Quality Distribution
- **Excellent (90%+)**: ${qualityScores.qualityDistribution.excellent} documents
- **Good (70-89%)**: ${qualityScores.qualityDistribution.good} documents
- **Fair (50-69%)**: ${qualityScores.qualityDistribution.fair} documents
- **Poor (<50%)**: ${qualityScores.qualityDistribution.poor} documents

### Document Details
${documents.map(doc => `
#### ${doc.name}
- **Type**: ${doc.type || 'N/A'}
- **Category**: ${doc.category || 'N/A'}
- **Quality Score**: ${doc.qualityScore || 'N/A'}%
- **Compliance Score**: ${doc.metadata?.complianceScore || 'N/A'}%
- **Created**: ${new Date(doc.createdAt).toLocaleDateString()}
- **Status**: ${doc.status || 'N/A'}
`).join('\n')}

## Compliance Analysis
### Compliance Summary
- **Overall Compliance Score**: ${project.complianceScore}%
- **Compliant Documents**: ${complianceMetrics.compliantDocuments}/${complianceMetrics.totalDocuments}
- **Compliance Rate**: ${complianceMetrics.complianceRate}%

### Framework-Specific Compliance
- **PMBOK Compliance**: ${complianceMetrics.frameworkCompliance.pmbok} documents
- **BABOK Compliance**: ${complianceMetrics.frameworkCompliance.babok} documents
- **Multi-Standard Compliance**: ${complianceMetrics.frameworkCompliance.multi} documents

## Feedback Analysis
### Feedback Summary
- **Total Feedback Items**: ${feedback.length}
- **Average Rating**: ${feedback.length > 0 ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1) : 'N/A'}/5

### Recent Feedback
${feedback.slice(0, 5).map(f => `
- **${f.title}** (${f.rating}/5): ${f.description}
  - Category: ${f.category}
  - Submitted: ${new Date(f.createdAt).toLocaleDateString()}
`).join('\n')}

## Recommendations
### Quality Improvements
${qualityScores.qualityDistribution.poor > 0 ? `
- **${qualityScores.qualityDistribution.poor} documents** have poor quality scores (<50%). Consider reviewing and improving these documents.
` : ''}
${qualityScores.averageQuality < 70 ? `
- **Average quality score is below 70%**. Consider implementing quality improvement initiatives.
` : ''}

### Compliance Improvements
${complianceMetrics.complianceRate < 80 ? `
- **Compliance rate is ${complianceMetrics.complianceRate}%**. Aim for at least 80% compliance.
` : ''}
${complianceMetrics.compliantDocuments < complianceMetrics.totalDocuments ? `
- **${complianceMetrics.totalDocuments - complianceMetrics.compliantDocuments} documents** need compliance review.
` : ''}

### Stakeholder Engagement
${stakeholders.filter(s => s.engagementLevel < 3).length > 0 ? `
- **${stakeholders.filter(s => s.engagementLevel < 3).length} stakeholders** have low engagement levels. Consider engagement improvement strategies.
` : ''}

## Conclusion
This project shows ${project.complianceScore >= 70 ? 'good' : 'room for improvement in'} compliance with ${project.framework.toUpperCase()} standards. 
${qualityScores.averageQuality >= 70 ? 'Quality scores are satisfactory.' : 'Quality improvement is recommended.'}
${stakeholders.length > 0 ? 'Stakeholder engagement is active with ' + stakeholders.length + ' participants.' : 'Consider expanding stakeholder engagement.'}

---
*Report generated on ${new Date().toLocaleString()} by ADPA Enterprise Framework*
`;
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      loadReportData();
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Report</h2>
              <p className="text-gray-600">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading report data...</span>
              </div>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Executive Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{reportData.project.complianceScore}%</div>
                    <div className="text-sm text-blue-800">Compliance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{reportData.documents.length}</div>
                    <div className="text-sm text-green-800">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{reportData.stakeholders.length}</div>
                    <div className="text-sm text-purple-800">Stakeholders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{reportData.qualityScores.averageQuality}%</div>
                    <div className="text-sm text-orange-800">Avg Quality</div>
                  </div>
                </div>
              </div>

              {/* Stakeholder Analysis */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Stakeholder Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.stakeholders.filter(s => s.role === 'project_manager').length}</div>
                    <div className="text-sm text-gray-600">Project Managers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.stakeholders.filter(s => s.role === 'sponsor').length}</div>
                    <div className="text-sm text-gray-600">Sponsors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.stakeholders.filter(s => s.role === 'team_member').length}</div>
                    <div className="text-sm text-gray-600">Team Members</div>
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {reportData.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{stakeholder.name}</div>
                        <div className="text-sm text-gray-600">{stakeholder.title} • {stakeholder.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Influence: {stakeholder.influence}</div>
                        <div className="text-sm text-gray-600">Engagement: {stakeholder.engagementLevel}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Analysis */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{reportData.qualityScores.qualityDistribution.excellent}</div>
                    <div className="text-sm text-green-800">Excellent (90%+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{reportData.qualityScores.qualityDistribution.good}</div>
                    <div className="text-sm text-blue-800">Good (70-89%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">{reportData.qualityScores.qualityDistribution.fair}</div>
                    <div className="text-sm text-yellow-800">Fair (50-69%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{reportData.qualityScores.qualityDistribution.poor}</div>
                    <div className="text-sm text-red-800">Poor (&lt;50%)</div>
                  </div>
                </div>
              </div>

              {/* Compliance Analysis */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Compliance Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.complianceMetrics.complianceRate}%</div>
                    <div className="text-sm text-gray-600">Compliance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.complianceMetrics.compliantDocuments}</div>
                    <div className="text-sm text-gray-600">Compliant Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{reportData.project.framework.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">Framework</div>
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              {reportData.feedback.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Feedback Summary
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {(reportData.feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / reportData.feedback.length).toFixed(1)}/5
                    </div>
                    <div className="text-sm text-gray-600">Average Rating ({reportData.feedback.length} reviews)</div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  {reportData.qualityScores.qualityDistribution.poor > 0 && (
                    <div>• {reportData.qualityScores.qualityDistribution.poor} documents have poor quality scores. Consider reviewing and improving these documents.</div>
                  )}
                  {reportData.complianceMetrics.complianceRate < 80 && (
                    <div>• Compliance rate is {reportData.complianceMetrics.complianceRate}%. Aim for at least 80% compliance.</div>
                  )}
                  {reportData.stakeholders.filter(s => s.engagementLevel < 3).length > 0 && (
                    <div>• {reportData.stakeholders.filter(s => s.engagementLevel < 3).length} stakeholders have low engagement levels. Consider engagement improvement strategies.</div>
                  )}
                  {reportData.qualityScores.qualityDistribution.poor === 0 && reportData.complianceMetrics.complianceRate >= 80 && reportData.stakeholders.filter(s => s.engagementLevel < 3).length === 0 && (
                    <div>• Project is performing well across all metrics. Continue current practices.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No report data available</h3>
              <p className="text-gray-600">Unable to load project report data.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Report generated on {reportData ? new Date(reportData.generatedAt).toLocaleString() : 'N/A'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={!reportData || generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{generating ? 'Generating...' : 'Download Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
