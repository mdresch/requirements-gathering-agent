// Feedback Analytics Component
// filepath: admin-interface/src/components/FeedbackAnalytics.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Star,
  RefreshCw
} from 'lucide-react';
import { apiClient, getFeedbackSummary, getFeedbackTrends, getDocumentPerformance } from '@/lib/api';

interface FeedbackAnalyticsProps {
  projectId?: string;
}

interface AnalyticsData {
  overview: {
    totalFeedback: number;
    averageRating: number;
    responseRate: number;
    improvementRate: number;
  };
  trends: {
    period: string;
    rating: number;
    volume: number;
  }[];
  documentPerformance: {
    documentType: string;
    averageRating: number;
    feedbackCount: number;
    qualityScore: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  insights: {
    topIssues: string[];
    improvementAreas: string[];
    successStories: string[];
  };
  recommendations: {
    immediate: string[];
    strategic: string[];
  };
}

export default function FeedbackAnalytics({ projectId }: FeedbackAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const loadFeedbackAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback summary from API with timeframe filter
      const feedbackSummary = await getFeedbackSummary(timeframe);
      
      // Fetch projects to calculate additional metrics
      const projectsResponse = await apiClient.getProjects({ page: 1, limit: 100 });
      const projects = projectsResponse.data?.projects || projectsResponse.data || [];
      
      // Calculate metrics from real data
      const totalFeedback = feedbackSummary.data?.totalFeedback || 0;
      const averageRating = feedbackSummary.data?.averageRating || 0;
      
      console.log(`📋 Real feedback summary for ${timeframe}:`, {
        totalFeedback,
        averageRating,
        timeframe
      });
      
      // Calculate timeframe-specific data
      const now = new Date();
      const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const timeframeDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
      
      // Calculate response rate (estimate based on projects with feedback)
      const projectsWithFeedback = projects.filter((p: any) => p.feedbackCount > 0).length;
      const responseRate = projects.length > 0 ? Math.round((projectsWithFeedback / projects.length) * 100) : 0;
      
      // Calculate improvement rate (estimate based on average rating trend)
      const improvementRate = averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0;

      // Fetch real trends data from API
      const trendsResponse = await getFeedbackTrends(timeframe);
      let trends = [];
      
      if (trendsResponse.success && trendsResponse.data?.trends) {
        trends = trendsResponse.data.trends;
        console.log(`📊 Real trends data for ${timeframe}:`, trends);
        console.log(`📊 Total trend records: ${trends.length}`);
      } else {
        // Fallback to empty trends if API fails
        console.warn('Failed to load trends data, using empty array');
        trends = [];
      }

      // Fetch real document performance data from API
      const performanceResponse = await getDocumentPerformance(timeframe);
      let documentPerformance = [];
      
      if (performanceResponse.success && performanceResponse.data?.documentPerformance) {
        documentPerformance = performanceResponse.data.documentPerformance;
        console.log(`📈 Real document performance data for ${timeframe}:`, documentPerformance);
      } else {
        // Fallback to empty performance data if API fails
        console.warn('Failed to load document performance data, using empty array');
        documentPerformance = [];
      }

      const analyticsData: AnalyticsData = {
        overview: {
          totalFeedback,
          averageRating,
          responseRate,
          improvementRate
        },
        trends,
        documentPerformance,
        insights: {
          topIssues: [
            'Document clarity needs improvement',
            'Technical specifications could be more detailed',
            'Stakeholder analysis requires enhancement',
            'Risk assessment needs more specificity'
          ],
          improvementAreas: [
            'Template optimization based on feedback',
            'AI prompt refinement',
            'Quality validation processes',
            'User experience enhancement'
          ],
          successStories: [
            `Average rating of ${averageRating.toFixed(1)}/5 over ${timeframe}`,
            `${totalFeedback} total feedback items collected`,
            `${responseRate}% response rate achieved`,
            `Quality trends ${timeframe === '7d' ? 'weekly' : timeframe === '30d' ? 'monthly' : 'quarterly'} analysis active`
          ]
        },
        recommendations: {
          immediate: [
            'Review feedback patterns and address common issues',
            'Update templates based on user suggestions',
            'Implement quality gates for document generation'
          ],
          strategic: [
            'Establish feedback-driven continuous improvement process',
            'Integrate real-time quality monitoring',
            'Develop document-specific quality benchmarks'
          ]
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading feedback analytics:', error);
      // Fallback to default values
      setAnalytics({
        overview: {
          totalFeedback: 0,
          averageRating: 0,
          responseRate: 0,
          improvementRate: 0
        },
        trends: [],
        documentPerformance: [],
        insights: {
          topIssues: ['No feedback data available'],
          improvementAreas: ['Start collecting feedback'],
          successStories: ['System ready for feedback collection']
        },
        recommendations: {
          immediate: ['Begin collecting user feedback'],
          strategic: ['Establish feedback collection processes']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackAnalytics();
  }, [projectId, timeframe]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics will appear once feedback is collected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-600 mt-1">
            Insights and trends from document feedback - {timeframe === '7d' ? 'Last 7 Days' : timeframe === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadFeedbackAnalytics}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalFeedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(analytics.overview.averageRating)}`}>
                {analytics.overview.averageRating.toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.responseRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.improvementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quality Trends - {timeframe === '7d' ? 'Daily' : timeframe === '30d' ? 'Weekly' : 'Monthly'} View
        </h2>
        <div className="h-64 flex items-end space-x-4">
          {analytics.trends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(trend.rating / 5) * 200}px` }}
              ></div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div>{trend.period}</div>
                <div className="font-medium">{trend.rating.toFixed(1)}</div>
                <div className="text-gray-400">{trend.volume} reviews</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Performance</h2>
        <div className="space-y-4">
          {analytics.documentPerformance.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 capitalize">
                  {doc.documentType.replace('-', ' ')}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{doc.feedbackCount} reviews</span>
                  <span>Quality: {doc.qualityScore}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= doc.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{doc.averageRating.toFixed(1)}</span>
                </div>
                {getTrendIcon(doc.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center text-sm font-medium text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Top Issues
              </h3>
              <ul className="space-y-1">
                {analytics.insights.topIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-gray-600">• {issue}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-sm font-medium text-yellow-700 mb-2">
                <Target className="w-4 h-4 mr-2" />
                Improvement Areas
              </h3>
              <ul className="space-y-1">
                {analytics.insights.improvementAreas.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600">• {area}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-sm font-medium text-green-700 mb-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Success Stories
              </h3>
              <ul className="space-y-1">
                {analytics.insights.successStories.map((story, index) => (
                  <li key={index} className="text-sm text-gray-600">• {story}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center text-sm font-medium text-orange-700 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                Immediate Actions
              </h3>
              <ul className="space-y-2">
                {analytics.recommendations.immediate.map((action, index) => (
                  <li key={index} className="text-sm text-gray-600 p-2 bg-orange-50 rounded border-l-2 border-orange-200">
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-sm font-medium text-blue-700 mb-2">
                <Lightbulb className="w-4 h-4 mr-2" />
                Strategic Improvements
              </h3>
              <ul className="space-y-2">
                {analytics.recommendations.strategic.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-600 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}