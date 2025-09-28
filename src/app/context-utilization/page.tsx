'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ContextUtilizationDashboard from '@/components/ContextUtilizationDashboard';
import { Activity, BarChart3, Target, RefreshCw } from 'lucide-react';

export default function ContextUtilizationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Context Utilization Dashboard</h1>
                <p className="text-gray-600">AI context tracking and utilization analytics</p>
              </div>
            </div>
            <motion.button
              onClick={() => window.location.reload()}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Context Analytics</h3>
                  <p className="text-sm text-gray-600">Real-time AI context utilization metrics</p>
                </div>
              </div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-right">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-lg font-bold text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Real-time</div>
                <div className="text-sm text-gray-600">Context Tracking</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Advanced</div>
                <div className="text-sm text-gray-600">Analytics</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Complete</div>
                <div className="text-sm text-gray-600">Traceability</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1.0 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Quality</div>
                <div className="text-sm text-gray-600">Assessment</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Performance Indicator */}
          <motion.div
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
                  <h3 className="text-xl font-bold">Context Tracking Active</h3>
                  <p className="text-purple-100">AI context utilization monitoring operational</p>
                </div>
              </div>
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-3xl font-bold">100%</div>
                <div className="text-purple-100">operational status</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <ContextUtilizationDashboard />
        </motion.div>
      </div>
    </div>
  );
}