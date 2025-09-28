// Phase 3: Advanced Analytics & Predictive Insights - Predictive Analytics Dashboard
// Component for displaying AI-powered forecasting, risk prediction, and optimization recommendations

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Lightbulb,
  Shield,
  Clock
} from 'lucide-react';

interface PredictiveForecast {
  id: string;
  projectId: string;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  createdAt: Date;
}

interface RiskPrediction {
  id: string;
  projectId: string;
  riskType: string;
  probability: number;
  impact: string;
  timeframe: string;
  indicators: string[];
  mitigationStrategies: string[];
  confidence: number;
  createdAt: Date;
}

interface OptimizationRecommendation {
  id: string;
  projectId: string;
  category: string;
  title: string;
  description: string;
  expectedImpact: number;
  effort: string;
  priority: string;
  implementationSteps: string[];
  estimatedROI: number;
  confidence: number;
  createdAt: Date;
}

interface AnalyticsInsight {
  id: string;
  projectId: string;
  insightType: string;
  title: string;
  description: string;
  significance: string;
  dataPoints: any[];
  recommendations: string[];
  confidence: number;
  createdAt: Date;
}

export default function PredictiveAnalyticsDashboard() {
  const [forecasts, setForecasts] = useState<PredictiveForecast[]>([]);
  const [risks, setRisks] = useState<RiskPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forecasts' | 'risks' | 'recommendations' | 'insights'>('forecasts');

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    setLoading(true);
    try {
      // Mock data for Phase 3 demonstration
      const mockForecasts: PredictiveForecast[] = [
        {
          id: 'forecast_1',
          projectId: 'current-project',
          predictedValue: 92,
          confidence: 85,
          timeframe: '30d',
          createdAt: new Date()
        },
        {
          id: 'forecast_2',
          projectId: 'current-project',
          predictedValue: 88,
          confidence: 78,
          timeframe: '90d',
          createdAt: new Date()
        }
      ];

      const mockRisks: RiskPrediction[] = [
        {
          id: 'risk_1',
          projectId: 'current-project',
          riskType: 'COMPLIANCE_DEGRADATION',
          probability: 25,
          impact: 'MEDIUM',
          timeframe: '30d',
          indicators: ['Declining trend in DMBOK scores', 'Increased issue count'],
          mitigationStrategies: ['Implement additional monitoring', 'Review DMBOK processes'],
          confidence: 80,
          createdAt: new Date()
        }
      ];

      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec_1',
          projectId: 'current-project',
          category: 'PROCESS_IMPROVEMENT',
          title: 'Automate Compliance Validation',
          description: 'Implement automated compliance checks to improve efficiency and reduce manual errors.',
          expectedImpact: 15,
          effort: 'MEDIUM',
          priority: 'HIGH',
          implementationSteps: [
            'Deploy automated validation scripts',
            'Train team on new processes',
            'Monitor performance improvements'
          ],
          estimatedROI: 200,
          confidence: 85,
          createdAt: new Date()
        }
      ];

      const mockInsights: AnalyticsInsight[] = [
        {
          id: 'insight_1',
          projectId: 'current-project',
          insightType: 'PATTERN_DETECTION',
          title: 'Weekly Compliance Pattern',
          description: 'Compliance scores consistently peak on Wednesdays and decline on Fridays.',
          significance: 'MEDIUM',
          dataPoints: [{ day: 'Wednesday', avgScore: 95 }, { day: 'Friday', avgScore: 87 }],
          recommendations: [
            'Schedule compliance reviews on Wednesdays',
            'Implement additional monitoring on Fridays'
          ],
          confidence: 75,
          createdAt: new Date()
        }
      ];

      setForecasts(mockForecasts);
      setRisks(mockRisks);
      setRecommendations(mockRecommendations);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error loading predictive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'URGENT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered forecasting, risk prediction, and optimization recommendations for enhanced compliance management.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
                { id: 'risks', label: 'Risk Predictions', icon: AlertTriangle },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'insights', label: 'Analytics Insights', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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

        {/* Content */}
        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Compliance Forecasts</h2>
              <button
                onClick={loadPredictiveData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Generate New Forecast</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forecasts.map((forecast) => (
                <div key={forecast.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Compliance Score</span>
                    </div>
                    <span className="text-sm text-gray-500">{forecast.timeframe}</span>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {forecast.predictedValue}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {forecast.confidence}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{forecast.projectId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Generated:</span>
                      <span className="font-medium">
                        {new Date(forecast.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Risk Predictions</h2>
              <button
                onClick={loadPredictiveData}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Analyze Risks</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {risks.map((risk) => (
                <div key={risk.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">{risk.riskType.replace('_', ' ')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Probability</span>
                      <span className="font-semibold">{risk.probability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${risk.probability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Indicators</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {risk.indicators.map((indicator, index) => (
                          <li key={index}>• {indicator}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {risk.mitigationStrategies.map((strategy, index) => (
                          <li key={index}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Optimization Recommendations</h2>
              <button
                onClick={loadPredictiveData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Generate Recommendations</span>
              </button>
            </div>

            <div className="space-y-6">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        {recommendation.effort} Effort
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{recommendation.expectedImpact}%</div>
                      <div className="text-sm text-gray-600">Expected Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{recommendation.estimatedROI}%</div>
                      <div className="text-sm text-gray-600">Estimated ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{recommendation.confidence}%</div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {recommendation.implementationSteps.map((step, index) => (
                        <li key={index}>{index + 1}. {step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Analytics Insights</h2>
              <button
                onClick={loadPredictiveData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Generate Insights</span>
              </button>
            </div>

            <div className="space-y-6">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(insight.significance)}`}>
                      {insight.significance} Significance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Points</h4>
                      <div className="space-y-2">
                        {insight.dataPoints.map((point, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {typeof point === 'object' ? JSON.stringify(point, null, 2) : point}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Confidence: {insight.confidence}%</span>
                      <span>Generated: {new Date(insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
