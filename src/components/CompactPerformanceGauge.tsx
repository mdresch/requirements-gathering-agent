'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface CompactPerformanceGaugeProps {
  projectedScore: number;
  actualScore: number;
  title: string;
  subtitle?: string;
  maxValue?: number;
  className?: string;
}

export default function CompactPerformanceGauge({
  projectedScore,
  actualScore,
  title,
  subtitle,
  maxValue = 100,
  className = ''
}: CompactPerformanceGaugeProps) {
  
  const difference = actualScore - projectedScore;
  const percentage = Math.round((actualScore / projectedScore) * 100);
  const status = actualScore >= projectedScore ? 'exceeding' : actualScore >= projectedScore * 0.9 ? 'meeting' : 'below';
  const trend = actualScore > projectedScore ? 'up' : actualScore < projectedScore ? 'down' : 'stable';

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
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Target className="w-3 h-3 text-blue-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeding':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'meeting':
        return <Target className="w-3 h-3 text-blue-600" />;
      case 'below':
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default:
        return <Target className="w-3 h-3 text-gray-600" />;
    }
  };

  // Calculate progress percentage for the circular progress
  const progress = (actualScore / maxValue) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-600 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {getStatusIcon(status)}
          {getTrendIcon(trend)}
        </div>
      </div>

      {/* Circular Progress Gauge */}
      <div className="flex items-center justify-center mb-3">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="6"
            />
            
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              fill="none"
              stroke={getStatusColor(status)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold" style={{ color: getStatusColor(status) }}>
              {actualScore}
            </div>
            <div className="text-xs text-gray-500">/ {maxValue}</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Target</span>
          <span className="text-xs font-semibold text-gray-900">{projectedScore}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Variance</span>
          <span className={`text-xs font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {difference >= 0 ? '+' : ''}{difference.toFixed(1)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Status</span>
          <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(status) }}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

// Example usage for a compact dashboard
export function CompactPerformanceGrid() {
  const gaugeData = [
    {
      title: 'BABOK',
      subtitle: 'Compliance',
      projected: 85,
      actual: 92
    },
    {
      title: 'PMBOK',
      subtitle: 'Compliance',
      projected: 80,
      actual: 76
    },
    {
      title: 'Quality',
      subtitle: 'Score',
      projected: 90,
      actual: 88
    },
    {
      title: 'Feedback',
      subtitle: 'Rating',
      projected: 4.0,
      actual: 3.8,
      maxValue: 5
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {gaugeData.map((gauge, index) => (
        <CompactPerformanceGauge
          key={index}
          title={gauge.title}
          subtitle={gauge.subtitle}
          projectedScore={gauge.projected}
          actualScore={gauge.actual}
          maxValue={gauge.maxValue || 100}
        />
      ))}
    </div>
  );
}
