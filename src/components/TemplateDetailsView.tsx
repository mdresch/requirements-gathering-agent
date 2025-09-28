'use client';

import { Template } from '@/types/template';
import { formatRelativeTime } from '@/lib/utils';
import { FileText, Tag, Calendar, Code, Settings, Eye, Copy, Download, Key } from 'lucide-react';
import { useState } from 'react';

interface TemplateDetailsViewProps {
  template: Template;
}

export default function TemplateDetailsView({ template }: TemplateDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'metadata'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'content', label: 'Content', icon: Code },
    { id: 'metadata', label: 'Metadata', icon: Settings }
  ];

  const handleCopyContent = () => {
    navigator.clipboard.writeText(template.content);
  };

  const handleDownloadContent = () => {
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{template.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
            
            {/* Template Status and Info */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {template.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                v{template.metadata?.version || template.version || '1.0.0'}
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Document Key and Generation Function */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Document Key:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border">
                  {template.documentKey || 'Not set'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Generation Function:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border">
                  {template.generationFunction || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Template Fields */}
            {template.contextRequirements && Array.isArray(template.contextRequirements) && template.contextRequirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {template.contextRequirements.map((field: string, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-2"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">{field}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {template.tags && Array.isArray(template.tags) && template.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Context Requirements */}
            {template.contextRequirements && Array.isArray(template.contextRequirements) && template.contextRequirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Context Requirements</h3>
                <div className="space-y-2">
                  {template.contextRequirements.map((req: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Created</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatRelativeTime(template.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Last Updated</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatRelativeTime(template.updatedAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Document Key</span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                    {template.documentKey || 'Not set'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Generation Function</span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                    {template.generationFunction || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Template Content</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyContent}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button
                  onClick={handleDownloadContent}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-x-auto">
                {template.content}
              </pre>
            </div>

            {/* AI Instructions */}
            {template.aiInstructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Instructions</h3>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{template.aiInstructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Metadata</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Framework</label>
                    <p className="text-sm text-gray-900">{template.metadata?.framework || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complexity</label>
                    <p className="text-sm text-gray-900 capitalize">{template.metadata?.complexity || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                    <p className="text-sm text-gray-900">{template.metadata?.estimatedTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Version</label>
                    <p className="text-sm text-gray-900">{template.metadata?.version || template.version || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <p className="text-sm text-gray-900">{template.metadata?.author || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h3>
                {template.metadata?.dependencies && Array.isArray(template.metadata.dependencies) && template.metadata.dependencies.length > 0 ? (
                  <div className="space-y-2">
                    {template.metadata.dependencies.map((dep: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{dep}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No dependencies specified</p>
                )}
              </div>
            </div>

            {/* Template Variables */}
            {template.variables && Object.keys(template.variables).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Variables</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 font-mono">
                    {JSON.stringify(template.variables, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


