'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface PerformanceGaugeProps {
  projectedScore: number;
  actualScore: number;
  title: string;
  subtitle?: string;
  maxValue?: number;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  showPercentage?: boolean;
  className?: string;
}

interface GaugeData {
  projected: number;
  actual: number;
  difference: number;
  percentage: number;
  status: 'exceeding' | 'meeting' | 'below';
  trend: 'up' | 'down' | 'stable';
}

export default function PerformanceGauge({
  projectedScore,
  actualScore,
  title,
  subtitle,
  maxValue = 100,
  size = 'medium',
  showTrend = true,
  showPercentage = true,
  className = ''
}: PerformanceGaugeProps) {
  
  const gaugeData: GaugeData = {
    projected: projectedScore,
    actual: actualScore,
    difference: actualScore - projectedScore,
    percentage: Math.round((actualScore / projectedScore) * 100),
    status: actualScore >= projectedScore ? 'exceeding' : actualScore >= projectedScore * 0.9 ? 'meeting' : 'below',
    trend: actualScore > projectedScore ? 'up' : actualScore < projectedScore ? 'down' : 'stable'
  };

  const sizeClasses = {
    small: 'w-48 h-48',
    medium: 'w-64 h-64',
    large: 'w-80 h-80'
  };

  const textSizes = {
    small: {
      title: 'text-sm',
      score: 'text-2xl',
      subtitle: 'text-xs',
      difference: 'text-sm'
    },
    medium: {
      title: 'text-base',
      score: 'text-3xl',
      subtitle: 'text-sm',
      difference: 'text-base'
    },
    large: {
      title: 'text-lg',
      score: 'text-4xl',
      subtitle: 'text-base',
      difference: 'text-lg'
    }
  };

  // Calculate angles for the gauge arc
  const projectedAngle = (gaugeData.projected / maxValue) * 180;
  const actualAngle = (gaugeData.actual / maxValue) * 180;
  
  // Colors based on performance
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding':
        return '#10B981'; // green
      case 'meeting':
        return '#3B82F6'; // blue
      case 'below':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeding':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'meeting':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'below':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-gray-900 ${textSizes[size].title}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-gray-600 ${textSizes[size].subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(gaugeData.status)}
          {showTrend && getTrendIcon(gaugeData.trend)}
        </div>
      </div>

      {/* Gauge Container */}
      <div className="flex justify-center">
        <div className={`relative ${sizeClasses[size]}`}>
          {/* SVG Gauge */}
          <svg 
            className="transform -rotate-90" 
            viewBox="0 0 200 100" 
            width="100%" 
            height="100%"
          >
            {/* Background Arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Projected Score Arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#6B7280"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(gaugeData.projected / maxValue) * 251.2} 251.2`}
              className="opacity-60"
            />
            
            {/* Actual Score Arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke={getStatusColor(gaugeData.status)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(gaugeData.actual / maxValue) * 251.2} 251.2`}
              className="drop-shadow-sm"
            />
            
            {/* Center Needle for Actual Score */}
            <line
              x1="100"
              y1="80"
              x2={100 + 60 * Math.cos(((gaugeData.actual / maxValue) * 180 - 90) * Math.PI / 180)}
              y2={80 + 60 * Math.sin(((gaugeData.actual / maxValue) * 180 - 90) * Math.PI / 180)}
              stroke={getStatusColor(gaugeData.status)}
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
            
            {/* Center Dot */}
            <circle cx="100" cy="80" r="6" fill="white" stroke={getStatusColor(gaugeData.status)} strokeWidth="2" />
            
            {/* Scale Markers */}
            {[0, 25, 50, 75, 100].map((value, index) => {
              const angle = (value / maxValue) * 180 - 90;
              const x1 = 100 + 70 * Math.cos(angle * Math.PI / 180);
              const y1 = 80 + 70 * Math.sin(angle * Math.PI / 180);
              const x2 = 100 + 80 * Math.cos(angle * Math.PI / 180);
              const y2 = 80 + 80 * Math.sin(angle * Math.PI / 180);
              
              return (
                <g key={index}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6B7280" strokeWidth="2" />
                  <text
                    x={100 + 90 * Math.cos(angle * Math.PI / 180)}
                    y={80 + 90 * Math.sin(angle * Math.PI / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-600 text-xs font-medium"
                    transform="rotate(90 0 0)"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className={`font-bold ${getStatusColor(gaugeData.status)} ${textSizes[size].score}`}>
              {gaugeData.actual}
              {showPercentage && <span className="text-lg">%</span>}
            </div>
            <div className="text-xs text-gray-500 mt-1">Actual Score</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">Projected</div>
          <div className="font-semibold text-gray-900">{gaugeData.projected}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Difference</div>
          <div className={`font-semibold ${gaugeData.difference >= 0 ? 'text-green-600' : 'text-red-600'} ${textSizes[size].difference}`}>
            {gaugeData.difference >= 0 ? '+' : ''}{gaugeData.difference.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(gaugeData.status)}
            <span className="text-sm font-medium text-gray-900">
              {gaugeData.status === 'exceeding' && 'Exceeding Expectations'}
              {gaugeData.status === 'meeting' && 'Meeting Expectations'}
              {gaugeData.status === 'below' && 'Below Expectations'}
            </span>
          </div>
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {gaugeData.percentage}% of projected
            </span>
          )}
        </div>
      </div>

      {/* Trend Indicator */}
      {showTrend && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-sm">
          {getTrendIcon(gaugeData.trend)}
          <span className="text-gray-600">
            {gaugeData.trend === 'up' && 'Above target'}
            {gaugeData.trend === 'down' && 'Below target'}
            {gaugeData.trend === 'stable' && 'On target'}
          </span>
        </div>
      )}
    </div>
  );
}

// Example usage component
export function PerformanceGaugeExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <PerformanceGauge
        projectedScore={85}
        actualScore={92}
        title="BABOK Compliance"
        subtitle="Business Analysis Standards"
        size="medium"
      />
      
      <PerformanceGauge
        projectedScore={80}
        actualScore={76}
        title="PMBOK Compliance"
        subtitle="Project Management Standards"
        size="medium"
      />
      
      <PerformanceGauge
        projectedScore={90}
        actualScore={88}
        title="Overall Quality Score"
        subtitle="Document Quality Assessment"
        size="medium"
      />
    </div>
  );
}
