'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Download as DownloadIcon,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface AuditTrailEntry {
  _id: string;
  documentId: string;
  documentName: string;
  documentType: string;
  projectId: string;
  projectName: string;
  action: string;
  actionDescription: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  contextData?: {
    aiProvider?: string;
    aiModel?: string;
    tokensUsed?: number;
    qualityScore?: number;
    generationTime?: number;
    templateUsed?: string;
    framework?: string;
    dependencies?: string[];
    optimizationStrategy?: string;
    contextUtilization?: number;
  };
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'document' | 'quality' | 'user' | 'system' | 'ai';
  notes?: string;
  tags?: string[];
  relatedDocumentIds?: string[];
}

interface AuditTrailStats {
  totalEntries: number;
  entriesByAction: Record<string, number>;
  entriesByCategory: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  entriesByUser: Record<string, number>;
  entriesByDay: Record<string, number>;
  averageQualityScore?: number;
  totalTokensUsed?: number;
  mostActiveUsers: Array<{ userName: string; count: number }>;
  recentActivity: AuditTrailEntry[];
}

interface DocumentAuditTrailProps {
  documentId?: string;
  projectId?: string;
  userId?: string;
}

const DocumentAuditTrail: React.FC<DocumentAuditTrailProps> = ({
  documentId,
  projectId,
  userId
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>([]);
  const [stats, setStats] = useState<AuditTrailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    action: 'all',
    category: 'all',
    severity: 'all',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch audit trail data
  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(documentId && { documentId }),
        ...(projectId && { projectId }),
        ...(userId && { userId }),
        ...(filters.action && filters.action !== 'all' && { action: filters.action }),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.severity && filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`/api/v1/audit-trail/simple?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setAuditEntries(data.data.entries);
        setPagination(data.data.pagination);
      } else {
        throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      toast.error('Failed to fetch audit trail data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit trail stats
  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(documentId && { documentId }),
        ...(projectId && { projectId }),
        ...(userId && { userId })
      });

      const response = await fetch(`/api/v1/audit-trail/simple/analytics?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching audit trail stats:', error);
      toast.error('Failed to fetch audit trail statistics');
    }
  };

  useEffect(() => {
    fetchAuditTrail();
    fetchStats();
  }, [documentId, projectId, userId, filters, pagination.page, pagination.limit]);

  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'downloaded':
        return <DownloadIcon className="h-4 w-4 text-purple-600" />;
      case 'quality_assessed':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...(documentId && { documentId }),
        ...(projectId && { projectId }),
        ...(userId && { userId }),
        ...(filters.action && filters.action !== 'all' && { action: filters.action }),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.severity && filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      try {
        const response = await fetch(`/api/v1/audit-trail/export?${queryParams}`);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Audit trail exported successfully');
        } else {
          throw new Error('Export failed');
        }
      } catch (apiError) {
        // Fallback: create CSV from current audit entries
        console.log('API not available, creating CSV from current data');
        
        const csvHeaders = [
          'Timestamp',
          'Document ID',
          'Document Name',
          'Document Type',
          'Project ID',
          'Project Name',
          'Action',
          'Action Description',
          'User Name',
          'User Role',
          'Severity',
          'Category',
          'AI Provider',
          'AI Model',
          'Tokens Used',
          'Quality Score',
          'Notes'
        ];

        const csvRows = auditEntries.map(entry => [
          entry.timestamp,
          entry.documentId,
          entry.documentName,
          entry.documentType,
          entry.projectId,
          entry.projectName,
          entry.action,
          entry.actionDescription,
          entry.userName || '',
          entry.userRole || '',
          entry.severity,
          entry.category,
          entry.contextData?.aiProvider || '',
          entry.contextData?.aiModel || '',
          entry.contextData?.tokensUsed || '',
          entry.contextData?.qualityScore || '',
          entry.notes || ''
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Audit trail exported successfully (mock data)');
      }
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      toast.error('Failed to export audit trail');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading audit trail...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalEntries || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.averageQualityScore ? `${stats.averageQualityScore.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalTokensUsed ? stats.totalTokensUsed.toLocaleString() : 'N/A'}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.mostActiveUsers?.length || 0}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search entries..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="downloaded">Downloaded</SelectItem>
                  <SelectItem value="quality_assessed">Quality Assessed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ action: 'all', category: 'all', severity: 'all', searchTerm: '', startDate: '', endDate: '' })}
            >
              Clear Filters
            </Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Audit Trail</span>
            </span>
            <div className="text-sm text-gray-500">
              {pagination.total} entries • Page {pagination.page} of {pagination.pages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <div key={entry._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                {/* Entry Header */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleEntryExpansion(entry._id)}
                >
                  <div className="flex items-center space-x-3">
                    {getActionIcon(entry.action)}
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.actionDescription}</h4>
                      <p className="text-sm text-gray-600">
                        {entry.documentName} • {entry.projectName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-sm">
                      <div className="flex items-center space-x-2">
                        {entry.userName && (
                          <span className="text-gray-600">{entry.userName}</span>
                        )}
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={getSeverityColor(entry.severity)}>
                          {getSeverityIcon(entry.severity)}
                          <span className="ml-1">{entry.severity}</span>
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {entry.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {expandedEntries.has(entry._id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEntries.has(entry._id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Information */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Document ID:</span>
                            <span className="font-mono text-xs">{entry.documentId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Document Type:</span>
                            <span>{entry.documentType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Action:</span>
                            <span className="capitalize">{entry.action.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timestamp:</span>
                            <span>{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* User Information */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">User Information</h5>
                        <div className="space-y-2 text-sm">
                          {entry.userName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span>{entry.userName}</span>
                            </div>
                          )}
                          {entry.userRole && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Role:</span>
                              <span>{entry.userRole}</span>
                            </div>
                          )}
                          {entry.userEmail && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span>{entry.userEmail}</span>
                            </div>
                          )}
                          {entry.ipAddress && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">IP Address:</span>
                              <span className="font-mono text-xs">{entry.ipAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Context Data */}
                      {entry.contextData && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">AI Context</h5>
                          <div className="space-y-2 text-sm">
                            {entry.contextData.aiProvider && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">AI Provider:</span>
                                <span>{entry.contextData.aiProvider}</span>
                              </div>
                            )}
                            {entry.contextData.aiModel && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">AI Model:</span>
                                <span>{entry.contextData.aiModel}</span>
                              </div>
                            )}
                            {entry.contextData.tokensUsed && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tokens Used:</span>
                                <span>{entry.contextData.tokensUsed.toLocaleString()}</span>
                              </div>
                            )}
                            {entry.contextData.qualityScore && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quality Score:</span>
                                <span>{entry.contextData.qualityScore}%</span>
                              </div>
                            )}
                            {entry.contextData.templateUsed && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Template:</span>
                                <span>{entry.contextData.templateUsed}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Changes */}
                      {(entry.previousValues || entry.newValues) && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Changes</h5>
                          <div className="space-y-2 text-sm">
                            {entry.changedFields && entry.changedFields.length > 0 && (
                              <div>
                                <span className="text-gray-600">Changed Fields:</span>
                                <div className="mt-1">
                                  {entry.changedFields.map((field, index) => (
                                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Tags</h5>
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAuditTrail;
