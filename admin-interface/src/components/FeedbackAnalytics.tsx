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
  Star
} from 'lucide-react';

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

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalFeedback: 127,
          averageRating: 3.8,
          responseRate: 68,
          improvementRate: 23
        },
        trends: [
          { period: 'Week 1', rating: 3.2, volume: 15 },
          { period: 'Week 2', rating: 3.5, volume: 22 },
          { period: 'Week 3', rating: 3.7, volume: 28 },
          { period: 'Week 4', rating: 3.8, volume: 31 },
          { period: 'Week 5', rating: 4.1, volume: 31 }
        ],
        documentPerformance: [
          {
            documentType: 'project-charter',
            averageRating: 4.2,
            feedbackCount: 18,
            qualityScore: 87,
            trend: 'up'
          },
          {
            documentType: 'risk-management-plan',
            averageRating: 3.1,
            feedbackCount: 25,
            qualityScore: 72,
            trend: 'down'
          },
          {
            documentType: 'stakeholder-register',
            averageRating: 4.5,
            feedbackCount: 12,
            qualityScore: 93,
            trend: 'stable'
          }
        ],
        insights: {
          topIssues: [
            'Missing stakeholder analysis details',
            'Risk mitigation strategies too generic',
            'Unclear acceptance criteria',
            'Insufficient technical specifications'
          ],
          improvementAreas: [
            'PMBOK compliance enhancement',
            'Template customization',
            'AI prompt optimization',
            'Quality validation processes'
          ],
          successStories: [
            'Stakeholder engagement plans consistently rated 4.5+',
            'Project charters show 25% quality improvement',
            'User feedback response time reduced by 40%'
          ]
        },
        recommendations: {
          immediate: [
            'Address 3 critical issues in risk management documents',
            'Review and update AI prompts for low-rated document types',
            'Implement quality gates for document generation'
          ],
          strategic: [
            'Establish feedback-driven continuous improvement process',
            'Integrate real-time quality monitoring',
            'Develop document-specific quality benchmarks'
          ]
        }
      };

      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
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
          <p className="text-gray-600 mt-1">Insights and trends from document feedback</p>
        </div>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Trends</h2>
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