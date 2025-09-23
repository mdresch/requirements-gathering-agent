// Quality Report Modal Component
// filepath: admin-interface/src/components/QualityReportModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Target, FileText, Star, RefreshCw, Download } from 'lucide-react';
import { apiClient, getDocumentQuality, assessDocumentQuality } from '../lib/api';

interface QualityAssessmentResult {
  overallScore: number;
  dimensionScores: {
    structure: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    relevance: number;
    professionalQuality: number;
    standardsCompliance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  assessmentDate: string;
  assessmentVersion: string;
}

interface QualityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  documentType: string;
}

export default function QualityReportModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentName, 
  documentType 
}: QualityReportModalProps) {
  const [qualityData, setQualityData] = useState<QualityAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadQualityData();
    }
  }, [isOpen, documentId]);

  const loadQualityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getDocumentQuality(documentId);
      
      if (response.success) {
        setQualityData(response.data);
      } else {
        setError('Failed to load quality data');
      }
    } catch (error) {
      console.error('Error loading quality data:', error);
      setError('Error loading quality assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassess = async () => {
    try {
      setIsAssessing(true);
      setError(null);
      
      const response = await assessDocumentQuality(documentId);
      
      if (response.success) {
        setQualityData(response.data.qualityResult);
      } else {
        setError('Failed to reassess document quality');
      }
    } catch (error) {
      console.error('Error reassessing quality:', error);
      setError('Error reassessing document quality');
    } finally {
      setIsAssessing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Acceptable';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'structure': return <FileText className="w-4 h-4" />;
      case 'completeness': return <CheckCircle className="w-4 h-4" />;
      case 'accuracy': return <Target className="w-4 h-4" />;
      case 'consistency': return <TrendingUp className="w-4 h-4" />;
      case 'relevance': return <Star className="w-4 h-4" />;
      case 'professionalQuality': return <BarChart3 className="w-4 h-4" />;
      case 'standardsCompliance': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      structure: 'Structure & Organization',
      completeness: 'Completeness',
      accuracy: 'Accuracy & Precision',
      consistency: 'Consistency',
      relevance: 'Context Relevance',
      professionalQuality: 'Professional Quality',
      standardsCompliance: 'Standards Compliance'
    };
    return labels[dimension] || dimension;
  };

  const handleExportReport = () => {
    if (!qualityData) return;

    const reportContent = `# Quality Assessment Report

## Document Information
- **Document Name**: ${documentName}
- **Document Type**: ${documentType}
- **Assessment Date**: ${new Date(qualityData.assessmentDate).toLocaleDateString()}
- **Assessment Version**: ${qualityData.assessmentVersion}

## Overall Quality Score
**${qualityData.overallScore}%** - ${getScoreLabel(qualityData.overallScore)}

## Dimension Scores
${Object.entries(qualityData.dimensionScores).map(([dimension, score]) => 
  `- **${getDimensionLabel(dimension)}**: ${score}% - ${getScoreLabel(score)}`
).join('\n')}

## Strengths
${qualityData.strengths.map(strength => `- ✓ ${strength}`).join('\n')}

## Areas for Improvement
${qualityData.weaknesses.map(weakness => `- ✗ ${weakness}`).join('\n')}

## Recommendations
${qualityData.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Report generated on ${new Date().toLocaleString()}*`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.replace(/\s+/g, '-')}-quality-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quality Assessment Report</h2>
              <p className="text-sm text-gray-600">{documentName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportReport}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Report"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 text-sm">Loading quality assessment...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 text-center mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={loadQualityData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleReassess}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Assessment</span>
                </button>
              </div>
            </div>
          ) : qualityData ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Overall Quality Score</h3>
                    <p className="text-sm text-gray-600 mt-1">Comprehensive quality assessment</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(qualityData.overallScore).split(' ')[0]}`}>
                      {qualityData.overallScore}%
                    </div>
                    <div className={`text-sm font-medium ${getScoreColor(qualityData.overallScore)} px-2 py-1 rounded-full inline-block mt-1`}>
                      {getScoreLabel(qualityData.overallScore)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimension Scores */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Dimensions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(qualityData.dimensionScores).map(([dimension, score]) => (
                    <div key={dimension} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDimensionIcon(dimension)}
                          <span className="font-medium text-gray-900">
                            {getDimensionLabel(dimension)}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(score)} px-2 py-1 rounded-full`}>
                          {getScoreLabel(score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 80 ? 'bg-green-500' :
                            score >= 70 ? 'bg-blue-500' :
                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm text-gray-600 mt-1">
                        {score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {qualityData.strengths.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Strengths
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {qualityData.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {qualityData.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    Areas for Improvement
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {qualityData.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-orange-800">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {qualityData.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    Recommendations
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {qualityData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Assessment Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Assessment Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(qualityData.assessmentDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Assessment Version:</span>
                    <span className="ml-2 font-medium">{qualityData.assessmentVersion}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">No quality assessment available</p>
              <button
                onClick={handleReassess}
                disabled={isAssessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isAssessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isAssessing ? 'Assessing...' : 'Assess Quality'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {qualityData && `Last assessed: ${new Date(qualityData.assessmentDate).toLocaleString()}`}
          </div>
          <div className="flex space-x-3">
            {qualityData && (
              <button
                onClick={handleReassess}
                disabled={isAssessing}
                className="px-4 py-2 text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isAssessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{isAssessing ? 'Reassessing...' : 'Reassess'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
