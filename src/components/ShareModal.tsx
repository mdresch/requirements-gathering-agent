// Share Modal Component
// filepath: admin-interface/src/components/ShareModal.tsx

'use client';

import { useState } from 'react';
import { X, Copy, Link, Download, Printer, Mail, FileText, Check, Share2 } from 'lucide-react';

interface GeneratedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  category: string;
  framework: string;
  generatedAt: string;
  generatedBy: string;
  qualityScore: number;
  wordCount: number;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'deleted';
  deletedAt?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GeneratedDocument | null;
  projectName: string;
  projectId: string;
  onDownload?: (doc: GeneratedDocument) => void;
  onPrint?: (doc: GeneratedDocument) => void;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  document, 
  projectName, 
  projectId,
  onDownload,
  onPrint 
}: ShareModalProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWebShare = async () => {
    try {
      const shareContent = `# ${document.name}

**Document Details:**
- Type: ${document.type}
- Category: ${document.category}
- Framework: ${document.framework}
- Generated: ${new Date(document.generatedAt).toLocaleDateString()}
- Quality Score: ${document.qualityScore}%
- Word Count: ${document.wordCount}

---

${document.content}

---

*Shared from ${projectName} project*`;

      if (navigator.share) {
        await navigator.share({
          title: document.name,
          text: shareContent,
        });
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (error) {
      console.error('Web share failed:', error);
      // Fallback to copying full content
      handleCopy(document.content, 'full-content');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Document: ${document.name}`);
    const body = encodeURIComponent(`Hi,

I wanted to share this document with you:

Document: ${document.name}
Project: ${projectName}
Type: ${document.type}
Category: ${document.category}
Generated: ${new Date(document.generatedAt).toLocaleDateString()}

You can view it at: ${window.location.origin}/projects/${projectId}/documents/${document.id}

Best regards`);
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const shareOptions = [
    {
      id: 'web-share',
      title: 'Share via System',
      description: 'Use your device\'s built-in sharing options',
      icon: <Share2 className="w-5 h-5" />,
      action: handleWebShare,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'copy-content',
      title: 'Copy Document Content',
      description: 'Copy the full document content to clipboard',
      icon: <Copy className="w-5 h-5" />,
      action: () => handleCopy(document.content, 'content'),
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      id: 'copy-link',
      title: 'Copy Document Link',
      description: 'Copy a direct link to this document',
      icon: <Link className="w-5 h-5" />,
      action: () => handleCopy(`${window.location.origin}/projects/${projectId}/documents/${document.id}`, 'link'),
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'email',
      title: 'Share via Email',
      description: 'Open your email client with document details',
      icon: <Mail className="w-5 h-5" />,
      action: handleEmailShare,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    },
    {
      id: 'download',
      title: 'Download as File',
      description: 'Download the document as a markdown file',
      icon: <Download className="w-5 h-5" />,
      action: () => onDownload?.(document),
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
    },
    {
      id: 'print',
      title: 'Print Document',
      description: 'Open print dialog for this document',
      icon: <Printer className="w-5 h-5" />,
      action: () => onPrint?.(document),
      color: 'text-gray-600 bg-gray-50 hover:bg-gray-100'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Document</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
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
          {/* Document Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{document.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{document.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Framework:</span>
                <span className="ml-2 font-medium">{document.framework}</span>
              </div>
              <div>
                <span className="text-gray-600">Quality:</span>
                <span className="ml-2 font-medium">{document.qualityScore}%</span>
              </div>
              <div>
                <span className="text-gray-600">Word Count:</span>
                <span className="ml-2 font-medium">{document.wordCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Generated:</span>
                <span className="ml-2 font-medium">{new Date(document.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  className={`p-4 rounded-lg border border-gray-200 text-left transition-colors ${option.color}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{option.title}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {copiedItem === option.id && (
                      <div className="flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Status */}
          {copiedItem && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {copiedItem === 'content' && 'Document content copied to clipboard!'}
                  {copiedItem === 'link' && 'Document link copied to clipboard!'}
                  {copiedItem === 'full-content' && 'Full document copied to clipboard!'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
