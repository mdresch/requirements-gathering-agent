'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock, Mail, MessageSquare, Settings, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../lib/api';
import type { Stakeholder } from '../types/stakeholder';

interface Notification {
  id: string;
  type: 'deadline' | 'milestone' | 'reminder' | 'update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  stakeholderId?: string;
  stakeholderName?: string;
  dueDate?: string;
  isRead: boolean;
  createdAt: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  reminderDays: number[];
  reminderTypes: string[];
}

interface NotificationSystemProps {
  projectId: string;
}

export default function NotificationSystem({ projectId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'deadlines' | 'milestones'>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    browserNotifications: true,
    reminderDays: [1, 3, 7],
    reminderTypes: ['deadline', 'milestone', 'reminder']
  });

  useEffect(() => {
    loadData();
    generateNotifications();
    
    // Check for notifications every 5 minutes
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjectStakeholders(projectId);
      
      if (response.success && response.data) {
        setStakeholders(response.data.stakeholders || []);
      }
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Generate deadline notifications
    stakeholders.forEach(stakeholder => {
      if (stakeholder.recruitmentDeadline) {
        const deadline = new Date(stakeholder.recruitmentDeadline);
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we should send a reminder
        if (settings.reminderDays.includes(daysUntilDeadline) && daysUntilDeadline >= 0) {
          let priority: Notification['priority'] = 'medium';
          if (daysUntilDeadline === 0) priority = 'critical';
          else if (daysUntilDeadline <= 1) priority = 'high';

          newNotifications.push({
            id: `deadline_${stakeholder.id}_${daysUntilDeadline}`,
            type: 'deadline',
            title: 'Recruitment Deadline Approaching',
            message: `Deadline for ${stakeholder.name || 'role placeholder'} is ${daysUntilDeadline === 0 ? 'today' : `in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`}`,
            priority,
            stakeholderId: stakeholder.id,
            stakeholderName: stakeholder.name || 'Role Placeholder',
            dueDate: stakeholder.recruitmentDeadline,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionRequired: daysUntilDeadline <= 1
          });
        }

        // Check for overdue deadlines
        if (daysUntilDeadline < 0 && stakeholder.status === 'placeholder') {
          newNotifications.push({
            id: `overdue_${stakeholder.id}`,
            type: 'deadline',
            title: 'Recruitment Deadline Overdue',
            message: `Deadline for ${stakeholder.name || 'role placeholder'} passed ${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) === 1 ? '' : 's'} ago`,
            priority: 'critical',
            stakeholderId: stakeholder.id,
            stakeholderName: stakeholder.name || 'Role Placeholder',
            dueDate: stakeholder.recruitmentDeadline,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionRequired: true
          });
        }
      }

      // Generate milestone notifications
      if (stakeholder.recruitmentStatus === 'contacted' && stakeholder.status === 'placeholder') {
        const contactedDate = new Date(stakeholder.updatedAt || stakeholder.createdAt || '');
        const daysSinceContacted = Math.ceil((now.getTime() - contactedDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceContacted >= 3) {
          newNotifications.push({
            id: `followup_${stakeholder.id}`,
            type: 'milestone',
            title: 'Follow-up Required',
            message: `No response from ${stakeholder.name || 'candidate'} for ${daysSinceContacted} days`,
            priority: 'medium',
            stakeholderId: stakeholder.id,
            stakeholderName: stakeholder.name || 'Candidate',
            isRead: false,
            createdAt: new Date().toISOString(),
            actionRequired: true
          });
        }
      }
    });

    // Add some mock notifications for demonstration
    const mockNotifications: Notification[] = [
      {
        id: 'mock_1',
        type: 'milestone',
        title: 'Recruitment Milestone Achieved',
        message: 'Successfully recruited 5 stakeholders this week',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        actionRequired: false
      },
      {
        id: 'mock_2',
        type: 'reminder',
        title: 'Weekly Recruitment Review',
        message: 'Time to review recruitment progress and update priorities',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        actionRequired: false
      }
    ];

    setNotifications(prev => {
      // Merge with existing notifications, avoiding duplicates
      const existingIds = new Set(prev.map(n => n.id));
      const newUniqueNotifications = [...newNotifications, ...mockNotifications].filter(n => !existingIds.has(n.id));
      return [...prev, ...newUniqueNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-5 h-5" />;
      case 'milestone':
        return <CheckCircle className="w-5 h-5" />;
      case 'reminder':
        return <Clock className="w-5 h-5" />;
      case 'update':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'deadlines':
        filtered = notifications.filter(n => n.type === 'deadline');
        break;
      case 'milestones':
        filtered = notifications.filter(n => n.type === 'milestone');
        break;
      default:
        filtered = notifications;
    }

    return filtered;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount} unread • {criticalCount} critical
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-5 h-5" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'deadlines', label: 'Deadlines' },
            { key: 'milestones', label: 'Milestones' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1 text-sm rounded ${
                filter === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Browser Notifications</label>
                <p className="text-xs text-gray-500">Show browser notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.browserNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, browserNotifications: e.target.checked }))}
                className="rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Reminder Days</label>
              <div className="flex space-x-2">
                {[1, 3, 7, 14].map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.reminderDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({ ...prev, reminderDays: [...prev.reminderDays, day] }));
                        } else {
                          setSettings(prev => ({ ...prev, reminderDays: prev.reminderDays.filter(d => d !== day) }));
                        }
                      }}
                      className="rounded mr-1"
                    />
                    <span className="text-sm text-gray-600">{day} day{day === 1 ? '' : 's'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {getFilteredNotifications().length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No notifications</p>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          getFilteredNotifications().map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {notification.actionRequired && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Action Required
                        </span>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${!notification.isRead ? 'text-blue-700' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  
                  {notification.stakeholderName && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {notification.stakeholderName}
                    </div>
                  )}
                  
                  {notification.dueDate && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Due: {new Date(notification.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
