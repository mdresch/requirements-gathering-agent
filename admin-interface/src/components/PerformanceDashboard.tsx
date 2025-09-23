'use client';

import React, { useState, useEffect } from 'react';
import PerformanceGauge from './PerformanceGauge';
import { apiClient } from '../lib/api';

interface PerformanceMetrics {
  babokCompliance: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
  pmbokCompliance: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
  overallQuality: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
  feedbackScore: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
  documentQuality: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
  systemPerformance: {
    projected: number;
    actual: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface PerformanceDashboardProps {
  projectId?: string;
}

export default function PerformanceDashboard({ projectId }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceMetrics();
  }, [projectId]);

  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current metrics
      const [complianceResponse, feedbackResponse, projectsResponse] = await Promise.all([
        apiClient.getStandardsCompliance(),
        apiClient.getFeedbackSummary(),
        apiClient.getProjects()
      ]);

      // Calculate projected scores based on historical data and industry standards
      const projectedScores = {
        babokCompliance: 85, // Industry standard for BABOK compliance
        pmbokCompliance: 82, // Industry standard for PMBOK compliance
        overallQuality: 88,  // Target overall quality score
        feedbackScore: 4.0,  // Target feedback rating
        documentQuality: 90, // Target document quality
        systemPerformance: 95 // Target system performance
      };

      // Get actual scores
      const actualScores = {
        babokCompliance: complianceResponse.success 
          ? complianceResponse.data?.standardsCompliance?.babok || 0 
          : 0,
        pmbokCompliance: complianceResponse.success 
          ? complianceResponse.data?.standardsCompliance?.pmbok || 0 
          : 0,
        overallQuality: complianceResponse.success 
          ? complianceResponse.data?.overallScore || 0 
          : 0,
        feedbackScore: feedbackResponse.success 
          ? feedbackResponse.data?.averageRating || 0 
          : 0,
        documentQuality: calculateDocumentQuality(projectsResponse),
        systemPerformance: 99.2 // Mock system performance
      };

      // Calculate trends (simplified - in real implementation, this would compare with historical data)
      const trends = {
        babokCompliance: (actualScores.babokCompliance >= projectedScores.babokCompliance ? 'up' : 'down') as 'up' | 'down' | 'stable',
        pmbokCompliance: (actualScores.pmbokCompliance >= projectedScores.pmbokCompliance ? 'up' : 'down') as 'up' | 'down' | 'stable',
        overallQuality: (actualScores.overallQuality >= projectedScores.overallQuality ? 'up' : 'down') as 'up' | 'down' | 'stable',
        feedbackScore: (actualScores.feedbackScore >= projectedScores.feedbackScore ? 'up' : 'down') as 'up' | 'down' | 'stable',
        documentQuality: (actualScores.documentQuality >= projectedScores.documentQuality ? 'up' : 'down') as 'up' | 'down' | 'stable',
        systemPerformance: (actualScores.systemPerformance >= projectedScores.systemPerformance ? 'up' : 'down') as 'up' | 'down' | 'stable'
      };

      setMetrics({
        babokCompliance: {
          projected: projectedScores.babokCompliance,
          actual: actualScores.babokCompliance,
          trend: trends.babokCompliance
        },
        pmbokCompliance: {
          projected: projectedScores.pmbokCompliance,
          actual: actualScores.pmbokCompliance,
          trend: trends.pmbokCompliance
        },
        overallQuality: {
          projected: projectedScores.overallQuality,
          actual: actualScores.overallQuality,
          trend: trends.overallQuality
        },
        feedbackScore: {
          projected: projectedScores.feedbackScore,
          actual: actualScores.feedbackScore,
          trend: trends.feedbackScore
        },
        documentQuality: {
          projected: projectedScores.documentQuality,
          actual: actualScores.documentQuality,
          trend: trends.documentQuality
        },
        systemPerformance: {
          projected: projectedScores.systemPerformance,
          actual: actualScores.systemPerformance,
          trend: trends.systemPerformance
        }
      });

    } catch (error) {
      console.error('Error loading performance metrics:', error);
      setError('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const calculateDocumentQuality = (projectsResponse: any): number => {
    if (!projectsResponse.success || !projectsResponse.data) {
      return 85; // Default value
    }

    // Calculate average document quality across all projects
    const projects = projectsResponse.data;
    let totalQuality = 0;
    let projectCount = 0;

    projects.forEach((project: any) => {
      if (project.qualityScore) {
        totalQuality += project.qualityScore;
        projectCount++;
      }
    });

    return projectCount > 0 ? Math.round(totalQuality / projectCount) : 85;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading performance metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">
          Real-time comparison between projected targets and actual performance metrics
        </p>
      </div>

      {/* Performance Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* BABOK Compliance Gauge */}
        <PerformanceGauge
          projectedScore={metrics.babokCompliance.projected}
          actualScore={metrics.babokCompliance.actual}
          title="BABOK Compliance"
          subtitle="Business Analysis Standards"
          size="medium"
          showTrend={true}
        />

        {/* PMBOK Compliance Gauge */}
        <PerformanceGauge
          projectedScore={metrics.pmbokCompliance.projected}
          actualScore={metrics.pmbokCompliance.actual}
          title="PMBOK Compliance"
          subtitle="Project Management Standards"
          size="medium"
          showTrend={true}
        />

        {/* Overall Quality Gauge */}
        <PerformanceGauge
          projectedScore={metrics.overallQuality.projected}
          actualScore={metrics.overallQuality.actual}
          title="Overall Quality Score"
          subtitle="Comprehensive Quality Assessment"
          size="medium"
          showTrend={true}
        />

        {/* Feedback Score Gauge */}
        <PerformanceGauge
          projectedScore={metrics.feedbackScore.projected * 20} // Convert to percentage
          actualScore={metrics.feedbackScore.actual * 20}
          title="User Feedback Score"
          subtitle="User Satisfaction Rating"
          size="medium"
          showTrend={true}
          showPercentage={true}
        />

        {/* Document Quality Gauge */}
        <PerformanceGauge
          projectedScore={metrics.documentQuality.projected}
          actualScore={metrics.documentQuality.actual}
          title="Document Quality"
          subtitle="Generated Document Quality"
          size="medium"
          showTrend={true}
        />

        {/* System Performance Gauge */}
        <PerformanceGauge
          projectedScore={metrics.systemPerformance.projected}
          actualScore={metrics.systemPerformance.actual}
          title="System Performance"
          subtitle="Platform Uptime & Response"
          size="medium"
          showTrend={true}
        />
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Metrics exceeding targets */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Exceeding Targets</h3>
            <div className="space-y-2">
              {Object.entries(metrics).map(([key, metric]) => {
                if (metric.actual >= metric.projected) {
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-green-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold text-green-900">
                        +{(metric.actual - metric.projected).toFixed(1)}%
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Metrics below targets */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">Below Targets</h3>
            <div className="space-y-2">
              {Object.entries(metrics).map(([key, metric]) => {
                if (metric.actual < metric.projected) {
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-red-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold text-red-900">
                        {(metric.actual - metric.projected).toFixed(1)}%
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Overall Performance Score */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Overall Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Target Achievement</span>
                <span className="text-lg font-bold text-blue-900">
                  {Math.round(
                    (Object.values(metrics).filter(m => m.actual >= m.projected).length / 
                     Object.keys(metrics).length) * 100
                  )}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Average Variance</span>
                <span className="text-lg font-bold text-blue-900">
                  {Object.values(metrics).reduce((sum, m) => sum + (m.actual - m.projected), 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {Object.entries(metrics).map(([key, metric]) => {
                if (metric.actual >= metric.projected) {
                  return (
                    <li key={key} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} is performing above target
                      </span>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="text-lg font-medium text-red-900 mb-3">Areas for Improvement</h3>
            <ul className="space-y-2">
              {Object.entries(metrics).map(([key, metric]) => {
                if (metric.actual < metric.projected) {
                  const gap = metric.projected - metric.actual;
                  return (
                    <li key={key} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} needs {gap.toFixed(1)}% improvement
                      </span>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
