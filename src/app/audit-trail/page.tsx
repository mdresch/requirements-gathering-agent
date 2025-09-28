'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import DocumentAuditTrail from '@/components/DocumentAuditTrail';
import AuditTrailActivityReports from '@/components/AuditTrailActivityReports';
import DataQualityAuditDashboard from '@/components/DataQualityAuditDashboard';
import RealTimeActivityDashboard from '@/components/RealTimeActivityDashboard';
import { Shield, FileText, Clock, RefreshCw, Activity, AlertTriangle, CheckCircle, BarChart3, List, Database, Users } from 'lucide-react';

export default function AuditTrailPage() {
  const [activeView, setActiveView] = useState<'trail' | 'reports' | 'data-quality' | 'real-time'>('trail');

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
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                {activeView === 'trail' ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : activeView === 'reports' ? (
                  <BarChart3 className="w-6 h-6 text-white" />
                ) : activeView === 'data-quality' ? (
                  <Database className="w-6 h-6 text-white" />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeView === 'trail' ? 'Document Audit Trail' : 
                   activeView === 'reports' ? 'Audit Trail Activity Reports' :
                   activeView === 'data-quality' ? 'Data Quality Audit Dashboard' :
                   'Real-Time Activity Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {activeView === 'trail' 
                    ? 'Complete audit trail of all document activities, changes, and interactions'
                    : activeView === 'reports' 
                    ? 'Comprehensive analysis of system activities, user interactions, and security events'
                    : activeView === 'data-quality'
                    ? 'Monitor and analyze data quality assessment events and improvements'
                    : 'Monitor user activities and session tracking in real-time'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('trail')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeView === 'trail'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="text-sm font-medium">Audit Trail</span>
                </button>
                <button
                  onClick={() => setActiveView('reports')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeView === 'reports'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Activity Reports</span>
                </button>
                <button
                  onClick={() => setActiveView('data-quality')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeView === 'data-quality'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Data Quality</span>
                </button>
                <button
                  onClick={() => setActiveView('real-time')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeView === 'real-time'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Real-Time</span>
                </button>
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
                  className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <FileText className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Audit Analytics</h3>
                  <p className="text-sm text-gray-600">Comprehensive document activity tracking</p>
                </div>
              </div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-right">
                  <div className="text-sm text-gray-600">Security Status</div>
                  <div className="text-lg font-bold text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Secure
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
                <div className="text-2xl font-bold text-gray-900 mb-1">Complete</div>
                <div className="text-sm text-gray-600">Activity Logging</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mt-2"
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
                <div className="text-2xl font-bold text-gray-900 mb-1">Real-time</div>
                <div className="text-sm text-gray-600">Monitoring</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mt-2"
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
                <div className="text-2xl font-bold text-gray-900 mb-1">Compliance</div>
                <div className="text-sm text-gray-600">Tracking</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mt-2"
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
                <div className="text-2xl font-bold text-gray-900 mb-1">Security</div>
                <div className="text-sm text-gray-600">Audit</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Security Status Indicator */}
          <motion.div
            className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-6 text-white shadow-xl mb-8"
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
                  <Shield className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">Audit Trail Active</h3>
                  <p className="text-red-100">Complete document activity monitoring operational</p>
                </div>
              </div>
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-3xl font-bold">100%</div>
                <div className="text-red-100">audit coverage</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Audit Features Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Timeline Tracking</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Complete chronological record of all document activities with precise timestamps and user attribution.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Compliance Monitoring</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Automated compliance checks and regulatory requirement tracking for all document operations.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Security Alerts</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Real-time security monitoring with instant alerts for unauthorized access or suspicious activities.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {activeView === 'trail' ? (
            <DocumentAuditTrail />
          ) : activeView === 'reports' ? (
            <AuditTrailActivityReports />
          ) : activeView === 'data-quality' ? (
            <DataQualityAuditDashboard />
          ) : (
            <RealTimeActivityDashboard />
          )}
        </motion.div>
      </div>
    </div>
  );
}

