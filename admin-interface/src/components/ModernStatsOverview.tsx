'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Award,
  Zap,
  Target,
  Activity
} from 'lucide-react';

const statsData = [
  {
    icon: FileText,
    label: 'Templates Created',
    value: '2,847',
    change: '+12%',
    positive: true,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    label: 'Active Users',
    value: '1,234',
    change: '+8%',
    positive: true,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Clock,
    label: 'Time Saved',
    value: '156h',
    change: '+23%',
    positive: true,
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Award,
    label: 'Success Rate',
    value: '99.2%',
    change: '+0.5%',
    positive: true,
    color: 'from-orange-500 to-red-500'
  },
];

const quickMetrics = [
  { label: 'API Response Time', value: '< 100ms', status: 'excellent' },
  { label: 'Uptime', value: '99.99%', status: 'excellent' },
  { label: 'Security Score', value: 'A+', status: 'excellent' },
  { label: 'Performance', value: '98/100', status: 'excellent' },
];

export default function ModernStatsOverview() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl hover:border-white/80 transition-all duration-300 group overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </motion.div>
                <motion.div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.positive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  {stat.change}
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-transparent group-hover:via-white/30 group-hover:to-transparent transition-all duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Quick Metrics Bar */}
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">System Health</h3>
              <p className="text-sm text-gray-600">Real-time performance metrics</p>
            </div>
          </div>
          <motion.div
            className="flex items-center space-x-2 text-emerald-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">All Systems Operational</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
            >
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <motion.div
                className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Indicators */}
      <motion.div
        className="bg-gradient-to-r from-electric-600 via-neon-600 to-cyber-600 rounded-2xl p-6 text-white shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Target className="w-6 h-6" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Performance Target</h3>
              <p className="text-blue-100">Exceeding expectations by 15%</p>
            </div>
          </div>
          <motion.div
            className="text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-3xl font-bold">115%</div>
            <div className="text-blue-100">of target achieved</div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}