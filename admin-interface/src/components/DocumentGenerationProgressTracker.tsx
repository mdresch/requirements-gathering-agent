/**
 * Document Generation Progress Tracker Component
 * 
 * This component shows detailed progress through the 10 steps of document generation
 * with real-time updates and visual feedback.
 */

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  details?: string;
  error?: string;
}

export interface DocumentGenerationProgressProps {
  isVisible: boolean;
  currentStep: number;
  steps: GenerationStep[];
  overallProgress: number;
  estimatedTimeRemaining?: number;
  onCancel?: () => void;
  onRetry?: () => void;
}

const DocumentGenerationProgressTracker: React.FC<DocumentGenerationProgressProps> = ({
  isVisible,
  currentStep,
  steps,
  overallProgress,
  estimatedTimeRemaining,
  onCancel,
  onRetry
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return (
          <div className="relative">
            <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
          </div>
        );
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepStatusColor = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'skipped':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Generating Document
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {steps.length} • {overallProgress.toFixed(1)}% complete
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {estimatedTimeRemaining && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Est. time remaining:</span> {formatTimeRemaining(estimatedTimeRemaining)}
                </div>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  expandedSteps.has(step.id) ? 'shadow-md' : ''
                } ${getStepStatusColor(step)}`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStepExpansion(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {index + 1}. {step.name}
                        </span>
                        {step.status === 'in-progress' && (
                          <span className="text-xs text-blue-600 font-medium">
                            {step.progress}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {step.duration && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(step.duration)}
                      </span>
                    )}
                    <div className="text-gray-400">
                      {expandedSteps.has(step.id) ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSteps.has(step.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {/* Step Progress Bar */}
                    {step.status === 'in-progress' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Step Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${step.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Step Details */}
                    {step.details && (
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Details:</span> {step.details}
                      </div>
                    )}

                    {/* Error Information */}
                    {step.error && (
                      <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                        <span className="font-medium">Error:</span> {step.error}
                      </div>
                    )}

                    {/* Timing Information */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      {step.startTime && (
                        <span>Started: {step.startTime.toLocaleTimeString()}</span>
                      )}
                      {step.endTime && (
                        <span>Completed: {step.endTime.toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
            </div>
            {steps.some(s => s.status === 'error') && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Retry Failed Steps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerationProgressTracker;
