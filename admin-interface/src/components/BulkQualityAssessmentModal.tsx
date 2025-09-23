// Bulk Quality Assessment Modal Component
// filepath: admin-interface/src/components/BulkQualityAssessmentModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, AlertTriangle, Clock, BarChart3, FileText } from 'lucide-react';
import { reassessProjectQuality } from '../lib/api';

interface BulkAssessmentResult {
  totalDocuments: number;
  successfulAssessments: number;
  failedAssessments: number;
  updatedDocuments: Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    newQualityScore: number;
  }>;
  errors: Array<{
    documentId: string;
    documentName: string;
    error: string;
  }>;
}

interface BulkQualityAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onAssessmentComplete?: (result: BulkAssessmentResult) => void;
}

export default function BulkQualityAssessmentModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName,
  onAssessmentComplete
}: BulkQualityAssessmentModalProps) {
  const [isAssessing, setIsAssessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<string>('');
  const [result, setResult] = useState<BulkAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setProgress(0);
      setCurrentDocument('');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  const handleBulkAssessment = async () => {
    try {
      setIsAssessing(true);
      setProgress(0);
      setCurrentDocument('');
      setError(null);
      setResult(null);

      // Start the bulk assessment
      const response = await reassessProjectQuality(projectId);
      
      if (response.success) {
        setResult(response.data);
        setProgress(100);
        onAssessmentComplete?.(response.data);
      } else {
        setError(response.message || 'Failed to assess document quality');
      }
    } catch (error) {
      console.error('Error in bulk quality assessment:', error);
      setError(`Failed to assess document quality: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bulk Quality Assessment</h2>
              <p className="text-sm text-gray-600">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!isAssessing && !result && !error && (
            <div className="space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Quality Assessment for All Documents
                    </h3>
                    <p className="text-blue-800 mb-4">
                      This will assess the quality of all documents in the project using our comprehensive 
                      quality scoring algorithm across 7 dimensions:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Structure & Organization</li>
                      <li>• Completeness</li>
                      <li>• Accuracy & Precision</li>
                      <li>• Consistency</li>
                      <li>• Context Relevance</li>
                      <li>• Professional Quality</li>
                      <li>• Standards Compliance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Comprehensive Analysis</h4>
                      <p className="text-sm text-gray-600">Detailed quality metrics for all documents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Improvement Insights</h4>
                      <p className="text-sm text-gray-600">Actionable recommendations for each document</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Quality Tracking</h4>
                      <p className="text-sm text-gray-600">Baseline quality scores for future comparisons</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Standards Compliance</h4>
                      <p className="text-sm text-gray-600">Framework adherence validation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Processing Time</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Quality assessment may take several minutes depending on the number of documents. 
                      Please keep this window open during processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAssessing && (
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Assessing Document Quality
                </h3>
                <p className="text-gray-600">
                  Processing documents with comprehensive quality analysis...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Progress Info */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{progress}% Complete</span>
                <span>Quality Assessment in Progress</span>
              </div>

              {/* Current Document */}
              {currentDocument && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Currently Processing:</p>
                      <p className="text-sm text-gray-600">{currentDocument}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Assessment Status</p>
                    <p className="text-sm text-blue-700">
                      Analyzing document structure, content quality, and standards compliance...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quality Assessment Complete
                </h3>
                <p className="text-gray-600">
                  Successfully assessed {result.successfulAssessments} of {result.totalDocuments} documents
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totalDocuments}</div>
                  <div className="text-sm text-blue-800">Total Documents</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.successfulAssessments}</div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{result.failedAssessments}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </div>

              {/* Updated Documents */}
              {result.updatedDocuments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Updated Documents</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.updatedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.documentName}</p>
                            <p className="text-xs text-gray-600">{doc.documentType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getScoreColor(doc.newQualityScore)}`}>
                            {doc.newQualityScore}%
                          </span>
                          <p className="text-xs text-gray-600 mt-1">{getScoreLabel(doc.newQualityScore)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Failed Assessments</h3>
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">{error.documentName}</p>
                            <p className="text-xs text-red-700">{error.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Failed</h3>
              <p className="text-red-600 text-center mb-4">{error}</p>
              <button
                onClick={handleBulkAssessment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {result ? `Completed: ${new Date().toLocaleString()}` : 'Ready to assess document quality'}
          </div>
          <div className="flex space-x-3">
            {!isAssessing && !result && !error && (
              <button
                onClick={handleBulkAssessment}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Start Assessment</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
