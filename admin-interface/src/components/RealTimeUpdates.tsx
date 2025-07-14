// Real-time Updates Component - Live activity feed and notifications
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\RealTimeUpdates.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket, RealTimeEvent, SystemStatus } from '@/lib/websocket';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Users, 
  Activity,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface ActivityItem {
  id: string;
  type: 'project_updated' | 'document_generated' | 'compliance_analyzed' | 'template_created' | 'user_activity';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export default function RealTimeUpdates() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'online',
    database: 'online',
    adobe: 'online',
    compliance: 'online'
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { subscribe, isConnected, getConnectionStatus } = useWebSocket();

  useEffect(() => {
    // Subscribe to WebSocket events
    const unsubscribers = [
      subscribe('connection_status', handleConnectionStatus),
      subscribe('project_updated', handleProjectUpdate),
      subscribe('document_generated', handleDocumentGenerated),
      subscribe('compliance_analyzed', handleComplianceAnalyzed),
      subscribe('template_created', handleTemplateCreated),
      subscribe('template_updated', handleTemplateUpdated),
      subscribe('system_status', handleSystemStatus),
      subscribe('user_activity', handleUserActivity),
    ];

    // Update connection status
    setConnectionStatus(getConnectionStatus());

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe, getConnectionStatus]);

  const handleConnectionStatus = (data: any) => {
    setConnectionStatus(data.status);
    
    if (data.status === 'connected') {
      toast.success('Real-time updates connected');
    } else if (data.status === 'disconnected') {
      toast.error('Real-time updates disconnected');
    } else if (data.status === 'reconnected') {
      toast.success('Real-time updates reconnected');
    }
  };

  const handleProjectUpdate = (data: any) => {
    const notification: NotificationItem = {
      id: `project-${Date.now()}`,
      type: 'info',
      title: 'Project Updated',
      message: `Project "${data.projectName}" has been updated`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'View Project',
        url: `/projects/${data.projectId}`
      }
    };

    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'project_updated',
      title: 'Project Updated',
      description: `${data.userName || 'Someone'} updated project "${data.projectName}"`,
      timestamp: new Date(),
      userId: data.userId,
      userName: data.userName
    };

    addNotification(notification);
    addActivity(activity);
  };

  const handleDocumentGenerated = (data: any) => {
    const notification: NotificationItem = {
      id: `document-${Date.now()}`,
      type: 'success',
      title: 'Document Generated',
      message: `Document "${data.documentName}" has been generated successfully`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'Download',
        url: data.downloadUrl
      }
    };

    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'document_generated',
      title: 'Document Generated',
      description: `Document "${data.documentName}" generated from template "${data.templateName}"`,
      timestamp: new Date()
    };

    addNotification(notification);
    addActivity(activity);
    toast.success('Document generated successfully!');
  };

  const handleComplianceAnalyzed = (data: any) => {
    const isHighScore = data.score >= 85;
    const notification: NotificationItem = {
      id: `compliance-${Date.now()}`,
      type: isHighScore ? 'success' : 'warning',
      title: 'Compliance Analysis Complete',
      message: `Document scored ${data.score}% compliance`,
      timestamp: new Date(),
      read: false,
      action: {
        label: 'View Report',
        url: `/compliance/reports/${data.reportId}`
      }
    };

    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'compliance_analyzed',
      title: 'Compliance Analysis',
      description: `Document "${data.documentName}" analyzed - Score: ${data.score}%`,
      timestamp: new Date()
    };

    addNotification(notification);
    addActivity(activity);
  };

  const handleTemplateCreated = (data: any) => {
    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'template_created',
      title: 'Template Created',
      description: `New template "${data.templateName}" created in ${data.category} category`,
      timestamp: new Date(),
      userId: data.userId,
      userName: data.userName
    };

    addActivity(activity);
  };

  const handleTemplateUpdated = (data: any) => {
    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'template_created',
      title: 'Template Updated',
      description: `Template "${data.templateName}" has been updated`,
      timestamp: new Date(),
      userId: data.userId,
      userName: data.userName
    };

    addActivity(activity);
  };

  const handleSystemStatus = (data: SystemStatus) => {
    setSystemStatus(data);
    
    // Check for system issues
    const issues = Object.entries(data).filter(([, status]) => status !== 'online');
    if (issues.length > 0) {
      const notification: NotificationItem = {
        id: `system-${Date.now()}`,
        type: 'warning',
        title: 'System Status Alert',
        message: `Some services are experiencing issues: ${issues.map(([service]) => service).join(', ')}`,
        timestamp: new Date(),
        read: false
      };
      addNotification(notification);
    }
  };

  const handleUserActivity = (data: any) => {
    const activity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'user_activity',
      title: 'User Activity',
      description: `${data.userName} ${data.action}`,
      timestamp: new Date(),
      userId: data.userId,
      userName: data.userName
    };

    addActivity(activity);
  };

  const addNotification = (notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only 50 notifications
    setUnreadCount(prev => prev + 1);
  };

  const addActivity = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev.slice(0, 99)]); // Keep only 100 activities
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_updated': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document_generated': return <FileText className="w-4 h-4 text-green-500" />;
      case 'compliance_analyzed': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'template_created': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'user_activity': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Connection Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium ${
        connectionStatus === 'connected' ? 'bg-green-600 text-white' :
        connectionStatus === 'connecting' ? 'bg-yellow-600 text-white' :
        'bg-red-600 text-white'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {connectionStatus === 'connected' ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Real-time updates active</span>
            </>
          ) : connectionStatus === 'connecting' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Connecting to real-time updates...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Real-time updates disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Notifications Button */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative bg-white rounded-full p-3 shadow-lg border hover:shadow-xl transition-shadow"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-xl border z-40 max-h-96 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                      {notification.action && (
                        <a
                          href={notification.action.url}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                        >
                          {notification.action.label} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* System Status Widget */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 min-w-48 z-30">
        <h4 className="font-semibold text-gray-900 mb-3">System Status</h4>
        <div className="space-y-2">
          {Object.entries(systemStatus).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{service}</span>
              <div className="flex items-center space-x-1">
                {getStatusIcon(status)}
                <span className="text-xs text-gray-500 capitalize">{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed (hidden by default, can be shown in a sidebar) */}
      <div className="hidden">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.slice(0, 10).map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
