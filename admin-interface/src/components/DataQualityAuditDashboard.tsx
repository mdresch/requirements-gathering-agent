import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Database, AlertTriangle, CheckCircle, TrendingUp, Users, 
  Clock, FileText, Activity, BarChart3, Filter, Download,
  RefreshCw, Eye, Search, Calendar, Target, Zap
} from 'lucide-react';

interface DataQualityEvent {
  _id: string;
  documentId: string;
  documentName: string;
  projectId: string;
  projectName: string;
  action: string;
  actionDescription: string;
  userId: string;
  userName: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  contextData: {
    dataQualityEvent: boolean;
    assessmentId?: string;
    assessmentType?: string;
    overallScore?: number;
    dimensions?: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
      uniqueness: number;
    };
    issuesCount?: number;
    recommendationsCount?: number;
    criticalIssues?: number;
    highIssues?: number;
    mediumIssues?: number;
    lowIssues?: number;
    dataSource?: string;
    assessmentDuration?: number;
    aiModel?: string;
    confidenceScore?: number;
    issueResolution?: boolean;
    issueId?: string;
    issueType?: string;
    resolutionMethod?: string;
    ruleValidation?: boolean;
    ruleId?: string;
    ruleName?: string;
    validationResult?: string;
    violationsCount?: number;
    qualityImprovement?: boolean;
    previousScore?: number;
    newScore?: number;
    scoreChange?: number;
    changePercentage?: number;
    improvementMethod?: string;
  };
}

interface DataQualityAnalytics {
  totalAssessments: number;
  totalIssues: number;
  totalResolutions: number;
  totalImprovements: number;
  assessmentsByType: Record<string, number>;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  averageScores: {
    overall: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
  };
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  topIssues: Record<string, number>;
  improvementHistory: Array<{
    timestamp: string;
    previousScore: number;
    newScore: number;
    changePercentage: number;
  }>;
}

const COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626'
};

const DataQualityAuditDashboard: React.FC = () => {
  const [events, setEvents] = useState<DataQualityEvent[]>([]);
  const [analytics, setAnalytics] = useState<DataQualityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    projectId: 'all',
    assessmentType: 'all',
    startDate: '',
    endDate: '',
    limit: 50
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load events
      const eventsParams = new URLSearchParams();
      if (filters.projectId && filters.projectId !== 'all') eventsParams.append('projectId', filters.projectId);
      if (filters.assessmentType && filters.assessmentType !== 'all') eventsParams.append('assessmentType', filters.assessmentType);
      if (filters.startDate) eventsParams.append('startDate', filters.startDate);
      if (filters.endDate) eventsParams.append('endDate', filters.endDate);
      eventsParams.append('limit', filters.limit.toString());

      const eventsResponse = await fetch(`/api/v1/data-quality-audit/events?${eventsParams}`);
      const eventsData = await eventsResponse.json();

      if (eventsData.success) {
        setEvents(eventsData.data.events);
      }

      // Load analytics
      const analyticsParams = new URLSearchParams();
      if (filters.projectId && filters.projectId !== 'all') analyticsParams.append('projectId', filters.projectId);
      if (filters.startDate) analyticsParams.append('startDate', filters.startDate);
      if (filters.endDate) analyticsParams.append('endDate', filters.endDate);

      const analyticsResponse = await fetch(`/api/v1/data-quality-audit/analytics?${analyticsParams}`);
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error('Error loading data quality audit data:', error);
      setError('Failed to load data quality audit data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSeverityColor = (severity: string) => {
    return COLORS[severity as keyof typeof COLORS] || '#6B7280';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatScore = (score: number) => {
    return `${score.toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading data quality audit data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Quality Audit Dashboard</h2>
            <p className="text-gray-600">Monitor and analyze data quality assessment events</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <Select value={filters.projectId} onValueChange={(value) => setFilters({...filters, projectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="project_001">Customer Portal Enhancement</SelectItem>
                  <SelectItem value="project_002">Mobile App Development</SelectItem>
                  <SelectItem value="project_003">API Integration Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <Select value={filters.assessmentType} onValueChange={(value) => setFilters({...filters, assessmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="AUTOMATED">Automated</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="CONTINUOUS">Continuous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalAssessments}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Issues Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalResolutions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analytics.averageScores.overall)}`}>
                    {formatScore(analytics.averageScores.overall)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assessment Types */}
          <Card>
            <CardHeader>
              <CardTitle>Assessments by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.assessmentsByType).map(([type, count]) => ({
                      name: type,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.assessmentsByType).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quality Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Average Quality Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.averageScores).map(([dimension, score]) => ({
                  dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
                  score: score
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Data Quality Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityIcon(event.severity)}
                      <h4 className="font-medium text-gray-900">{event.actionDescription}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.contextData.assessmentType || event.action}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{event.userName}</span> • {event.projectName} • {formatTimestamp(event.timestamp)}
                    </div>
                    {event.contextData.overallScore !== undefined && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`font-medium ${getScoreColor(event.contextData.overallScore)}`}>
                          Score: {formatScore(event.contextData.overallScore)}
                        </span>
                        {event.contextData.issuesCount !== undefined && (
                          <span className="text-gray-600">
                            Issues: {event.contextData.issuesCount}
                          </span>
                        )}
                        {event.contextData.criticalIssues !== undefined && event.contextData.criticalIssues > 0 && (
                          <span className="text-red-600 font-medium">
                            Critical: {event.contextData.criticalIssues}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataQualityAuditDashboard;
