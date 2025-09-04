'use client';

import { useMemo } from 'react';
import templates from '@/data/templates.json';
import { BarChart3, FileText, Tags, Layers, Activity } from 'lucide-react';

export default function TemplateStats() {
  // Compute stats from local templates.json
  const stats = useMemo(() => {
    const totalTemplates = Array.isArray(templates) ? templates.length : 0;
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    templates.forEach((tpl: any) => {
      if (tpl.category) {
        categories[tpl.category] = (categories[tpl.category] || 0) + 1;
      }
      if (Array.isArray(tpl.tags)) {
        tpl.tags.forEach((tag: string) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    return {
      totalTemplates,
      categoriesCount: Object.keys(categories).length,
      topCategories: Object.entries(categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      topTags: Object.entries(tags)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
      activeTemplates: totalTemplates, // All are active for now
    };
  }, []);

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
