// Enhanced Navigation Component for Full Web Interface
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\EnhancedNavbar.tsx

'use client';

import { useState } from 'react';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Users, 
  Wand2, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export default function EnhancedNavbar({ currentPage = 'projects', onPageChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, description: 'Overview and metrics' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, description: 'Manage projects' },
    { id: 'generator', name: 'Generate', icon: Wand2, description: 'Create documents' },
    { id: 'templates', name: 'Templates', icon: FileText, description: 'Template library' },
    { id: 'compliance', name: 'Compliance', icon: CheckCircle, description: 'Standards analysis' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
    { id: 'settings', name: 'Settings', icon: Settings, description: 'System configuration' }
  ];

  const getPageTitle = (pageId: string) => {
    const item = navigationItems.find(item => item.id === pageId);
    return item ? item.name : 'Dashboard';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">ADPA Enterprise Platform</h1>
                <p className="text-xs text-gray-500">Requirements Gathering Agent</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange ? onPageChange(item.id) : window.location.href = `/web-interface`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                    <span>{item.name}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">System Healthy</span>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              U
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onPageChange) {
                        onPageChange(item.id);
                      } else {
                        window.location.href = `/web-interface`;
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1 text-left">
                      <div className={isActive ? 'text-blue-700' : 'text-gray-900'}>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Page Breadcrumb */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <span>/</span>
            <span className="font-medium text-gray-900">{getPageTitle(currentPage)}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
