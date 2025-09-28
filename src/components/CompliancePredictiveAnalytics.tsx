// Predictive Analytics Component for Standards Compliance Dashboard
// Provides AI-powered insights and forecasting capabilities

'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Brain,
  Calendar,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
}

interface ForecastData {
  period: string;
  predictedScore: number;
  confidence: number;
  factors: string[];
}

interface PredictiveAnalyticsProps {
  currentMetrics: any;
  historicalData: any[];
  onInsightSelect?: (insight: PredictiveInsight) => void;
}

export default function CompliancePredictiveAnalytics({ 
  currentMetrics, 
  historicalData, 
  onInsightSelect 
}: PredictiveAnalyticsProps) {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-powered analysis
    const generateInsights = () => {
      const mockInsights: PredictiveInsight[] = [
        {
          id: 'insight-1',
          type: 'trend',
          title: 'BABOK Compliance Trending Upward',
          description: 'Based on recent improvements, BABOK compliance is expected to reach 96% within 30 days.',
          confidence: 87,
          impact: 'high',
          timeframe: '30 days',
          actionable: true
        },
        {
          id: 'insight-2',
          type: 'risk',
          title: 'DMBOK Compliance Risk',
          description: 'Current trajectory suggests DMBOK compliance may drop below 70% if no action is taken.',
          confidence: 73,
          impact: 'medium',
          timeframe: '60 days',
          actionable: true
        },
        {
          id: 'insight-3',
          type: 'opportunity',
          title: 'ISO Standards Optimization',
          description: 'Implementing recommended practices could improve ISO compliance by 8-12%.',
          confidence: 91,
          impact: 'high',
          timeframe: '45 days',
          actionable: true
        },
        {
          id: 'insight-4',
          type: 'recommendation',
          title: 'Cross-Standard Synergies',
          description: 'Aligning PMBOK and BABOK processes could reduce overall compliance effort by 25%.',
          confidence: 78,
          impact: 'medium',
          timeframe: '90 days',
          actionable: true
        }
      ];
      setInsights(mockInsights);
    };

    const generateForecast = () => {
      const mockForecast: ForecastData[] = [
        { period: 'Next Week', predictedScore: 88, confidence: 95, factors: ['Current trend', 'Planned improvements'] },
        { period: 'Next Month', predictedScore: 91, confidence: 87, factors: ['Process optimization', 'Team training'] },
        { period: 'Next Quarter', predictedScore: 94, confidence: 73, factors: ['System upgrades', 'Policy updates'] },
        { period: 'Next Year', predictedScore: 96, confidence: 65, factors: ['Long-term initiatives', 'Technology adoption'] }
      ];
      setForecast(mockForecast);
    };

    setTimeout(() => {
      generateInsights();
      generateForecast();
      setLoading(false);
    }, 2000);
  }, [currentMetrics, historicalData]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-green-600 bg-green-50';
      case 'risk': return 'text-red-600 bg-red-50';
      case 'opportunity': return 'text-blue-600 bg-blue-50';
      case 'recommendation': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis in Progress</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Predictive Insights */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">Predictive analysis based on current trends and historical data</p>
        </div>
        
        <div className="p-4 space-y-4">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => onInsightSelect?.(insight)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.confidence >= 80 ? 'bg-green-100 text-green-800' :
                      insight.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{insight.timeframe}</span>
                    </div>
                    <span className={`px-2 py-1 rounded ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                    {insight.actionable && (
                      <span className="text-green-600 font-medium">Actionable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Compliance Forecast</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">Predicted compliance scores over time</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {forecast.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{item.predictedScore}%</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.period}</h4>
                    <p className="text-xs text-gray-600">{item.factors.join(', ')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    item.confidence >= 80 ? 'text-green-600' :
                    item.confidence >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {item.confidence}% confidence
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
