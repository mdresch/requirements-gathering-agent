/**
 * Document Viewer Modal
 * Displays generated documents with viewing and navigation options
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  FileText,
  Eye,
  ExternalLink,
  Download,
  Copy,
  CheckCircle,
  Calendar,
  User,
  Tag,
  FolderOpen,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  projectId?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
  projectId
}: DocumentViewerModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const handleViewInProject = () => {
    if (document.projectId) {
      // Navigate to the project page and show the document
      router.push(`/projects/${document.projectId}?documentId=${document.id}`);
      onClose();
    } else {
      toast.error('Project information not available');
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleDownloadDocument = () => {
    const blob = new Blob([document.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded successfully!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-6xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">{document.name}</DialogTitle>
                <DialogDescription>
                  Generated from template: {document.templateName || 'Unknown Template'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-1"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* Content Tab */}
              <TabsContent value="content" className="h-full overflow-hidden">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Document Content</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyContent}
                          className="flex items-center space-x-1"
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadDocument}
                          className="flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-full overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border">
                        {document.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="h-full overflow-hidden">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Document Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{document.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Tag className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium">{document.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Generated:</span>
                              <span className="font-medium">{formatDate(document.generatedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Generated by:</span>
                              <span className="font-medium">{document.generatedBy}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Quality Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Quality Score:</span>
                              <Badge variant="secondary">{document.qualityScore}%</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Word Count:</span>
                              <Badge variant="outline">{document.wordCount}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <Badge variant={document.status === 'draft' ? 'secondary' : 'default'}>
                                {document.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Template Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600">Template:</span>
                              <span className="font-medium">{document.templateName}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600">Category:</span>
                              <Badge variant="secondary">{document.category}</Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600">Framework:</span>
                              <Badge variant="outline">{document.framework}</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="h-full overflow-hidden">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Available Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* View in Project */}
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                            <span>View in Project</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Navigate to the project where this document is stored and view it in context with other project documents.
                          </p>
                          <Button
                            onClick={handleViewInProject}
                            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                            disabled={!document.projectId}
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Go to Project</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          {!document.projectId && (
                            <p className="text-xs text-red-600 mt-2">
                              Project information not available
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Download Options */}
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Download className="w-5 h-5 text-green-600" />
                            <span>Download</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Download the document in various formats for offline use or sharing.
                          </p>
                          <div className="space-y-2">
                            <Button
                              onClick={handleDownloadDocument}
                              variant="outline"
                              className="w-full flex items-center space-x-2"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Download as Markdown</span>
                            </Button>
                            <Button
                              onClick={handleCopyContent}
                              variant="outline"
                              className="w-full flex items-center space-x-2"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy to Clipboard</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('content')}
                          className="flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Content</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Details</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {document.projectId && (
            <Button
              onClick={handleViewInProject}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View in Project</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
