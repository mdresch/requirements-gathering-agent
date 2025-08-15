// Dashboard Component for Web Interface
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\Dashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, CheckCircle, AlertTriangle, Users, Settings, MessageSquare, TrendingUp } from 'lucide-react';

interface DashboardProps {
  complianceMetrics: ComplianceMetrics;
  recentProjects: Project[];
  systemHealth: HealthStatus;
  adobeIntegrationStatus: AdobeStatus;
}

interface ComplianceMetrics {
  babok: number;
  pmbok: number;
  overall: number;
  deviations: number;
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  complianceScore: number;
  lastUpdated: string;
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
}

interface AdobeStatus {
  connected: boolean;
  services: {
    indesign: boolean;
    illustrator: boolean;
    photoshop: boolean;
  };
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    babok: 92,
    pmbok: 89,
    overall: 90,
    deviations: 3
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Financial Services Requirements',
      status: 'active',
      complianceScore: 94,
      lastUpdated: '2025-01-13'
    },
    {
      id: '2', 
      name: 'Digital Transformation Project',
      status: 'completed',
      complianceScore: 87,
      lastUpdated: '2025-01-12'
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<HealthStatus>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 150
  });

  const [adobeStatus, setAdobeStatus] = useState<AdobeStatus>({
    connected: true,
    services: {
      indesign: true,
      illustrator: true,
      photoshop: true
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'completed':
        return 'text-green-600';
      case 'warning':
      case 'pending':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'completed':
        return 'bg-green-100';
      case 'warning':
      case 'pending':
        return 'bg-yellow-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Requirements Gathering Agent Enterprise Platform</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">BABOK Compliance</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.babok}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PMBOK Compliance</p>
              <p className="text-3xl font-bold text-green-600">{metrics.pmbok}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.overall}%</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Feedback Score</p>
              <p className="text-3xl font-bold text-yellow-600">4.2</p>
            </div>
            <MessageSquare className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Trend</p>
              <p className="text-3xl font-bold text-emerald-600">+15%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Recent Projects and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBg(project.status)} ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-sm text-gray-500">Score: {project.complianceScore}%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(project.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Status</span>
              <span className={`font-medium ${getStatusColor(systemHealth.status)}`}>
                {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">{systemHealth.uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="font-medium text-blue-600">{systemHealth.responseTime}ms</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Adobe Integration</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">InDesign</span>
                <CheckCircle className={`w-5 h-5 ${adobeStatus.services.indesign ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Illustrator</span>
                <CheckCircle className={`w-5 h-5 ${adobeStatus.services.illustrator ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Photoshop</span>
                <CheckCircle className={`w-5 h-5 ${adobeStatus.services.photoshop ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
