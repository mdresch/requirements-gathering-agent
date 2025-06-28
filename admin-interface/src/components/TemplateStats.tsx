'use client';

import { useState, useEffect } from 'react';
import { TemplateStats as ITemplateStats, ExtendedTemplateStats } from '@/types/template';
import { apiClient } from '@/lib/api';
import { BarChart3, FileText, Tags, Layers, Activity } from 'lucide-react';

export default function TemplateStats() {
  const [stats, setStats] = useState<ExtendedTemplateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.getTemplateStats();
        if (response.success && response.data) {
          // Transform the basic stats into extended stats for the UI
          const basicStats = response.data;
          const extendedStats: ExtendedTemplateStats = {
            ...basicStats,
            totalTemplates: basicStats.total,
            categoriesCount: Object.keys(basicStats.byCategory).length,
            topCategories: Object.entries(basicStats.byCategory)
              .map(([category, count]) => ({ category, count }))
              .sort((a, b) => b.count - a.count),
            topTags: Object.entries(basicStats.byType)
              .map(([tag, count]) => ({ tag, count }))
              .sort((a, b) => b.count - a.count),
            recentActivity: [], // This would need to come from a different API endpoint
          };
          setStats(extendedStats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>Unable to load statistics</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Templates',
      value: stats.totalTemplates,
      icon: FileText,
      color: 'blue',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount,
      icon: Layers,
      color: 'green',
    },
    {
      title: 'Template Types',
      value: stats.topTags.length,
      icon: Tags,
      color: 'purple',
    },
    {
      title: 'Active Templates',
      value: stats.totalTemplates, // Assuming all are active for now
      icon: Activity,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-600' },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" />
        Template Statistics
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const colors = getColorClasses(card.color);
          return (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <card.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {stats.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((category.count / stats.totalTemplates) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Template Types</h3>
          <div className="space-y-3">
            {stats.topTags.slice(0, 5).map((type, index) => (
              <div key={type.tag} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    #{index + 1}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {type.tag}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((type.count / stats.totalTemplates) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                    {type.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">{stats.totalTemplates}</p>
              <p className="text-gray-600">Total Templates</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">{stats.categoriesCount}</p>
              <p className="text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">{stats.topTags.length}</p>
              <p className="text-gray-600">Template Types</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
