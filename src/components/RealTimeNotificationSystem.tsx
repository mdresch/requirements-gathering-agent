// Phase 2: Interactive Drill-down Features - Real-time Notification System
// Real-time notifications for compliance events and updates

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Users, 
  Settings, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Archive,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'COMPLIANCE_UPDATE' | 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'COMPLIANCE' | 'ISSUE' | 'WORKFLOW' | 'SYSTEM' | 'USER';
  projectId?: string;
  issueId?: string;
  workflowId?: string;
  userId?: string;
  actions?: {
    label: string;
    action: string;
    type: 'primary' | 'secondary' | 'danger';
  }[];
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  categories: {
    COMPLIANCE: boolean;
    ISSUE: boolean;
    WORKFLOW: boolean;
    SYSTEM: boolean;
    USER: boolean;
  };
  priorities: {
    LOW: boolean;
    MEDIUM: boolean;
    HIGH: boolean;
    URGENT: boolean;
  };
  frequency: 'IMMEDIATE' | 'BATCH_5MIN' | 'BATCH_15MIN' | 'BATCH_1HOUR';
}

interface RealTimeNotificationSystemProps {
  projectId?: string;
  onClose?: () => void;
}

export default function RealTimeNotificationSystem({ 
  projectId = 'current-project',
  onClose 
}: RealTimeNotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    categories: {
      COMPLIANCE: true,
      ISSUE: true,
      WORKFLOW: true,
      SYSTEM: true,
      USER: true
    },
    priorities: {
      LOW: true,
      MEDIUM: true,
      HIGH: true,
      URGENT: true
    },
    frequency: 'IMMEDIATE'
  });
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'settings'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadNotifications();
    initializeWebSocket();
    initializeAudio();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, filterCategory, filterPriority, viewMode]);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load real notifications from API
      const response = await fetch(`/api/v1/notifications?projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success && result.data?.notifications) {
        setNotifications(result.data.notifications);
      } else {
        // Fallback to mock data
        setNotifications(generateMockNotifications());
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setError('Failed to load notifications');
      // Use mock data as fallback
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = (): Notification[] => [
    {
      id: 'notif-1',
      type: 'COMPLIANCE_UPDATE',
      title: 'BABOK Compliance Score Updated',
      message: 'BABOK compliance score has improved from 92% to 94%',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'MEDIUM',
      category: 'COMPLIANCE',
      projectId,
      actions: [
        { label: 'View Details', action: 'view_compliance', type: 'primary' },
        { label: 'Dismiss', action: 'dismiss', type: 'secondary' }
      ]
    },
    {
      id: 'notif-2',
      type: 'ISSUE_CREATED',
      title: 'New Critical Issue Detected',
      message: 'A critical compliance issue has been identified in Project Alpha',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'URGENT',
      category: 'ISSUE',
      projectId,
      issueId: 'issue-123',
      actions: [
        { label: 'View Issue', action: 'view_issue', type: 'primary' },
        { label: 'Assign', action: 'assign_issue', type: 'secondary' }
      ]
    },
    {
      id: 'notif-3',
      type: 'WORKFLOW_STARTED',
      title: 'Workflow Started',
      message: 'Critical Issue Resolution workflow has been initiated',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: 'HIGH',
      category: 'WORKFLOW',
      projectId,
      workflowId: 'workflow-1',
      actions: [
        { label: 'View Workflow', action: 'view_workflow', type: 'primary' }
      ]
    },
    {
      id: 'notif-4',
      type: 'ISSUE_RESOLVED',
      title: 'Issue Resolved',
      message: 'Issue #456 has been successfully resolved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'MEDIUM',
      category: 'ISSUE',
      projectId,
      issueId: 'issue-456',
      actions: [
        { label: 'View Details', action: 'view_issue', type: 'primary' }
      ]
    },
    {
      id: 'notif-5',
      type: 'SYSTEM',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      priority: 'LOW',
      category: 'SYSTEM',
      actions: [
        { label: 'View Schedule', action: 'view_schedule', type: 'secondary' }
      ]
    }
  ];

  const initializeWebSocket = () => {
    try {
      const wsUrl = `ws://requirements-gathering-agent.vercel.app/ws/notifications?projectId=${projectId}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🔔 WebSocket connected for notifications');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NOTIFICATION') {
            handleNewNotification(data.notification);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('🔔 WebSocket disconnected, attempting to reconnect...');
        setTimeout(initializeWebSocket, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  };

  const initializeAudio = () => {
    // Create audio element for notification sounds
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    // Show desktop notification if enabled
    if (settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // View mode filter
    if (viewMode === 'unread') {
      filtered = filtered.filter(notif => !notif.read);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(notif => notif.category === filterCategory);
    }

    // Priority filter
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(notif => notif.priority === filterPriority);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredNotifications(filtered);
  };

  const updateUnreadCount = () => {
    const unread = notifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // Try to update via API
    try {
      await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.warn('Failed to mark notification as read via API:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    // Try to update via API
    try {
      await fetch(`/api/v1/notifications/mark-all-read?projectId=${projectId}`, {
        method: 'PUT'
      });
    } catch (error) {
      console.warn('Failed to mark all notifications as read via API:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    // Try to delete via API
    try {
      await fetch(`/api/v1/notifications/${notificationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Failed to delete notification via API:', error);
    }
  };

  const handleNotificationAction = (notification: Notification, action: string) => {
    switch (action) {
      case 'view_compliance':
        // Navigate to compliance dashboard
        console.log('Navigate to compliance dashboard');
        break;
      case 'view_issue':
        // Navigate to issue details
        console.log('Navigate to issue:', notification.issueId);
        break;
      case 'view_workflow':
        // Navigate to workflow details
        console.log('Navigate to workflow:', notification.workflowId);
        break;
      case 'dismiss':
        markAsRead(notification.id);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const toggleNotificationExpansion = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': case 'ISSUE_RESOLVED': case 'WORKFLOW_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'WARNING': case 'COMPLIANCE_UPDATE':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ERROR': case 'ISSUE_CREATED':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'INFO': case 'SYSTEM':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'WORKFLOW_STARTED':
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'COMPLIANCE': return 'text-blue-600 bg-blue-50';
      case 'ISSUE': return 'text-red-600 bg-red-50';
      case 'WORKFLOW': return 'text-purple-600 bg-purple-50';
      case 'SYSTEM': return 'text-gray-600 bg-gray-50';
      case 'USER': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              {unreadCount > 0 ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Real-time Notifications
            </h2>
            <p className="text-gray-600 mt-1">
              Stay updated with compliance events and system notifications
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={loadNotifications}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Enable Notifications</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Sound Notifications</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.desktopNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, desktopNotifications: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Desktop Notifications</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'settings', label: 'Settings', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Categories</option>
            <option value="COMPLIANCE">Compliance</option>
            <option value="ISSUE">Issues</option>
            <option value="WORKFLOW">Workflows</option>
            <option value="SYSTEM">System</option>
            <option value="USER">User</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        
        {unreadCount > 0 && viewMode === 'all' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadNotifications}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'ALL' || filterPriority !== 'ALL' 
                ? 'Try adjusting your filters' 
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.read 
                  ? 'border-gray-200 bg-white' 
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                          {notification.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleNotificationAction(notification, action.action)}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            action.type === 'primary' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : action.type === 'danger'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
