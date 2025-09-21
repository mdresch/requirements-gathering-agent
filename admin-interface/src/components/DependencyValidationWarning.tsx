'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info, ArrowRight, Clock, Users, FileText } from 'lucide-react';
import { DependencyValidationResult, DocumentDependency } from '@/lib/documentDependencies';

interface DependencyValidationWarningProps {
  validation: DependencyValidationResult;
  templateName: string;
  onGenerateMissing?: (missingDeps: DocumentDependency[]) => void;
  onContinue?: () => void;
}

export default function DependencyValidationWarning({
  validation,
  templateName,
  onGenerateMissing,
  onContinue
}: DependencyValidationWarningProps) {
  if (validation.isValid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              ✅ All Dependencies Available
            </h3>
            <p className="text-sm text-green-700 mt-1">
              All required context documents are available. You can proceed with generating the {templateName}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalMissing = validation.missingDependencies.filter(dep => dep.priority === 'critical');
  const highMissing = validation.missingDependencies.filter(dep => dep.priority === 'high');
  const mediumMissing = validation.missingDependencies.filter(dep => dep.priority === 'medium');

  return (
    <div className="space-y-4">
      {/* Critical Dependencies Warning */}
      {criticalMissing.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                🚨 Critical Dependencies Missing
              </h3>
              <p className="text-sm text-red-700 mb-3">
                The following required foundation documents must be generated before creating the {templateName}:
              </p>
              
              <div className="space-y-2 mb-4">
                {criticalMissing.map((dep) => (
                  <div key={dep.templateId} className="bg-white border border-red-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          <h4 className="text-sm font-medium text-red-800">{dep.templateName}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {dep.priority}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">{dep.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-red-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{dep.pmbokKnowledgeArea}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{dep.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {onGenerateMissing && (
                <button
                  onClick={() => onGenerateMissing(criticalMissing)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Required Documents
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* High Priority Dependencies Warning */}
      {highMissing.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800 mb-2">
                📋 Recommended Supporting Documents
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                These high-priority documents will significantly enhance the quality of your {templateName}:
              </p>
              
              <div className="space-y-2 mb-4">
                {highMissing.map((dep) => (
                  <div key={dep.templateId} className="bg-white border border-orange-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <h4 className="text-sm font-medium text-orange-800">{dep.templateName}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {dep.priority}
                          </span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">{dep.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-orange-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{dep.pmbokKnowledgeArea}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{dep.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {onGenerateMissing && (
                <button
                  onClick={() => onGenerateMissing(highMissing)}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Recommended Documents
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medium Priority Dependencies Info */}
      {mediumMissing.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                💡 Optional Supporting Documents
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                These documents can provide additional context for your {templateName}:
              </p>
              
              <div className="space-y-2">
                {mediumMissing.map((dep) => (
                  <div key={dep.templateId} className="bg-white border border-blue-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">{dep.templateName}</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dep.priority}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">{dep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {validation.recommendations.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            📚 PMBOK Best Practice Recommendations
          </h3>
          <div className="space-y-1">
            {validation.recommendations.map((rec, index) => (
              <p key={index} className="text-sm text-gray-700">
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Continue Option */}
      {onContinue && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Continue Without Dependencies
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                You can proceed to generate the {templateName} without the recommended context documents, 
                but this may result in lower quality output.
              </p>
              <button
                onClick={onContinue}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


