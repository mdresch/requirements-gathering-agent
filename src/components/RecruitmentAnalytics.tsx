'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { RecruitmentStatus } from '../types/stakeholder';

interface RecruitmentAnalyticsProps {
  projectId: string;
  projectName: string;
}

interface AnalyticsData {
  recruitmentStatus: RecruitmentStatus;
  timelineData: Array<{
    date: string;
    placeholders: number;
    recruited: number;
    active: number;
  }>;
  performanceMetrics: {
    averageRecruitmentTime: number;
    recruitmentSuccessRate: number;
    priorityCompletionRate: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    roleDistribution: Array<{
      role: string;
      count: number;
      percentage: number;
    }>;
  };
  upcomingDeadlines: Array<{
    id: string;
    role: string;
    deadline: string;
    priority: string;
    daysRemaining: number;
  }>;
}

export default function RecruitmentAnalytics({ projectId, projectName }: RecruitmentAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [projectId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRecruitmentStatus(projectId);
      
      if (response.success && response.data) {
        // Simulate additional analytics data (in real implementation, this would come from backend)
        const mockAnalyticsData: AnalyticsData = {
          recruitmentStatus: response.data,
          timelineData: generateTimelineData(response.data),
          performanceMetrics: generatePerformanceMetrics(response.data),
          upcomingDeadlines: (response.data.upcomingDeadlines || []).map((deadline: any) => ({
            ...deadline,
            daysRemaining: Math.ceil((new Date(deadline.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          }))
        };
        
        setAnalyticsData(mockAnalyticsData);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const generateTimelineData = (status: RecruitmentStatus) => {
    // Generate mock monthly timeline data (in real implementation, this would come from backend)
    const months = timeRange === '7d' ? 2 : timeRange === '30d' ? 6 : 12;
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        placeholders: Math.max(0, status.totalPlaceholders - Math.floor(Math.random() * 3)),
        recruited: Math.min(status.totalRecruited, Math.floor(Math.random() * 2)),
        active: Math.min(status.totalActive, Math.floor(Math.random() * 2))
      });
    }
    
    return data;
  };

  const generatePerformanceMetrics = (status: RecruitmentStatus) => {
    return {
      averageRecruitmentTime: Math.floor(Math.random() * 14) + 7, // 7-21 days
      recruitmentSuccessRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      priorityCompletionRate: {
        critical: Math.floor(Math.random() * 20) + 80,
        high: Math.floor(Math.random() * 25) + 70,
        medium: Math.floor(Math.random() * 30) + 60,
        low: Math.floor(Math.random() * 35) + 50
      },
      roleDistribution: [
        { role: 'Project Manager', count: Math.floor(Math.random() * 3) + 1, percentage: 25 },
        { role: 'Sponsor', count: Math.floor(Math.random() * 2) + 1, percentage: 20 },
        { role: 'Team Member', count: Math.floor(Math.random() * 5) + 2, percentage: 35 },
        { role: 'End User', count: Math.floor(Math.random() * 4) + 1, percentage: 20 }
      ]
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 3) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 7) return 'text-orange-600 bg-orange-50';
    if (daysRemaining <= 14) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
        <p className="text-sm">Analytics will appear once recruitment data is available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights for {projectName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 2 months</option>
            <option value="30d">Last 6 months</option>
            <option value="90d">Last 12 months</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Placeholders</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.recruitmentStatus.totalPlaceholders}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Active recruitment targets</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recruitment Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.performanceMetrics.recruitmentSuccessRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Average success rate</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Recruitment Time</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.performanceMetrics.averageRecruitmentTime} days</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Time to recruit</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-red-600">{analyticsData.upcomingDeadlines?.length || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Require attention</span>
          </div>
        </div>
      </div>

      {/* Priority Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Priority Completion Rates
          </h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.performanceMetrics?.priorityCompletionRate || {}).map(([priority, rate]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getPriorityColor(priority).split(' ')[0]}`}></div>
                  <span className="capitalize font-medium">{priority} Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPriorityColor(priority).split(' ')[0]}`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Role Distribution
          </h3>
          <div className="space-y-4">
            {(analyticsData.performanceMetrics?.roleDistribution || []).map((role) => (
              <div key={role.role} className="flex items-center justify-between">
                <span className="font-medium">{role.role}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${role.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{role.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Upcoming Recruitment Deadlines
        </h3>
        {(!analyticsData.upcomingDeadlines || analyticsData.upcomingDeadlines.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
            <p>No upcoming deadlines</p>
            <p className="text-sm">All recruitment deadlines are well managed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(analyticsData.upcomingDeadlines || []).map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                    {deadline.priority.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{deadline.role}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(deadline.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(deadline.daysRemaining)}`}>
                    {deadline.daysRemaining} days
                  </div>
                  {deadline.daysRemaining <= 3 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recruitment Timeline Chart */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Monthly Recruitment Trend
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {(analyticsData.timelineData || []).map((data, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="w-full flex flex-col space-y-1">
                <div 
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${(data.placeholders / Math.max(...(analyticsData.timelineData || []).map(d => d.placeholders), 1)) * 100}px` }}
                  title={`Placeholders: ${data.placeholders}`}
                ></div>
                <div 
                  className="bg-green-500"
                  style={{ height: `${(data.recruited / Math.max(...(analyticsData.timelineData || []).map(d => d.recruited), 1)) * 100}px` }}
                  title={`Recruited: ${data.recruited}`}
                ></div>
                <div 
                  className="bg-purple-500 rounded-b"
                  style={{ height: `${(data.active / Math.max(...(analyticsData.timelineData || []).map(d => d.active), 1)) * 100}px` }}
                  title={`Active: ${data.active}`}
                ></div>
              </div>
              <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Placeholders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Recruited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end">
        <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Analytics Report
        </button>
      </div>
    </div>
  );
}
