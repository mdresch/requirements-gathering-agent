'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface QualityTrendsChartProps {
  data: Array<{
    period: string;
    date: string;
    qualityScore: number;
    babokScore: number;
    pmbokScore: number;
    feedbackScore: number;
  }>;
  chartType?: 'bar' | 'line' | 'area';
  showMultipleMetrics?: boolean;
  title?: string;
  className?: string;
}

export default function QualityTrendsChart({ 
  data, 
  chartType = 'bar', 
  showMultipleMetrics = true,
  title = "Quality Trends Over Time",
  className = ""
}: QualityTrendsChartProps) {
  
  // Calculate trend percentage
  const calculateTrend = () => {
    if (data.length < 2) return 0;
    
    const firstScore = data[0].qualityScore;
    const lastScore = data[data.length - 1].qualityScore;
    const trend = ((lastScore - firstScore) / firstScore) * 100;
    
    return Math.round(trend);
  };

  const trendPercentage = calculateTrend();
  const isPositive = trendPercentage > 0;

  // Prepare chart data with better formatting
  const chartData = data.map(item => ({
    ...item,
    period: item.period.replace('Week ', 'W'),
    qualityScore: Math.round(item.qualityScore),
    babokScore: Math.round(item.babokScore),
    pmbokScore: Math.round(item.pmbokScore),
    feedbackScore: Math.round(item.feedbackScore * 20) // Convert to percentage
  }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                zIndex: 9999,
                position: 'relative'
              }}
              wrapperStyle={{
                zIndex: 9999
              }}
              formatter={(value: number, name: string) => [
                `${value}%`, 
                name.replace('Score', ' Score').replace('feedbackScore', 'Feedback Score')
              ]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="qualityScore" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Overall Quality"
            />
            {showMultipleMetrics && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="babokScore" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  name="BABOK Compliance"
                />
                <Line 
                  type="monotone" 
                  dataKey="pmbokScore" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                  name="PMBOK Compliance"
                />
                <Line 
                  type="monotone" 
                  dataKey="feedbackScore" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  name="Feedback Score"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                zIndex: 9999,
                position: 'relative'
              }}
              wrapperStyle={{
                zIndex: 9999
              }}
              formatter={(value: number, name: string) => [
                `${value}%`, 
                name.replace('Score', ' Score').replace('feedbackScore', 'Feedback Score')
              ]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="qualityScore" 
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={3}
              name="Overall Quality"
            />
            {showMultipleMetrics && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="babokScore" 
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="BABOK Compliance"
                />
                <Area 
                  type="monotone" 
                  dataKey="pmbokScore" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="PMBOK Compliance"
                />
                <Area 
                  type="monotone" 
                  dataKey="feedbackScore" 
                  stroke="#F59E0B" 
                  fill="#F59E0B"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Feedback Score"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default bar chart
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            stroke="#666"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              `${value}%`, 
              name.replace('Score', ' Score').replace('feedbackScore', 'Feedback Score')
            ]}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="qualityScore" 
            fill="#3B82F6" 
            name="Overall Quality"
            radius={[4, 4, 0, 0]}
          />
          {showMultipleMetrics && (
            <>
              <Bar 
                dataKey="babokScore" 
                fill="#10B981" 
                name="BABOK Compliance"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="pmbokScore" 
                fill="#8B5CF6" 
                name="PMBOK Compliance"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="feedbackScore" 
                fill="#F59E0B" 
                name="Feedback Score"
                radius={[4, 4, 0, 0]}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 relative z-10 quality-trends-chart ${className}`}>
      {/* Header with Trend Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Quality progression over time</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Trend Indicator */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{trendPercentage}%
            </div>
            <div className="text-xs text-gray-500">
              {isPositive ? 'Improvement' : 'Decline'} this period
            </div>
          </div>
          
          {/* Current vs Previous */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {data.length > 0 ? `${data[data.length - 1].qualityScore}%` : '0%'}
            </div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {data.length > 0 ? `${data[0].qualityScore}%` : '0%'}
            </div>
            <div className="text-xs text-gray-500">Starting</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {renderChart()}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.qualityScore, 0) / data.length) : 0}%
          </div>
          <div className="text-xs text-gray-500">Average Quality</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? Math.max(...data.map(d => d.qualityScore)) : 0}%
          </div>
          <div className="text-xs text-gray-500">Peak Quality</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? Math.min(...data.map(d => d.qualityScore)) : 0}%
          </div>
          <div className="text-xs text-gray-500">Lowest Quality</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.length}
          </div>
          <div className="text-xs text-gray-500">Data Points</div>
        </div>
      </div>
    </div>
  );
}

// Chart Type Selector Component
export function QualityTrendsChartWithControls({ data }: { data: QualityTrendsChartProps['data'] }) {
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area'>('bar');
  const [showMultipleMetrics, setShowMultipleMetrics] = React.useState(true);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMultiple"
              checked={showMultipleMetrics}
              onChange={(e) => setShowMultipleMetrics(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showMultiple" className="text-sm text-gray-700">
              Show all metrics
            </label>
          </div>
        </div>
      </div>

      {/* Chart */}
      <QualityTrendsChart
        data={data}
        chartType={chartType}
        showMultipleMetrics={showMultipleMetrics}
      />
    </div>
  );
}
