'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Settings, 
  MessageSquare, 
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Clock,
  Database,
  Server,
  Zap,
  Star,
  Target,
  Shield,
  BarChart,
  LineChart,
  RefreshCw,
  Download
} from 'lucide-react';
import { apiClient } from '../lib/api';
import PerformanceDashboard from './PerformanceDashboard';
import { CompactPerformanceGrid } from './CompactPerformanceGauge';

interface ComprehensiveDashboardData {
  // Core Metrics
  babokCompliance: number;
  pmbokCompliance: number;
  overallScore: number;
  feedbackScore: number;
  
  // Performance Metrics
  performanceMetrics: {
    babokCompliance: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
    pmbokCompliance: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
    overallQuality: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
    feedbackScore: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
    documentQuality: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
    systemPerformance: { projected: number; actual: number; trend: 'up' | 'down' | 'stable' };
  };
  
  // System Health
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    responseTime: number;
    databaseStatus: 'connected' | 'disconnected';
    apiStatus: 'operational' | 'degraded' | 'down';
  };
  
  // Quality Trends
  qualityTrends: Array<{
    period: string;
    date: string;
    qualityScore: number;
    babokScore: number;
    pmbokScore: number;
    feedbackScore: number;
  }>;
  
  // Recent Activities
  recentActivities: Array<{
    id: string;
    type: 'document_generated' | 'feedback_submitted' | 'quality_assessed' | 'compliance_checked';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    projectId?: string;
    documentId?: string;
  }>;
  
  // Project Statistics
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageQualityScore: number;
    totalDocuments: number;
    totalFeedback: number;
  };
}

export default function ComprehensiveDashboard() {
  const [data, setData] = useState<ComprehensiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'health'>('overview');

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all required data in parallel
      const [
        complianceResponse,
        projectsResponse,
        feedbackResponse
      ] = await Promise.all([
        apiClient.getStandardsCompliance(),
        apiClient.getProjects(),
        apiClient.getFeedbackSummary()
      ]);

      // Process core metrics
      const babokCompliance = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.babok || 0 
        : 0;
      const pmbokCompliance = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.pmbok || 0 
        : 0;
      const overallScore = complianceResponse.success 
        ? complianceResponse.data?.overallScore || 0 
        : 0;
      const feedbackScore = feedbackResponse.success 
        ? feedbackResponse.data?.averageRating || 0 
        : 0;

      // Generate performance metrics
      const performanceMetrics = {
        babokCompliance: {
          projected: 85,
          actual: babokCompliance,
          trend: (babokCompliance >= 85 ? 'up' : 'down') as 'up' | 'down' | 'stable'
        },
        pmbokCompliance: {
          projected: 82,
          actual: pmbokCompliance,
          trend: (pmbokCompliance >= 82 ? 'up' : 'down') as 'up' | 'down' | 'stable'
        },
        overallQuality: {
          projected: 88,
          actual: overallScore,
          trend: (overallScore >= 88 ? 'up' : 'down') as 'up' | 'down' | 'stable'
        },
        feedbackScore: {
          projected: 4.0,
          actual: feedbackScore,
          trend: (feedbackScore >= 4.0 ? 'up' : 'down') as 'up' | 'down' | 'stable'
        },
        documentQuality: {
          projected: 90,
          actual: overallScore + 2, // Simulate document quality
          trend: ((overallScore + 2) >= 90 ? 'up' : 'down') as 'up' | 'down' | 'stable'
        },
        systemPerformance: {
          projected: 95,
          actual: 99.2,
          trend: 'up' as 'up' | 'down' | 'stable'
        }
      };

      // Generate quality trends
      const qualityTrends = generateQualityTrends(overallScore, babokCompliance, pmbokCompliance, feedbackScore);

      // Generate recent activities
      const recentActivities = await generateRecentActivities(projectsResponse);

      // Process project statistics
      const projects = projectsResponse.success ? projectsResponse.data || [] : [];
      const projectStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        completedProjects: projects.filter((p: any) => p.status === 'completed').length,
        averageQualityScore: projects.length > 0
          ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.qualityScore || 0), 0) / projects.length)
          : 0,
        totalDocuments: await calculateTotalDocuments(projects),
        totalFeedback: feedbackResponse.success ? feedbackResponse.data?.totalFeedback || 0 : 0
      };

      // System health
      const systemHealth = {
        status: 'healthy' as const,
        uptime: 99.9,
        responseTime: Math.random() * 200 + 100, // Simulate response time
        databaseStatus: 'connected' as const,
        apiStatus: 'operational' as const
      };

      setData({
        babokCompliance,
        pmbokCompliance,
        overallScore,
        feedbackScore,
        performanceMetrics,
        systemHealth,
        qualityTrends,
        recentActivities,
        projectStats
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateQualityTrends = (overall: number, babok: number, pmbok: number, feedback: number) => {
    const trends = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 56); // 8 weeks

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      
      const progressFactor = (i + 1) / 8;
      const variation = (Math.random() - 0.5) * 4;
      
      trends.push({
        period: `Week ${i + 1}`,
        date: weekStart.toISOString().split('T')[0],
        qualityScore: Math.max(60, Math.min(100, Math.round(70 + (overall - 70) * progressFactor + variation))),
        babokScore: Math.max(60, Math.min(100, Math.round(75 + (babok - 75) * progressFactor + variation))),
        pmbokScore: Math.max(60, Math.min(100, Math.round(72 + (pmbok - 72) * progressFactor + variation))),
        feedbackScore: Math.max(2.0, Math.min(5.0, Math.round((3.0 + (feedback - 3.0) * progressFactor + (Math.random() - 0.5) * 0.4) * 10) / 10))
      });
    }

    return trends;
  };

  const generateRecentActivities = async (projectsResponse: any) => {
    const activities = [];
    const projects = projectsResponse.success ? projectsResponse.data || [] : [];

    // Generate mock activities
    activities.push(
      {
        id: '1',
        type: 'document_generated' as const,
        title: 'Business Case Generated',
        description: 'New business case document created for Financial Services Project',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success' as const,
        projectId: 'proj_1',
        documentId: 'doc_1'
      },
      {
        id: '2',
        type: 'quality_assessed' as const,
        title: 'Quality Assessment Completed',
        description: 'Quality score: 87% for Stakeholder Analysis document',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'success' as const,
        projectId: 'proj_1',
        documentId: 'doc_2'
      },
      {
        id: '3',
        type: 'feedback_submitted' as const,
        title: 'New Feedback Received',
        description: 'User feedback on Scope Management Plan (Rating: 4/5)',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success' as const,
        projectId: 'proj_2',
        documentId: 'doc_3'
      }
    );

    return activities.slice(0, 5);
  };

  const calculateTotalDocuments = async (projects: any[]) => {
    let total = 0;
    for (const project of projects.slice(0, 3)) { // Limit to first 3 projects for performance
      try {
        const docsResponse = await apiClient.getProjectDocuments(project.id);
        if (docsResponse.success && docsResponse.data) {
          total += docsResponse.data.length;
        }
      } catch (error) {
        console.warn(`Failed to get documents for project ${project.id}:`, error);
      }
    }
    return total;
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExportDashboard = () => {
    // In a real implementation, this would export dashboard data
    console.log('Exporting dashboard data...');
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading comprehensive dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprehensive Dashboard</h1>
            <p className="text-gray-600">
              Complete overview of system performance, quality metrics, and compliance status
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportDashboard}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'performance', name: 'Performance Gauges', icon: Target },
              { id: 'trends', name: 'Quality Trends', icon: TrendingUp },
              { id: 'health', name: 'System Health', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">BABOK Compliance</p>
                      <p className={`text-3xl font-bold ${getScoreColor(data.babokCompliance)}`}>
                        {data.babokCompliance}%
                      </p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(data.babokCompliance, 88)}
                        <span className="text-xs text-gray-500 ml-1">+2.1%</span>
                      </div>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">PMBOK Compliance</p>
                      <p className={`text-3xl font-bold ${getScoreColor(data.pmbokCompliance)}`}>
                        {data.pmbokCompliance}%
                      </p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(data.pmbokCompliance, 85)}
                        <span className="text-xs text-gray-500 ml-1">+1.8%</span>
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                        {data.overallScore}%
                      </p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(data.overallScore, 87)}
                        <span className="text-xs text-gray-500 ml-1">+1.5%</span>
                      </div>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Feedback Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(data.feedbackScore * 20)}`}>
                        {data.feedbackScore.toFixed(1)}/5
                      </p>
                      <div className="flex items-center mt-1">
                        {getTrendIcon(data.feedbackScore, 3.6)}
                        <span className="text-xs text-gray-500 ml-1">+0.2</span>
                      </div>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Compact Performance Grid */}
              <CompactPerformanceGrid />
            </div>
          )}

          {activeTab === 'performance' && (
            <PerformanceDashboard />
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Quality Trends Over Time</h2>
              {/* Quality trends visualization would go here */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Quality trends visualization will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">System Health Monitoring</h2>
              {/* System health details would go here */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">System health monitoring will be implemented here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
