'use client';

import { Settings, FileText, BarChart3, Users, HelpCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">ADPA Template Admin</h1>
                <p className="text-xs text-gray-500">Enterprise Framework Management</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#templates"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </a>
              <a
                href="#analytics"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </a>
              <a
                href="#users"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </a>
              <a
                href="#settings"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </a>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
              title="Help & Documentation"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation (if needed) */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a
            href="#templates"
            className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Templates
          </a>
          <a
            href="#analytics"
            className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Analytics
          </a>
          <a
            href="#users"
            className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Users
          </a>
          <a
            href="#settings"
            className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Settings
          </a>
        </div>
      </div>
    </nav>
  );
}
