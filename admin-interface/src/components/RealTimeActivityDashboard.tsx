import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Users, Activity, Clock, Eye, Search, MousePointer, 
  Download, Upload, LogIn, LogOut, FileText, BarChart3,
  RefreshCw, Filter, Zap, TrendingUp, Globe, Smartphone
} from 'lucide-react';

interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  activityType: string;
  component: string;
  action: string;
  timestamp: string;
  duration?: number;
  metadata: {
    page?: string;
    documentId?: string;
    documentName?: string;
    projectId?: string;
    searchQuery?: string;
    formData?: any;
    fileSize?: number;
    fileType?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
}

interface SessionTracking {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  sessionStart: string;
  lastActivity: string;
  status: string;
  activityCount: number;
  ipAddress: string;
  userAgent: string;
  // Optional metadata for backward compatibility
  metadata?: {
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
  };
  // Legacy fields for compatibility
  sessionId?: string;
  startTime?: string;
  totalDuration?: number;
  activities?: UserActivity[];
  isActive?: boolean;
}

interface ActivityAnalytics {
  totalSessions: number;
  activeUsers: number;
  averageSessionDuration: number;
  sessionsByProject: Record<string, number>;
  recentActivity: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    projectId: string;
    projectName: string;
    timestamp: string;
    details: string;
  }>;
  activityTrends: Record<string, number>;
  peakActivityHour: number;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    activityCount: number;
  }>;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByComponent: Record<string, number>;
  activitiesByUser: Record<string, number>;
  activeSessions: number;
  trends: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
  topPages: Record<string, number>;
  topActions: Record<string, number>;
  userEngagement: Record<string, number>;
}

const ACTIVITY_ICONS = {
  PAGE_VIEW: <Eye className="h-4 w-4" />,
  DOCUMENT_ACTION: <FileText className="h-4 w-4" />,
  SEARCH: <Search className="h-4 w-4" />,
  NAVIGATION: <MousePointer className="h-4 w-4" />,
  FORM_INTERACTION: <MousePointer className="h-4 w-4" />,
  DOWNLOAD: <Download className="h-4 w-4" />,
  UPLOAD: <Upload className="h-4 w-4" />,
  LOGIN: <LogIn className="h-4 w-4" />,
  LOGOUT: <LogOut className="h-4 w-4" />
};

const RealTimeActivityDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<SessionTracking[]>([]);
  const [analytics, setAnalytics] = useState<ActivityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadData();
    connectWebSocket();
    
    // Set up polling as fallback when WebSocket is not available
    const pollInterval = setInterval(() => {
      if (!wsConnected) {
        loadData();
      }
    }, 30000); // Poll every 30 seconds when WebSocket is not available
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(pollInterval);
    };
  }, [filters, wsConnected]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3002/ws/activity');
      
      ws.onopen = () => {
        setWsConnected(true);
        console.log('🔌 Connected to real-time activity WebSocket');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'activity_update') {
          // Handle new activity update
          console.log('📊 New activity:', data.data);
        } else if (data.type === 'active_sessions') {
          // Update active sessions
          setSessions(data.data);
        }
      };
      
      ws.onclose = () => {
        setWsConnected(false);
        console.log('🔌 Disconnected from real-time activity WebSocket');
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      ws.onerror = (error) => {
        console.warn('⚠️ WebSocket connection failed - continuing with REST API only:', error);
        setWsConnected(false);
        // Don't attempt to reconnect immediately on error
        wsRef.current = null;
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.warn('⚠️ WebSocket not available - using REST API only:', error);
      setWsConnected(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load active sessions
      const sessionsResponse = await fetch('http://localhost:3002/api/v1/real-time-activity/sessions');
      const sessionsData = await sessionsResponse.json();

      if (sessionsData.success) {
        setSessions(sessionsData.data.sessions);
      }

      // Load analytics
      const analyticsParams = new URLSearchParams();
      if (filters.userId) analyticsParams.append('userId', filters.userId);
      if (filters.startDate) analyticsParams.append('startDate', filters.startDate);
      if (filters.endDate) analyticsParams.append('endDate', filters.endDate);

      const analyticsResponse = await fetch(`http://localhost:3002/api/v1/real-time-activity/analytics?${analyticsParams}`);
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error('Error loading real-time activity data:', error);
      setError('Failed to load real-time activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (activityType: string) => {
    return ACTIVITY_ICONS[activityType as keyof typeof ACTIVITY_ICONS] || <Activity className="h-4 w-4" />;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading real-time activity data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 text-red-600" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Activity Dashboard</h2>
            <p className="text-gray-600">Monitor user activities and session tracking in real-time</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{wsConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <Input
                placeholder="Filter by user ID or name"
                value={filters.userId}
                onChange={(e) => setFilters({...filters, userId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeSessions || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalActivities || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(analytics.averageSessionDuration || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(analytics.activitiesByUser || {}).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Types */}
          <Card>
            <CardHeader>
              <CardTitle>Activities by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.activitiesByType || {}).map(([type, count]) => ({
                      name: type.replace('_', ' '),
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.activitiesByType || {}).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.topPages || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([page, count]) => ({
                    page: page.length > 20 ? page.substring(0, 20) + '...' : page,
                    count: count
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Active Sessions ({sessions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id || session.sessionId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getDeviceIcon(session.metadata?.deviceType || 'desktop')}
                      <h4 className="font-medium text-gray-900">{session.userName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {session.metadata?.deviceType || 'desktop'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {session.metadata?.browser || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Session: {(session.id || session.sessionId || '').substring(0, 8)}... • 
                      Started: {formatTimestamp(session.sessionStart || session.startTime || session.lastActivity)} • 
                      Last Activity: {formatTimestamp(session.lastActivity)} • 
                      Duration: {formatDuration(session.totalDuration || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      IP: {session.metadata?.ipAddress || session.ipAddress || 'Unknown'} • 
                      Activities: {session.activities?.length || session.activityCount || 0}
                    </div>
                    {(session.activities?.length || 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-700">Recent Activities:</p>
                        {(session.activities || []).slice(-3).map((activity, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                            {getActivityIcon(activity.activityType)}
                            <span>{activity.activityType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{activity.component}</span>
                            {activity.metadata.page && (
                              <>
                                <span>•</span>
                                <span>{activity.metadata.page}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.isActive ? 'default' : 'secondary'}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeActivityDashboard;
