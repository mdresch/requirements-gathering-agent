'use client';

import React, { useState } from 'react';
import PerformanceGauge from './PerformanceGauge';
import CompactPerformanceGauge from './CompactPerformanceGauge';

export default function PerformanceGaugeDemo() {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showTrends, setShowTrends] = useState(true);
  const [showPercentage, setShowPercentage] = useState(true);

  const demoData = [
    {
      title: 'BABOK Compliance',
      subtitle: 'Business Analysis Standards',
      projected: 85,
      actual: 92
    },
    {
      title: 'PMBOK Compliance',
      subtitle: 'Project Management Standards',
      projected: 80,
      actual: 76
    },
    {
      title: 'Overall Quality Score',
      subtitle: 'Comprehensive Quality Assessment',
      projected: 90,
      actual: 88
    },
    {
      title: 'User Feedback Score',
      subtitle: 'User Satisfaction Rating',
      projected: 4.0,
      actual: 3.8,
      maxValue: 5
    },
    {
      title: 'Document Quality',
      subtitle: 'Generated Document Quality',
      projected: 95,
      actual: 93
    },
    {
      title: 'System Performance',
      subtitle: 'Platform Uptime & Response',
      projected: 98,
      actual: 99.2
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Gauge Demo</h1>
        <p className="text-gray-600">
          Interactive demonstration of performance gauges showing projected vs actual scores
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gauge Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTrends}
                onChange={(e) => setShowTrends(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Trends</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Percentage</span>
            </label>
          </div>
        </div>
      </div>

      {/* Full-Size Gauges */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Full-Size Performance Gauges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoData.map((data, index) => (
            <PerformanceGauge
              key={index}
              projectedScore={data.projected}
              actualScore={data.actual}
              title={data.title}
              subtitle={data.subtitle}
              size={selectedSize}
              showTrend={showTrends}
              showPercentage={showPercentage}
              maxValue={data.maxValue || 100}
            />
          ))}
        </div>
      </div>

      {/* Compact Gauges */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Compact Performance Gauges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demoData.slice(0, 4).map((data, index) => (
            <CompactPerformanceGauge
              key={index}
              projectedScore={data.projected}
              actualScore={data.actual}
              title={data.title}
              subtitle={data.subtitle}
              maxValue={data.maxValue || 100}
            />
          ))}
        </div>
      </div>

      {/* Performance Scenarios */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exceeding Expectations */}
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-4">Exceeding Expectations</h3>
            <PerformanceGauge
              projectedScore={80}
              actualScore={95}
              title="Excellent Performance"
              subtitle="Significantly above target"
              size="medium"
              showTrend={true}
            />
          </div>

          {/* Meeting Expectations */}
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-4">Meeting Expectations</h3>
            <PerformanceGauge
              projectedScore={85}
              actualScore={87}
              title="Good Performance"
              subtitle="Close to target"
              size="medium"
              showTrend={true}
            />
          </div>

          {/* Below Expectations */}
          <div>
            <h3 className="text-lg font-medium text-red-900 mb-4">Below Expectations</h3>
            <PerformanceGauge
              projectedScore={90}
              actualScore={72}
              title="Needs Improvement"
              subtitle="Significantly below target"
              size="medium"
              showTrend={true}
            />
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Usage Instructions</h2>
        <div className="space-y-3 text-blue-800">
          <p>
            <strong>Performance Gauges</strong> provide a visual comparison between projected targets and actual performance metrics.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Green (Exceeding):</strong> Actual score is at or above the projected target</li>
            <li><strong>Blue (Meeting):</strong> Actual score is within 90% of the projected target</li>
            <li><strong>Red (Below):</strong> Actual score is below 90% of the projected target</li>
            <li><strong>Trend Icons:</strong> Show whether performance is improving (↑), declining (↓), or stable (→)</li>
            <li><strong>Needle:</strong> Points to the actual score on the gauge</li>
            <li><strong>Arc Colors:</strong> Gray background, colored progress arc showing actual performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
