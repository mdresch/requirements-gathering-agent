'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { 
  Settings, 
  Save, 
  Database, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Users,
  Key,
  Mail,
  Server,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'notifications' | 'api' | 'appearance' | 'integrations'>('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'ADPA Template Admin',
      siteDescription: 'Enterprise Framework Management',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      apiKeyRotation: true,
      auditLogging: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      templateUpdates: true,
      systemAlerts: true,
      weeklyReports: true,
    },
    api: {
      rateLimit: 1000,
      apiVersion: 'v1',
      corsOrigins: 'https://example.com',
      webhookUrl: '',
    },
    appearance: {
      theme: 'light',
      primaryColor: 'blue',
      compactMode: false,
      sidebarCollapsed: false,
    },
    integrations: {
      adobe: false,
      sharepoint: false,
      confluence: false,
      teams: false,
    }
  });

  const sectionOptions = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    toast.success('Settings reset to defaults');
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
          <select
            value={settings.general.defaultLanguage}
            onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenance"
          checked={settings.general.maintenanceMode}
          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="maintenance" className="ml-2 block text-sm text-gray-700">
          Enable Maintenance Mode
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="2fa"
          checked={settings.security.twoFactorAuth}
          onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="2fa" className="ml-2 block text-sm text-gray-700">
          Enable Two-Factor Authentication
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
        <select
          value={settings.security.passwordPolicy}
          onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="basic">Basic (8+ characters)</option>
          <option value="strong">Strong (8+ chars, numbers, symbols)</option>
          <option value="enterprise">Enterprise (12+ chars, complex)</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="apiRotation"
            checked={settings.security.apiKeyRotation}
            onChange={(e) => updateSetting('security', 'apiKeyRotation', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="apiRotation" className="ml-2 block text-sm text-gray-700">
            Automatic API Key Rotation
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="auditLogging"
            checked={settings.security.auditLogging}
            onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="auditLogging" className="ml-2 block text-sm text-gray-700">
            Enable Audit Logging
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifs"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailNotifs" className="ml-2 block text-sm text-gray-700">
            Email Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pushNotifs"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="pushNotifs" className="ml-2 block text-sm text-gray-700">
            Push Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="templateUpdates"
            checked={settings.notifications.templateUpdates}
            onChange={(e) => updateSetting('notifications', 'templateUpdates', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="templateUpdates" className="ml-2 block text-sm text-gray-700">
            Template Update Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="systemAlerts"
            checked={settings.notifications.systemAlerts}
            onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-700">
            System Alert Notifications
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="weeklyReports"
            checked={settings.notifications.weeklyReports}
            onChange={(e) => updateSetting('notifications', 'weeklyReports', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-700">
            Weekly Summary Reports
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'api': return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 text-sm font-medium">API is currently active and healthy</span>
            </div>
          </div>
          <p className="text-gray-600">API settings management is coming soon.</p>
        </div>
      );
      case 'appearance': return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Palette className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">Theme customization is coming soon</span>
            </div>
          </div>
          <p className="text-gray-600">Advanced appearance settings will be available in a future update.</p>
        </div>
      );
      case 'integrations': return (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-orange-800 text-sm font-medium">Integration management is under development</span>
            </div>
          </div>
          <p className="text-gray-600">Connect with Adobe Creative Suite, SharePoint, Confluence, and Microsoft Teams.</p>
        </div>
      );
      default: return renderGeneralSettings();
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure system preferences and options</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Reset</span>
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
              <nav className="space-y-2">
                {sectionOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setActiveSection(option.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 transition-all duration-200 ${
                        activeSection === option.id
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div 
            className="lg:col-span-3"
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 capitalize">
                {activeSection} Settings
              </h2>
              
              {renderCurrentSection()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}