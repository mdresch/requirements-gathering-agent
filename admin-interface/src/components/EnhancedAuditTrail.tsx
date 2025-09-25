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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Users,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface EnhancedAuditTrailEntry {
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
  
  // Enhanced data
  complianceMetrics?: {
    standardType: string;
    score: number;
    previousScore?: number;
    changePercentage?: number;
    trendDirection?: string;
  };
  
  dataQuality?: {
    qualityScore: number;
    completenessScore: number;
    accuracyScore: number;
    consistencyScore: number;
    issuesFound: number;
  };
  
  realTimeContext?: {
    sessionId: string;
    userAgent: string;
    ipAddress: string;
    component: string;
    action: string;
    duration?: number;
  };
  
  workflowContext?: {
    workflowId: string;
    workflowName: string;
    status: string;
    assignedTo?: string;
    dueDate?: Date;
  };
  
  alertContext?: {
    alertId: string;
    alertType: string;
    severity: string;
    resolved: boolean;
  };
}

interface AuditTrailAnalytics {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  entriesByAction: Record<string, number>;
  complianceScoreTrends: {
    standardType: string;
    currentScore: number;
    previousScore: number;
    changePercentage: number;
    trendDirection: string;
  }[];
  dataQualityTrends: {
    date: Date;
    overallScore: number;
    completenessScore: number;
    accuracyScore: number;
    issuesFound: number;
  }[];
  userActivitySummary: {
    userId: string;
    userName: string;
    totalActions: number;
    lastActivity: Date;
    topActions: string[];
    complianceScore: number;
  }[];
  systemHealth: {
    averageResponseTime: number;
    errorRate: number;
    activeUsers: number;
    systemUptime: number;
  };
}

interface EnhancedAuditTrailProps {
  documentId?: string;
  projectId?: string;
  userId?: string;
}

const EnhancedAuditTrail: React.FC<EnhancedAuditTrailProps> = ({
  documentId,
  projectId,
  userId
}) => {
  const [auditEntries, setAuditEntries] = useState<EnhancedAuditTrailEntry[]>([]);
  const [analytics, setAnalytics] = useState<AuditTrailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<'entries' | 'analytics' | 'compliance' | 'users'>('entries');
  const [filters, setFilters] = useState({
    action: 'all',
    category: 'all',
    severity: 'all',
    standardType: 'all',
    searchTerm: '',
    startDate: '',
    endDate: '',
    includeCompliance: true,
    includeQuality: true,
    includeRealTime: true,
    includeWorkflows: true,
    includeAlerts: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch enhanced audit trail data
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
        ...(filters.standardType && filters.standardType !== 'all' && { standardType: filters.standardType }),
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        includeCompliance: filters.includeCompliance.toString(),
        includeQuality: filters.includeQuality.toString(),
        includeRealTime: filters.includeRealTime.toString(),
        includeWorkflows: filters.includeWorkflows.toString(),
        includeAlerts: filters.includeAlerts.toString()
      });

      const response = await fetch(`http://localhost:3002/api/v1/audit-trail/enhanced?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setAuditEntries(result.data.entries);
        setAnalytics(result.data.analytics);
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination.total,
          pages: result.data.pagination.pages
        }));
      } else {
        toast.error('Failed to fetch audit trail data');
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      toast.error('Error fetching audit trail data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditTrail();
  }, [pagination.page, filters]);

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'quality': return <Shield className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'system': return <Activity className="w-4 h-4" />;
      case 'ai': return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trendDirection?: string) => {
    switch (trendDirection) {
      case 'IMPROVING': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'DECLINING': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'STABLE': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportData = async (format: 'json' | 'csv' | 'xlsx') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...(projectId && { projectId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`http://localhost:3002/api/v1/audit-trail/enhanced/export?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Audit trail exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export audit trail');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting audit trail');
    }
  };

  const renderAnalyticsView = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEntries}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.systemHealth.activeUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.systemHealth.systemUptime}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.systemHealth.errorRate.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.complianceScoreTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{trend.standardType}</Badge>
                    <span className="font-medium">{trend.currentScore}%</span>
                    {getTrendIcon(trend.trendDirection)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Data Quality Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dataQualityTrends.map((trend, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{new Date(trend.date).toLocaleDateString()}</span>
                    <span className="text-sm text-muted-foreground">{trend.issuesFound} issues</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>Overall: {trend.overallScore}%</div>
                    <div>Completeness: {trend.completenessScore}%</div>
                    <div>Accuracy: {trend.accuracyScore}%</div>
                    <div>Consistency: {'consistencyScore' in trend ? (trend as any).consistencyScore : 'N/A'}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.userActivitySummary.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.totalActions} actions • Last: {formatRelativeTime(user.lastActivity)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.complianceScore}%</div>
                    <div className="text-sm text-muted-foreground">Compliance</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComplianceView = () => {
    const complianceEntries = auditEntries.filter(entry => 
      entry.category === 'quality' || 
      entry.action.includes('compliance') ||
      entry.action.includes('quality') ||
      entry.complianceMetrics ||
      entry.dataQuality
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Compliance Audit Events</h3>
          <Badge variant="outline">{complianceEntries.length} events</Badge>
        </div>
        
        {complianceEntries.map((entry) => (
          <Card key={entry._id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(entry.category)}
                  <div>
                    <h4 className="font-medium">{entry.documentName}</h4>
                    <p className="text-sm text-muted-foreground">{entry.actionDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(entry.severity)}>
                    {entry.severity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            {entry.complianceMetrics && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">Compliance Score</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{entry.complianceMetrics.score}%</span>
                      {getTrendIcon(entry.complianceMetrics.trendDirection)}
                      <span className="text-sm">
                        {entry.complianceMetrics.standardType}
                      </span>
                    </div>
                  </div>
                  {entry.dataQuality && (
                    <div>
                      <div className="text-sm font-medium text-blue-900">Data Quality</div>
                      <div className="text-lg font-bold">{entry.dataQuality.qualityScore}%</div>
                      <div className="text-sm text-blue-700">
                        {entry.dataQuality.issuesFound} issues found
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderEntriesView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading audit trail...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {auditEntries.map((entry) => (
          <Card key={entry._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(entry.category)}
                  <div>
                    <h4 className="font-medium">{entry.documentName}</h4>
                    <p className="text-sm text-muted-foreground">{entry.actionDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(entry.severity)}>
                    {entry.severity}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEntryExpansion(entry._id)}
                  >
                    {expandedEntries.has(entry._id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>By: {entry.userName || 'System'}</span>
                  <span>Project: {entry.projectName}</span>
                  <span>{formatRelativeTime(entry.timestamp)}</span>
                </div>
                {entry.complianceMetrics && (
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>{entry.complianceMetrics.score}%</span>
                  </div>
                )}
              </div>

              {expandedEntries.has(entry._id) && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Compliance Metrics */}
                  {entry.complianceMetrics && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Compliance Metrics</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Standard: {entry.complianceMetrics.standardType}</div>
                        <div>Score: {entry.complianceMetrics.score}%</div>
                        {entry.complianceMetrics.changePercentage && (
                          <div className="col-span-2">
                            Change: {entry.complianceMetrics.changePercentage > 0 ? '+' : ''}
                            {entry.complianceMetrics.changePercentage.toFixed(1)}%
                            {getTrendIcon(entry.complianceMetrics.trendDirection)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Quality */}
                  {entry.dataQuality && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Data Quality</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Overall: {entry.dataQuality.qualityScore}%</div>
                        <div>Completeness: {entry.dataQuality.completenessScore}%</div>
                        <div>Accuracy: {entry.dataQuality.accuracyScore}%</div>
                        <div>Issues: {entry.dataQuality.issuesFound}</div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Context */}
                  {entry.realTimeContext && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-2">Session Context</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Component: {entry.realTimeContext.component}</div>
                        <div>Action: {entry.realTimeContext.action}</div>
                        {entry.realTimeContext.duration && (
                          <div>Duration: {entry.realTimeContext.duration}ms</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Workflow Context */}
                  {entry.workflowContext && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h5 className="font-medium text-orange-900 mb-2">Workflow Context</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Workflow: {entry.workflowContext.workflowName}</div>
                        <div>Status: {entry.workflowContext.status}</div>
                        {entry.workflowContext.assignedTo && (
                          <div>Assigned: {entry.workflowContext.assignedTo}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alert Context */}
                  {entry.alertContext && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h5 className="font-medium text-red-900 mb-2">Alert Context</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Type: {entry.alertContext.alertType}</div>
                        <div>Severity: {entry.alertContext.severity}</div>
                        <div>Status: {entry.alertContext.resolved ? 'Resolved' : 'Active'}</div>
                      </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Technical Details</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {entry.ipAddress && <div>IP: {entry.ipAddress}</div>}
                      {entry.sessionId && <div>Session: {entry.sessionId.slice(-8)}</div>}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="col-span-2">
                          Tags: {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="mr-1 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Audit Trail</h2>
          <p className="text-muted-foreground">
            Comprehensive audit trail with compliance, quality, and activity data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('json')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'entries' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('entries')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Entries
        </Button>
        <Button
          variant={activeView === 'analytics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('analytics')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
        <Button
          variant={activeView === 'compliance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('compliance')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Compliance
        </Button>
        <Button
          variant={activeView === 'users' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('users')}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search entries..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="quality_assessed">Quality Assessed</SelectItem>
                  <SelectItem value="regenerated">Regenerated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={filters.severity}
                onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeView === 'entries' && renderEntriesView()}
      {activeView === 'analytics' && renderAnalyticsView()}
      {activeView === 'compliance' && renderComplianceView()}
      {activeView === 'users' && (
        <div className="text-center py-8 text-muted-foreground">
          User activity view coming soon...
        </div>
      )}
    </div>
  );
};

export default EnhancedAuditTrail;
