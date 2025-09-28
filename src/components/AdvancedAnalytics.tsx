// Advanced Analytics Component - Interactive charts and reports
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\AdvancedAnalytics.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ComplianceAnalyticsDashboard from './ComplianceAnalyticsDashboard';

interface AnalyticsData {
  projectMetrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageCompletionTime: number;
  };
  templateUsage: Array<{
    name: string;
    usage: number;
    category: string;
    trend: number;
  }>;
  complianceAnalytics: Array<{
    date: string;
    babok: number;
    pmbok: number;
    overall: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    documentsGenerated: number;
    templatesCreated: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    target: number;
    status: 'good' | 'warning' | 'critical';
  }>;
}

interface FilterOptions {
  dateRange: '7d' | '30d' | '90d' | '1y';
  category: string;
  projectStatus: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: '30d',
    category: 'all',
    projectStatus: 'all'
  });
  const [selectedChart, setSelectedChart] = useState<'overview' | 'templates' | 'compliance' | 'performance'>('overview');

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📊 Loading analytics data...');
      
      // Load data from working API endpoints
      const [templatesResponse, projectsResponse] = await Promise.all([
        apiClient.getTemplates({ page: 1, limit: 100 }),
        apiClient.getProjects({ page: 1, limit: 100 })
      ]);
      
      console.log('📈 Analytics response:', { templatesResponse, projectsResponse });
      
      const templates = templatesResponse.data?.templates || templatesResponse.data || [];
      const projects = projectsResponse.data?.projects || projectsResponse.data || [];
      
      // Calculate project metrics from real data
      const totalProjects = projects.length;
      const activeProjects = projects.filter((p: any) => p.status === 'active' || p.status === 'in_progress').length;
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      
      // Calculate average completion time (estimate based on project creation dates)
      const projectsWithDates = projects.filter((p: any) => p.createdAt && p.updatedAt);
      const averageCompletionTime = projectsWithDates.length > 0 
        ? projectsWithDates.reduce((sum: number, p: any) => {
            const created = new Date(p.createdAt);
            const updated = new Date(p.updatedAt);
            const daysDiff = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + daysDiff;
          }, 0) / projectsWithDates.length
        : 18.5; // Default fallback
      
      // Generate template usage data from real templates
      const templateUsage = templates.map((template: any) => ({
        name: template.name,
        usage: Math.floor(Math.random() * 20) + 1, // Simulate usage data
        category: template.category || 'General',
        trend: Math.random() > 0.5 ? 1 : -1
      }));
      
      // Transform API data for analytics
      const transformedData: AnalyticsData = {
        projectMetrics: {
          totalProjects,
          activeProjects,
          completedProjects,
          averageCompletionTime: Math.round(averageCompletionTime * 10) / 10
        },
        templateUsage: templateUsage.length > 0 ? templateUsage : generateMockTemplateUsage(),
        complianceAnalytics: generateComplianceData(),
        userActivity: generateUserActivityData(),
        performanceMetrics: generateMockPerformanceMetrics()
      };
      
      setAnalyticsData(transformedData);
      console.log('✅ Analytics data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      toast.error('Using demo data - Analytics API connection failed');
      // Use mock data as fallback
      const mockData = generateMockAnalyticsData();
      mockData.complianceAnalytics = generateComplianceData();
      mockData.userActivity = generateUserActivityData();
      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateComplianceData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        babok: Math.floor(Math.random() * 20) + 80,
        pmbok: Math.floor(Math.random() * 25) + 75,
        overall: Math.floor(Math.random() * 15) + 85
      });
    }
    return data;
  };

  const generateUserActivityData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 20) + 15,
        documentsGenerated: Math.floor(Math.random() * 50) + 25,
        templatesCreated: Math.floor(Math.random() * 5) + 1
      });
    }
    return data;
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    if (!analyticsData) return;
    
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      filters,
      data: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${filters.dateRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'warning': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [filters, loadAnalyticsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">Connecting to analytics API...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard Loading</h2>
          <p className="text-gray-600 mb-4">
            The analytics dashboard is initializing. This may take a few moments on first load.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Troubleshooting:</strong> If this persists, check that the backend API server is running on port 3001.
            </p>
          </div>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Select date range"
                aria-label="Select date range"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 bg-white rounded-lg p-2 shadow">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'templates', label: 'Template Usage', icon: FileText },
              { key: 'compliance', label: 'Compliance Trends', icon: Activity },
              { key: 'performance', label: 'Performance', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedChart === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.projectMetrics.totalProjects}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.projectMetrics.activeProjects}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((analyticsData.projectMetrics.completedProjects / analyticsData.projectMetrics.totalProjects) * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time (days)</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.projectMetrics.averageCompletionTime}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="h-96">
            {selectedChart === 'overview' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="documentsGenerated" fill="#3B82F6" name="Documents Generated" />
                  <Line yAxisId="right" type="monotone" dataKey="activeUsers" stroke="#10B981" strokeWidth={3} name="Active Users" />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'templates' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.templateUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#8B5CF6" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'compliance' && (
              <div className="w-full h-full">
                <ComplianceAnalyticsDashboard />
              </div>
            )}

            {selectedChart === 'performance' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.performanceMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="metric" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Current Value" />
                  <Bar dataKey="target" fill="#10B981" name="Target Value" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              {analyticsData.performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getMetricStatusIcon(metric.status)}
                    <div>
                      <p className="font-medium text-gray-900">{metric.metric}</p>
                      <p className="text-sm text-gray-600">Target: {metric.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getMetricStatusColor(metric.status)}`}>
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">{metric.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Template Usage Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.templateUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="usage"
                >
                  {analyticsData.templateUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data generation functions for demo/fallback purposes
const generateMockAnalyticsData = (): AnalyticsData => ({
  projectMetrics: {
    totalProjects: 25,
    activeProjects: 12,
    completedProjects: 13,
    averageCompletionTime: 18.5
  },
  templateUsage: generateMockTemplateUsage(),
  complianceAnalytics: [], // Will be populated by component method
  userActivity: [], // Will be populated by component method
  performanceMetrics: generateMockPerformanceMetrics()
});

const generateMockTemplateUsage = () => [
  { name: 'Business Requirements', usage: 45, category: 'Business Analysis', trend: 12 },
  { name: 'Project Charter', usage: 32, category: 'Project Management', trend: 8 },
  { name: 'Use Cases', usage: 28, category: 'Business Analysis', trend: -3 },
  { name: 'Test Plans', usage: 21, category: 'Quality Assurance', trend: 15 },
  { name: 'Architecture Documents', usage: 18, category: 'Technical', trend: 5 },
  { name: 'Risk Assessment', usage: 16, category: 'Project Management', trend: 7 },
  { name: 'Stakeholder Analysis', usage: 14, category: 'Business Analysis', trend: 3 },
  { name: 'Process Flows', usage: 12, category: 'Process Documentation', trend: -1 }
];

const generateMockPerformanceMetrics = () => [
  { metric: 'Document Generation Speed', value: 85, target: 90, status: 'warning' as const },
  { metric: 'Template Compliance Rate', value: 94, target: 95, status: 'good' as const },
  { metric: 'User Satisfaction Score', value: 87, target: 85, status: 'good' as const },
  { metric: 'System Uptime', value: 99.2, target: 99.9, status: 'warning' as const },
  { metric: 'API Response Time (ms)', value: 245, target: 200, status: 'critical' as const },
  { metric: 'Template Usage Rate', value: 78, target: 80, status: 'warning' as const },
  { metric: 'Compliance Accuracy', value: 96, target: 95, status: 'good' as const },
  { metric: 'Error Rate', value: 2.1, target: 1.0, status: 'critical' as const }
];
