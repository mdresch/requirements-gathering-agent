// Standards Compliance Dashboard - Interactive analytics and compliance visualization
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\StandardsComplianceDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  FileText, 
  Award,
  Eye,
  Download,
  RefreshCw,
  BookOpen,
  Briefcase,
  Database,
  Shield,
  Bell,
  Filter,
  Plus,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import EnhancedComplianceDataIntegration from './EnhancedComplianceDataIntegration';
import ComplianceDrillDown from './ComplianceDrillDown'; // Phase 2 import
import IssueManagementModal from './IssueManagementModal'; // Phase 2 import
import StandardSpecificAnalysis from './StandardSpecificAnalysis'; // Phase 2 import
import ComplianceWorkflowEngine from './ComplianceWorkflowEngine'; // Phase 2 import
import RealTimeNotificationSystem from './RealTimeNotificationSystem'; // Phase 2 import
import AdvancedComplianceFiltering from './AdvancedComplianceFiltering'; // Phase 2 import

interface ComplianceMetrics {
  overallScore: number;
  standardsCompliance: {
    babok: number;
    pmbok: number;
    iso: number;
    custom: number;
  };
  deviationAnalysis: {
    critical: number;
    major: number;
    minor: number;
    informational: number;
  };
  trendsData: Array<{
    date: string;
    score: number;
    babok: number;
    pmbok: number;
  }>;
  standardsBreakdown: Array<{
    standard: string;
    compliant: number;
    nonCompliant: number;
    pending: number;
  }>;
}

interface ExecutiveSummary {
  id: string;
  title: string;
  generatedDate: string;
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  keyFindings: string[];
  recommendations: string[];
  downloadUrl?: string;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  secondary: '#8B5CF6'
};

const DEVIATION_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

export default function StandardsComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  
  // Phase 2: Interactive Drill-down Features State
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL' | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showStandardAnalysis, setShowStandardAnalysis] = useState(false);
  const [showWorkflowEngine, setShowWorkflowEngine] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdvancedFiltering, setShowAdvancedFiltering] = useState(false);
  const [activePhase2Tab, setActivePhase2Tab] = useState<'dashboard' | 'drilldown' | 'issues' | 'analysis' | 'workflows' | 'notifications' | 'filtering'>('dashboard');

  useEffect(() => {
    loadComplianceData();
  }, [selectedTimeframe]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Try enhanced API first, fallback to original API
      let metricsResponse;
      try {
        metricsResponse = await fetch('http://localhost:3002/api/v1/standards/enhanced/dashboard?projectId=current-project');
        metricsResponse = await metricsResponse.json();
        console.log('📊 Enhanced compliance metrics response:', metricsResponse);
      } catch (error) {
        console.warn('⚠️ Enhanced API failed, falling back to original API');
        metricsResponse = await apiClient.getStandardsCompliance();
      }
      
      if (metricsResponse.success && metricsResponse.data) {
        // Transform backend data to frontend format
        const backendData = metricsResponse.data;
        const transformedMetrics: ComplianceMetrics = {
          overallScore: backendData.projectSummary?.overallScore || 85,
          standardsCompliance: {
            babok: backendData.complianceOverview?.standards?.babok?.score || 94,
            pmbok: backendData.complianceOverview?.standards?.pmbok?.score || 89,
            iso: backendData.complianceOverview?.standards?.iso?.score || 85,
            custom: backendData.complianceOverview?.standards?.dmbok?.score || 78,
          },
          deviationAnalysis: {
            critical: backendData.deviationSummary?.byCategory?.METHODOLOGY || 2,
            major: backendData.deviationSummary?.byCategory?.PROCESS || 4,
            minor: backendData.deviationSummary?.byCategory?.DELIVERABLE || 5,
            informational: backendData.deviationSummary?.byCategory?.GOVERNANCE || 1,
          },
          trendsData: generateMockTrendsData(),
          standardsBreakdown: generateMockStandardsBreakdown(),
        };
        setMetrics(transformedMetrics);
      } else {
        // Fallback to demo data if API fails
        console.warn('⚠️ Using fallback compliance data');
        setMetrics(generateMockComplianceData());
      }

      // Use fallback executive summary since API function doesn't exist
      console.log('📋 Using fallback executive summary data');
      setExecutiveSummary(generateMockExecutiveSummary());
    } catch (error) {
      console.error('❌ Error loading compliance data:', error);
      toast.error('Using demo data - API connection failed');
      // Use mock data as fallback
      setMetrics(generateMockComplianceData());
      setExecutiveSummary(generateMockExecutiveSummary());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadComplianceData();
    setRefreshing(false);
    toast.success('Compliance data refreshed');
  };

  const handleGenerateReport = async () => {
    try {
      const response = await apiClient.generateComplianceReport('current-project', ['babok', 'pmbok']);
      if (response.success) {
        toast.success('Compliance report generated successfully');
        // Refresh executive summary to get the new report
        loadComplianceData();
      }
    } catch (error) {
      toast.error('Failed to generate compliance report');
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return COLORS.success;
    if (score >= 75) return COLORS.warning;
    if (score >= 60) return COLORS.info;
    return COLORS.danger;
  };

  const formatDeviationData = (deviations: ComplianceMetrics['deviationAnalysis']) => [
    { name: 'Critical', value: deviations.critical, color: COLORS.danger },
    { name: 'Major', value: deviations.major, color: COLORS.warning },
    { name: 'Minor', value: deviations.minor, color: COLORS.info },
    { name: 'Info', value: deviations.informational, color: COLORS.success }
  ];

  const formatRadarData = (standards: ComplianceMetrics['standardsCompliance']) => [
    { standard: 'BABOK v3', score: standards.babok, fullMark: 100 },
    { standard: 'PMBOK 7th', score: standards.pmbok, fullMark: 100 },
    { standard: 'ISO Standards', score: standards.iso, fullMark: 100 },
    { standard: 'Custom Rules', score: standards.custom, fullMark: 100 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">Connecting to standards compliance API...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Compliance Data Loading</h2>
          <p className="text-gray-600 mb-4">
            The compliance dashboard is initializing. This may take a few moments on first load.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Troubleshooting:</strong> If this persists, check that the backend API server is running on port 3001.
            </p>
          </div>
          <button
            onClick={loadComplianceData}
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
        {/* Enhanced Data Integration */}
        <EnhancedComplianceDataIntegration 
          projectId="current-project"
          onDataUpdate={(data) => {
            console.log('📊 Real-time data update received:', data);
            // Refresh dashboard data when real-time updates are received
            loadComplianceData();
          }}
          onQualityChange={(quality) => {
            console.log('🔍 Data quality update received:', quality);
            // Handle quality changes if needed
          }}
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Standards Compliance Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive analysis of requirements standards compliance</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Select timeframe for compliance data"
                aria-label="Select timeframe for compliance data"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Phase 2: Interactive Drill-down Features Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'drilldown', label: 'Drill Down', icon: Eye },
                { id: 'issues', label: 'Issues', icon: AlertTriangle },
                { id: 'analysis', label: 'Analysis', icon: TrendingUp },
                { id: 'workflows', label: 'Workflows', icon: RefreshCw },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'filtering', label: 'Filtering', icon: Filter }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePhase2Tab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activePhase2Tab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Phase 2 Content */}
        {activePhase2Tab === 'dashboard' && (
          <>
            {/* Compliance Score Cards */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Standards Compliance Overview</h2>
            <p className="text-gray-600">Individual compliance scores for each standard framework</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Overall Compliance Score */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    metrics.overallScore >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    metrics.overallScore >= 75 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    metrics.overallScore >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Overall</h3>
              <p className="text-sm text-gray-600">
                {metrics.overallScore >= 90 ? 'Excellent' :
                 metrics.overallScore >= 75 ? 'Good' :
                 metrics.overallScore >= 60 ? 'Fair' : 'Needs improvement'}
              </p>
              <div className="mt-2 text-xs text-gray-500">{metrics.overallScore}%</div>
            </div>

            {/* BABOK Circle Diagram */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    metrics.standardsCompliance.babok >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    metrics.standardsCompliance.babok >= 75 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    metrics.standardsCompliance.babok >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <BookOpen className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">BABOK v3</h3>
              <p className="text-sm text-gray-600">
                {metrics.standardsCompliance.babok >= 90 ? 'Excellent' :
                 metrics.standardsCompliance.babok >= 75 ? 'Good' :
                 metrics.standardsCompliance.babok >= 60 ? 'Fair' : 'Needs improvement'}
              </p>
              <div className="mt-2 text-xs text-gray-500">{metrics.standardsCompliance.babok}%</div>
            </div>

            {/* PMBOK Circle Diagram */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    metrics.standardsCompliance.pmbok >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    metrics.standardsCompliance.pmbok >= 75 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    metrics.standardsCompliance.pmbok >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <Briefcase className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">PMBOK 7th</h3>
              <p className="text-sm text-gray-600">
                {metrics.standardsCompliance.pmbok >= 90 ? 'Excellent' :
                 metrics.standardsCompliance.pmbok >= 75 ? 'Good' :
                 metrics.standardsCompliance.pmbok >= 60 ? 'Fair' : 'Needs improvement'}
              </p>
              <div className="mt-2 text-xs text-gray-500">{metrics.standardsCompliance.pmbok}%</div>
            </div>

            {/* DMBOK Circle Diagram */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    metrics.standardsCompliance.custom >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    metrics.standardsCompliance.custom >= 75 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    metrics.standardsCompliance.custom >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <Database className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">DMBOK 2.0</h3>
              <p className="text-sm text-gray-600">
                {metrics.standardsCompliance.custom >= 90 ? 'Excellent' :
                 metrics.standardsCompliance.custom >= 75 ? 'Good' :
                 metrics.standardsCompliance.custom >= 60 ? 'Fair' : 'Needs improvement'}
              </p>
              <div className="mt-2 text-xs text-gray-500">{metrics.standardsCompliance.custom}%</div>
            </div>

            {/* ISO Circle Diagram */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    metrics.standardsCompliance.iso >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    metrics.standardsCompliance.iso >= 75 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                    metrics.standardsCompliance.iso >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ISO Standards</h3>
              <p className="text-sm text-gray-600">
                {metrics.standardsCompliance.iso >= 90 ? 'Excellent' :
                 metrics.standardsCompliance.iso >= 75 ? 'Good' :
                 metrics.standardsCompliance.iso >= 60 ? 'Fair' : 'Needs improvement'}
              </p>
              <div className="mt-2 text-xs text-gray-500">{metrics.standardsCompliance.iso}%</div>
            </div>
          </div>
        </div>

        {/* Standards Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Standards Radar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Standards Compliance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={formatRadarData(metrics.standardsCompliance)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="standard" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Compliance Score"
                  dataKey="score"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Deviation Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Deviation Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatDeviationData(metrics.deviationAnalysis)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatDeviationData(metrics.deviationAnalysis).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Compliance Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={metrics.trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={3} name="Overall Score" />
              <Line type="monotone" dataKey="babok" stroke={COLORS.success} strokeWidth={2} name="BABOK v3" />
              <Line type="monotone" dataKey="pmbok" stroke={COLORS.warning} strokeWidth={2} name="PMBOK 7th" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Standards Breakdown Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Standards Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.standardsBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="standard" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="compliant" stackId="a" fill={COLORS.success} name="Compliant" />
              <Bar dataKey="nonCompliant" stackId="a" fill={COLORS.danger} name="Non-Compliant" />
              <Bar dataKey="pending" stackId="a" fill={COLORS.warning} name="Pending Review" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Executive Summary */}
        {executiveSummary && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{executiveSummary.title}</h3>
                <p className="text-gray-600">Generated: {new Date(executiveSummary.generatedDate).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                {executiveSummary.downloadUrl && (
                  <a
                    href={executiveSummary.downloadUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Findings</h4>
                <ul className="space-y-2">
                  {Array.isArray(executiveSummary?.keyFindings) &&
                    executiveSummary.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
                <ul className="space-y-2">
                  {Array.isArray(executiveSummary?.recommendations) &&
                    executiveSummary.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Award className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Phase 2: Drill Down Tab */}
        {activePhase2Tab === 'drilldown' && (
          <ComplianceDrillDown
            standardType={selectedStandard || 'OVERALL'}
            projectId="current-project"
            onIssueSelect={(issue) => {
              setSelectedIssue(issue);
              setShowIssueModal(true);
            }}
            onClose={() => setActivePhase2Tab('dashboard')}
          />
        )}

        {/* Phase 2: Issues Tab */}
        {activePhase2Tab === 'issues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Issue Management</h2>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Issue</span>
              </button>
            </div>
            <ComplianceDrillDown
              standardType="OVERALL"
              projectId="current-project"
              onIssueSelect={(issue) => {
                setSelectedIssue(issue);
                setShowIssueModal(true);
              }}
            />
          </div>
        )}

        {/* Phase 2: Analysis Tab */}
        {activePhase2Tab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Standard-Specific Analysis</h2>
              <div className="flex space-x-2">
                {['BABOK', 'PMBOK', 'DMBOK', 'ISO'].map((standard) => (
                  <button
                    key={standard}
                    onClick={() => setSelectedStandard(standard as any)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedStandard === standard
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {standard}
                  </button>
                ))}
              </div>
            </div>
            {selectedStandard && (
              <StandardSpecificAnalysis
                standardType={selectedStandard}
                projectId="current-project"
                onClose={() => setSelectedStandard(null)}
              />
            )}
          </div>
        )}

        {/* Phase 2: Workflows Tab */}
        {activePhase2Tab === 'workflows' && (
          <ComplianceWorkflowEngine
            projectId="current-project"
            onClose={() => setActivePhase2Tab('dashboard')}
          />
        )}

        {/* Phase 2: Notifications Tab */}
        {activePhase2Tab === 'notifications' && (
          <RealTimeNotificationSystem
            projectId="current-project"
            onClose={() => setActivePhase2Tab('dashboard')}
          />
        )}

        {/* Phase 2: Filtering Tab */}
        {activePhase2Tab === 'filtering' && (
          <AdvancedComplianceFiltering
            onFiltersChange={(filters) => {
              console.log('📊 Filters changed:', filters);
              // Apply filters to dashboard data
            }}
            onClose={() => setActivePhase2Tab('dashboard')}
          />
        )}

        {/* Phase 2: Issue Management Modal */}
        {showIssueModal && (
          <IssueManagementModal
            issue={selectedIssue}
            standardType={selectedStandard || 'BABOK'}
            projectId="current-project"
            isOpen={showIssueModal}
            onClose={() => {
              setShowIssueModal(false);
              setSelectedIssue(null);
            }}
            onSave={(issue) => {
              console.log('💾 Issue saved:', issue);
              setShowIssueModal(false);
              setSelectedIssue(null);
              // Refresh data
              loadComplianceData();
            }}
            onDelete={(issueId) => {
              console.log('🗑️ Issue deleted:', issueId);
              setShowIssueModal(false);
              setSelectedIssue(null);
              // Refresh data
              loadComplianceData();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Mock data generation functions for demo/fallback purposes
const generateMockComplianceData = (): ComplianceMetrics => ({
  overallScore: 87,
  standardsCompliance: {
    babok: 94,
    pmbok: 89,
    iso: 85,
    custom: 78,
  },
  deviationAnalysis: {
    critical: 2,
    major: 4,
    minor: 6,
    informational: 3,
  },
  trendsData: generateMockTrendsData(),
  standardsBreakdown: generateMockStandardsBreakdown(),
});

const generateMockTrendsData = () => {
  const days = 30;
  const trends = [];
  const baseScore = 85;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      score: baseScore + Math.floor(Math.random() * 10) - 5,
      babok: 90 + Math.floor(Math.random() * 8),
      pmbok: 85 + Math.floor(Math.random() * 10),
    });
  }
  return trends;
};

const generateMockStandardsBreakdown = () => [
  {
    standard: 'BABOK v3',
    compliant: 85,
    nonCompliant: 10,
    pending: 5,
  },
  {
    standard: 'PMBOK 7th',
    compliant: 78,
    nonCompliant: 15,
    pending: 7,
  },
  {
    standard: 'ISO 21500',
    compliant: 72,
    nonCompliant: 18,
    pending: 10,
  },
  {
    standard: 'Custom Rules',
    compliant: 65,
    nonCompliant: 25,
    pending: 10,
  },
];

const generateMockExecutiveSummary = (): ExecutiveSummary => ({
  id: 'exec-summary-' + Date.now(),
  title: 'Standards Compliance Executive Summary',
  generatedDate: new Date().toISOString(),
  overallRating: 'good',
  keyFindings: [
    'BABOK v3 compliance showing strong performance at 94%',
    'PMBOK 7th Edition alignment improved by 5% this quarter',
    'ISO standards compliance meets industry benchmarks',
    'Custom rule adherence requires attention in workflow processes',
    'Overall compliance trajectory is positive with consistent improvement',
  ],
  recommendations: [
    'Implement automated compliance monitoring for real-time tracking',
    'Conduct focused training on PMBOK 7th Edition best practices',
    'Review and update custom rules to align with latest industry standards',
    'Establish monthly compliance review meetings with stakeholders',
    'Deploy compliance dashboard for continuous monitoring',
  ],
});
