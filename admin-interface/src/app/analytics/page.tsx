'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TemplateStats from '@/components/TemplateStats';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import FeedbackAnalytics from '@/components/FeedbackAnalytics';
import { BarChart3, TrendingUp, Users, FileText, Activity, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'templates' | 'feedback' | 'advanced'>('overview');

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: TrendingUp },
    { id: 'advanced', label: 'Advanced', icon: Activity },
  ];

  const overviewStats = [
    { title: 'Total Templates', value: '24', change: '+12%', icon: FileText, color: 'blue' },
    { title: 'Active Users', value: '156', change: '+8%', icon: Users, color: 'green' },
    { title: 'Projects', value: '42', change: '+15%', icon: Activity, color: 'purple' },
    { title: 'This Month', value: '89', change: '+23%', icon: Calendar, color: 'orange' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex flex-wrap gap-2">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setActiveView(option.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                    activeView === option.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Overview Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-gray-600 text-sm">{stat.title}</p>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Include template stats for overview */}
              <TemplateStats />
            </div>
          )}

          {activeView === 'templates' && <TemplateStats />}
          {activeView === 'feedback' && <FeedbackAnalytics />}
          {activeView === 'advanced' && <AdvancedAnalytics />}
        </motion.div>
      </div>
    </div>
  );
}