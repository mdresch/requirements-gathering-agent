// Context Utilization Modal Component
// filepath: admin-interface/src/components/ContextUtilizationModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, BarChart3, Clock, Database, Cpu, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface ContextUtilizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    metadata?: {
      contextMetrics?: {
        inputTokens: number;
        systemPromptTokens: number;
        userPromptTokens: number;
        projectContextTokens: number;
        templateTokens: number;
        outputTokens: number;
        responseTokens: number;
        totalTokensUsed: number;
        contextWindowSize: number;
        contextUtilizationPercentage: number;
        provider: string;
        model: string;
        generatedAt: Date;
        processingTimeMs: number;
      };
    };
  };
}

interface ContextBreakdown {
  component: string;
  tokens: number;
  percentage: number;
  description: string;
}

export default function ContextUtilizationModal({ isOpen, onClose, document }: ContextUtilizationModalProps) {
  const [contextMetrics, setContextMetrics] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<ContextBreakdown[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && document?.id) {
      fetchContextMetrics();
    }
  }, [isOpen, document?.id]);

  useEffect(() => {
    if (contextMetrics) {
      calculateBreakdown();
      generateRecommendations();
    }
  }, [contextMetrics]);

  const fetchContextMetrics = async () => {
    if (!document?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/v1/context-tracking/documents/${document.id}/metrics`, {
        headers: { 'X-API-Key': 'dev-api-key-123' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContextMetrics(data.data);
      } else {
        console.warn('No context metrics found for document:', document.id);
        setContextMetrics(null);
      }
    } catch (error) {
      console.error('Failed to fetch context metrics:', error);
      setContextMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateBreakdown = () => {
    if (!contextMetrics) return;

    const totalTokens = contextMetrics.totalTokensUsed;
    
    const breakdownData: ContextBreakdown[] = [
      {
        component: 'System Prompt',
        tokens: contextMetrics.systemPromptTokens,
        percentage: Math.round((contextMetrics.systemPromptTokens / totalTokens) * 100),
        description: 'AI instructions and system-level context'
      },
      {
        component: 'User Prompt',
        tokens: contextMetrics.userPromptTokens,
        percentage: Math.round((contextMetrics.userPromptTokens / totalTokens) * 100),
        description: 'Specific user request and instructions'
      },
      {
        component: 'Project Context',
        tokens: contextMetrics.projectContextTokens,
        percentage: Math.round((contextMetrics.projectContextTokens / totalTokens) * 100),
        description: 'Project-specific information and context'
      },
      {
        component: 'Template',
        tokens: contextMetrics.templateTokens,
        percentage: Math.round((contextMetrics.templateTokens / totalTokens) * 100),
        description: 'Document template and structure'
      },
      {
        component: 'Response',
        tokens: contextMetrics.responseTokens,
        percentage: Math.round((contextMetrics.responseTokens / totalTokens) * 100),
        description: 'Generated document content'
      }
    ];

    setBreakdown(breakdownData);
  };

  const generateRecommendations = () => {
    if (!contextMetrics) return;

    const recommendationsList: string[] = [];

    if (contextMetrics.contextUtilizationPercentage > 80) {
      recommendationsList.push('High context utilization detected. Consider optimizing prompts or using a larger context model.');
    }

    if (contextMetrics.contextUtilizationPercentage < 10) {
      recommendationsList.push('Low context utilization. Consider including more relevant context or using a smaller, more cost-effective model.');
    }

    if (contextMetrics.projectContextTokens > contextMetrics.templateTokens * 3) {
      recommendationsList.push('Project context is significantly larger than template. Consider filtering or prioritizing project information.');
    }

    if (contextMetrics.systemPromptTokens > contextMetrics.userPromptTokens) {
      recommendationsList.push('System prompt is larger than user prompt. Consider streamlining system instructions.');
    }

    if (contextMetrics.processingTimeMs > 30000) {
      recommendationsList.push('Long processing time detected. Consider optimizing prompt complexity or using a faster model.');
    }

    if (recommendationsList.length === 0) {
      recommendationsList.push('Context utilization is optimal. No specific recommendations at this time.');
    }

    setRecommendations(recommendationsList);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-600 bg-green-100';
    if (percentage < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage < 30) return { icon: CheckCircle, text: 'Efficient', color: 'text-green-600' };
    if (percentage < 70) return { icon: TrendingUp, text: 'Moderate', color: 'text-yellow-600' };
    return { icon: AlertTriangle, text: 'High Usage', color: 'text-red-600' };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Context Utilization Analysis</h2>
              <p className="text-gray-600">{document.name}</p>
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Context Data...</h3>
              <p className="text-gray-600">Fetching context utilization metrics for this document.</p>
            </div>
          ) : !contextMetrics ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Context Data Available</h3>
              <p className="text-gray-600">This document was generated before context tracking was implemented.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Context Utilization</h3>
                      <div className="text-2xl font-bold text-blue-900">{contextMetrics.contextUtilizationPercentage}%</div>
                    </div>
                    <div className={`p-2 rounded-full ${getUtilizationColor(contextMetrics.contextUtilizationPercentage)}`}>
                      {(() => {
                        const status = getUtilizationStatus(contextMetrics.contextUtilizationPercentage);
                        const Icon = status.icon;
                        return <Icon className={`w-6 h-6 ${status.color}`} />;
                      })()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    {formatNumber(contextMetrics.totalTokensUsed)} / {formatNumber(contextMetrics.contextWindowSize)} tokens
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Processing Time</h3>
                      <div className="text-2xl font-bold text-green-900">{formatTime(contextMetrics.processingTimeMs)}</div>
                    </div>
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    {contextMetrics.provider} • {contextMetrics.model}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-purple-800">Output Generated</h3>
                      <div className="text-2xl font-bold text-purple-900">{formatNumber(contextMetrics.outputTokens)}</div>
                    </div>
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="mt-2 text-sm text-purple-700">
                    {formatNumber(contextMetrics.inputTokens)} input tokens
                  </div>
                </div>
              </div>

              {/* Context Breakdown */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Context Breakdown</h3>
                <div className="space-y-3">
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{item.component}</span>
                          <span className="text-sm text-gray-600">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{item.description}</span>
                          <span className="text-xs text-gray-500">{formatNumber(item.tokens)} tokens</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">System Prompt</span>
                      <span className="font-medium">{formatNumber(contextMetrics.systemPromptTokens)} tokens</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">User Prompt</span>
                      <span className="font-medium">{formatNumber(contextMetrics.userPromptTokens)} tokens</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Project Context</span>
                      <span className="font-medium">{formatNumber(contextMetrics.projectContextTokens)} tokens</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Template</span>
                      <span className="font-medium">{formatNumber(contextMetrics.templateTokens)} tokens</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Input</span>
                      <span>{formatNumber(contextMetrics.inputTokens)} tokens</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Provider</span>
                      <span className="font-medium">{contextMetrics.provider}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium">{contextMetrics.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Context Window</span>
                      <span className="font-medium">{formatNumber(contextMetrics.contextWindowSize)} tokens</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Generated At</span>
                      <span className="font-medium">{new Date(contextMetrics.generatedAt).toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Output Tokens</span>
                      <span>{formatNumber(contextMetrics.outputTokens)} tokens</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Optimization Recommendations
                </h3>
                <div className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-yellow-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
