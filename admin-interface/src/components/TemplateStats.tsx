'use client';

import { useMemo, useEffect, useState } from 'react';
import { BarChart3, FileText, Tags, Layers, Activity, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function TemplateStats() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [usageAnalytics, setUsageAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load templates and usage analytics in parallel
        const [templatesResponse, analyticsResponse] = await Promise.all([
          apiClient.getTemplates({ page: 1, limit: 1000 }),
          apiClient.getTemplateUsageAnalytics()
        ]);
        
        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data.templates || []);
        }
        
        if (analyticsResponse.success && analyticsResponse.data) {
          setUsageAnalytics(analyticsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load data for stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute stats from API templates
  const stats = useMemo(() => {
    // Filter out deleted templates for accurate counts
    const activeTemplates = templates.filter((tpl: any) => 
      !tpl.deletedAt && !tpl.is_deleted
    );
    
    const totalTemplates = activeTemplates.length;
    const categories: Record<string, number> = {};
    const templateTypes: Record<string, number> = {};
    
    activeTemplates.forEach((tpl: any) => {
      // Count categories
      if (tpl.category) {
        categories[tpl.category] = (categories[tpl.category] || 0) + 1;
      }
      
      // Count template types
      if (tpl.template_type) {
        templateTypes[tpl.template_type] = (templateTypes[tpl.template_type] || 0) + 1;
      }
    });
    
    return {
      totalTemplates,
      categoriesCount: Object.keys(categories).length,
      topCategories: Object.entries(categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      topTemplateTypes: Object.entries(templateTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      activeTemplates: totalTemplates,
    };
  }, [templates]);

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
      value: stats.topTemplateTypes.length,
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Template Statistics
        </h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading template statistics...</p>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
            {stats.topTemplateTypes.slice(0, 5).map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    #{index + 1}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {type.type}
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

      {/* Template Usage Analytics */}
      {usageAnalytics && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Template Usage Analytics
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Popular Templates */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Most Popular Templates</h4>
              <div className="space-y-3">
                {usageAnalytics.mostPopularTemplates.slice(0, 5).map((template: any, index: number) => (
                  <div key={template.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 mr-2">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-900 truncate max-w-[200px]" title={template.name}>
                        {template.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((template.usage / usageAnalytics.totalUsage) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                        {template.usage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Templates */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Trending Templates</h4>
              <div className="space-y-4">
                {/* Trending Up */}
                <div>
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-700">Trending Up</span>
                  </div>
                  <div className="space-y-2">
                    {usageAnalytics.trendingUp.slice(0, 3).map((template: any) => (
                      <div key={template.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 truncate max-w-[250px]" title={template.name}>
                          {template.name}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-green-600 mr-1">+</span>
                          <span className="text-sm font-medium text-gray-900">{template.usage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Down */}
                <div>
                  <div className="flex items-center mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm font-medium text-red-700">Trending Down</span>
                  </div>
                  <div className="space-y-2">
                    {usageAnalytics.trendingDown.slice(0, 3).map((template: any) => (
                      <div key={template.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 truncate max-w-[250px]" title={template.name}>
                          {template.name}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-red-600 mr-1">-</span>
                          <span className="text-sm font-medium text-gray-900">{template.usage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
