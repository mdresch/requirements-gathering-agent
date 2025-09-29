'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { RecruitmentStatus } from '../types/stakeholder';

interface RecruitmentMetricsProps {
  projectId: string;
  projectName: string;
}

interface PerformanceMetrics {
  overall: {
    totalRecruitmentTime: number;
    averageRecruitmentTime: number;
    successRate: number;
    conversionRate: number;
    timeToFirstContact: number;
    interviewToOfferRate: number;
  };
  byPriority: {
    critical: MetricsByPriority;
    high: MetricsByPriority;
    medium: MetricsByPriority;
    low: MetricsByPriority;
  };
  byRole: {
    project_manager: RoleMetrics;
    sponsor: RoleMetrics;
    team_member: RoleMetrics;
    end_user: RoleMetrics;
    stakeholder: RoleMetrics;
  };
  trends: {
    monthlyRecruitment: number[];
    monthlyTargets: number[];
    performanceScore: number;
    improvementAreas: string[];
  };
}

interface MetricsByPriority {
  averageTime: number;
  successRate: number;
  conversionRate: number;
  count: number;
}

interface RoleMetrics {
  averageTime: number;
  successRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  demand: 'low' | 'medium' | 'high';
  count: number;
}

export default function RecruitmentMetrics({ projectId, projectName }: RecruitmentMetricsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'priority' | 'role'>('overall');

  useEffect(() => {
    loadMetrics();
  }, [projectId, timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRecruitmentStatus(projectId);
      
      if (response.success && response.data) {
        // Generate mock performance metrics (in real implementation, this would come from backend)
        const mockMetrics: PerformanceMetrics = generateMockMetrics(response.data);
        setMetrics(mockMetrics);
      } else {
        toast.error('Failed to load performance metrics');
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = (status: RecruitmentStatus): PerformanceMetrics => {
    return {
      overall: {
        totalRecruitmentTime: 156, // hours
        averageRecruitmentTime: 12.5, // days
        successRate: 87.5,
        conversionRate: 73.2,
        timeToFirstContact: 2.3, // days
        interviewToOfferRate: 65.8
      },
      byPriority: {
        critical: { averageTime: 8.2, successRate: 95.0, conversionRate: 80.0, count: 4 },
        high: { averageTime: 11.5, successRate: 88.5, conversionRate: 75.0, count: 8 },
        medium: { averageTime: 14.8, successRate: 82.3, conversionRate: 68.5, count: 12 },
        low: { averageTime: 18.2, successRate: 76.8, conversionRate: 62.1, count: 6 }
      },
      byRole: {
        project_manager: { averageTime: 15.2, successRate: 85.0, difficulty: 'hard', demand: 'high', count: 2 },
        sponsor: { averageTime: 8.5, successRate: 92.5, difficulty: 'medium', demand: 'medium', count: 3 },
        team_member: { averageTime: 10.8, successRate: 88.0, difficulty: 'medium', demand: 'high', count: 8 },
        end_user: { averageTime: 7.2, successRate: 95.0, difficulty: 'easy', demand: 'medium', count: 5 },
        stakeholder: { averageTime: 12.1, successRate: 82.5, difficulty: 'medium', demand: 'low', count: 4 }
      },
      trends: {
        monthlyRecruitment: [2, 3, 1, 4, 2, 3, 2, 5, 3, 4, 6, 4],
        monthlyTargets: [8, 12, 10, 15],
        performanceScore: 84.2,
        improvementAreas: ['Reduce time to first contact', 'Improve interview-to-offer conversion', 'Enhance candidate experience']
      }
    };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'low': return 'text-gray-600 bg-gray-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'high': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading performance metrics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No performance metrics available</p>
        <p className="text-sm">Metrics will appear once recruitment data is available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recruitment Performance Metrics</h2>
          <p className="text-gray-600 mt-1">Detailed performance analysis for {projectName}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Performance Score */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Performance Score</h3>
            <p className="text-gray-600 mt-1">Based on recruitment efficiency and success rates</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getPerformanceColor(metrics.trends.performanceScore)}`}>
              {metrics.trends.performanceScore}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Performance Score</p>
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedMetric('overall')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            selectedMetric === 'overall' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overall Metrics
        </button>
        <button
          onClick={() => setSelectedMetric('priority')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            selectedMetric === 'priority' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          By Priority
        </button>
        <button
          onClick={() => setSelectedMetric('role')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            selectedMetric === 'role' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          By Role
        </button>
      </div>

      {/* Overall Metrics */}
      {selectedMetric === 'overall' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Recruitment Time</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.overall.averageRecruitmentTime} days</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">-2.3 days vs last period</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.overall.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2% vs last period</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.overall.conversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.1% vs last period</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Time to First Contact</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.overall.timeToFirstContact} days</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">-0.8 days vs last period</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Interview to Offer Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.overall.interviewToOfferRate}%</p>
              </div>
              <Award className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.7% vs last period</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recruitment Time</p>
                <p className="text-2xl font-bold text-gray-600">{metrics.overall.totalRecruitmentTime} hours</p>
              </div>
              <Activity className="w-8 h-8 text-gray-500" />
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600">Across all roles</span>
            </div>
          </div>
        </div>
      )}

      {/* Priority Metrics */}
      {selectedMetric === 'priority' && (
        <div className="space-y-6">
          {Object.entries(metrics.byPriority).map(([priority, data]) => (
            <div key={priority} className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{priority} Priority</h3>
                <span className="text-sm text-gray-500">{data.count} roles</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{data.averageTime} days</p>
                  <p className="text-sm text-gray-600">Average Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{data.successRate}%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{data.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Metrics */}
      {selectedMetric === 'role' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(metrics.byRole).map(([role, data]) => (
            <div key={role} className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{formatRole(role)}</h3>
                <span className="text-sm text-gray-500">{data.count} recruited</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Time</span>
                  <span className="font-medium">{data.averageTime} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">{data.successRate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(data.difficulty)}`}>
                    {data.difficulty.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Demand</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDemandColor(data.demand)}`}>
                    {data.demand.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improvement Areas */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Areas for Improvement
        </h3>
        <div className="space-y-3">
          {metrics.trends.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Monthly Recruitment Trend
        </h3>
        <div className="h-32 flex items-end justify-between space-x-2">
          {metrics.trends.monthlyRecruitment.map((count, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(count / Math.max(...metrics.trends.monthlyRecruitment)) * 100}px` }}
                title={`${count} recruitments`}
              ></div>
              <span className="text-xs text-gray-500">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
