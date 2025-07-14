// Main Application Layout with All Web Interface Components
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\app\web-interface\page.tsx

'use client';

import { useState } from 'react';
import EnhancedNavbar from '@/components/EnhancedNavbar';
import Dashboard from '@/components/Dashboard';
import ProjectManager from '@/components/ProjectManager';
import DocumentGenerator from '@/components/DocumentGenerator';
import TemplatesManager from '@/components/TemplatesManager';
import TemplateStats from '@/components/TemplateStats';
import StandardsComplianceDashboard from '@/components/StandardsComplianceDashboard';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

// Placeholder components for features not yet implemented
function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure system settings, API keys, and integration parameters.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800">
            ⚙️ Settings panel will manage:
          </p>
          <ul className="text-purple-700 text-left mt-3 space-y-1">
            <li>• Adobe Creative Suite API credentials</li>
            <li>• AI provider configurations</li>
            <li>• System performance tuning</li>
            <li>• User access management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function WebInterfacePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectManager />;
      case 'generator':
        return <DocumentGenerator />;
      case 'templates':
        return <TemplatesManager />;
      case 'compliance':
        return <StandardsComplianceDashboard />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 ADPA Enterprise Platform. Requirements Gathering Agent v3.2.0
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🚀 API Server: Active</span>
              <span>🎨 Adobe: Connected</span>
              <span>📊 Standards: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
