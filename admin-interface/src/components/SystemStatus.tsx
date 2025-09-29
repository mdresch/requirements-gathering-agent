'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Monitor, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Clock,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'error' | 'checking';
  responseTime?: number;
  lastChecked: Date;
  details?: string;
}

interface SystemStatusData {
  backend: SystemStatus;
  frontend: SystemStatus;
  database: SystemStatus;
  api: SystemStatus;
}

export default function SystemStatus() {
  const [statusData, setStatusData] = useState<SystemStatusData>({
    backend: {
      name: 'Backend Server',
      status: 'checking',
      lastChecked: new Date(0), // Use epoch to avoid hydration issues
    },
    frontend: {
      name: 'Frontend Application',
      status: 'online',
      lastChecked: new Date(0),
      details: 'React/Next.js application'
    },
    database: {
      name: 'MongoDB Atlas',
      status: 'checking',
      lastChecked: new Date(0),
    },
    api: {
      name: 'API Endpoints',
      status: 'checking',
      lastChecked: new Date(0),
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date(0));
  const [mounted, setMounted] = useState(false);

  const overallStatus = Object.values(statusData).every(status => status.status === 'online') 
    ? 'online' 
    : Object.values(statusData).some(status => status.status === 'offline') 
    ? 'offline' 
    : 'error';

  useEffect(() => {
    setMounted(true);
    checkSystemStatus();
    // Set up periodic status checks every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Check backend server
      const backendStatus = await checkBackendStatus();
      
      // Check database connection
      const databaseStatus = await checkDatabaseStatus();
      
      // Check API endpoints
      const apiStatus = await checkAPIStatus();
      
      // Frontend is always online if this component is rendering
      const frontendStatus: SystemStatus = {
        name: 'Frontend Application',
        status: 'online',
        lastChecked: new Date(),
        details: 'React/Next.js application'
      };

      const responseTime = Date.now() - startTime;

      setStatusData({
        backend: { ...backendStatus, responseTime },
        frontend: frontendStatus,
        database: databaseStatus,
        api: apiStatus
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('System status check failed:', error);
      
      // Set all to error state if check fails
      setStatusData(prev => ({
        backend: { ...prev.backend, status: 'error', lastChecked: new Date() },
        frontend: { ...prev.frontend, status: 'error', lastChecked: new Date() },
        database: { ...prev.database, status: 'error', lastChecked: new Date() },
        api: { ...prev.api, status: 'error', lastChecked: new Date() }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkBackendStatus = async (): Promise<SystemStatus> => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api/v1' : '/api/v1';
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'Backend Server',
          status: 'online',
          responseTime,
          lastChecked: new Date(),
          details: `Port 3002, ${responseTime}ms response`
        };
      } else {
        return {
          name: 'Backend Server',
          status: 'error',
          lastChecked: new Date(),
          details: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: 'Backend Server',
        status: 'offline',
        lastChecked: new Date(),
        details: 'Connection failed'
      };
    }
  };

  const checkDatabaseStatus = async (): Promise<SystemStatus> => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api/v1' : '/api/v1';
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/database/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'MongoDB Atlas',
          status: 'online',
          responseTime,
          lastChecked: new Date(),
          details: data.connection?.host ? `Connected to ${data.connection.host}` : 'Connected'
        };
      } else {
        return {
          name: 'MongoDB Atlas',
          status: 'error',
          lastChecked: new Date(),
          details: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: 'MongoDB Atlas',
        status: 'offline',
        lastChecked: new Date(),
        details: 'Connection failed'
      };
    }
  };

  const checkAPIStatus = async (): Promise<SystemStatus> => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api/v1' : '/api/v1';
      const startTime = Date.now();
      
      // Test multiple endpoints
      const endpoints = ['/templates', '/analytics/homepage', '/categories/active'];
      const results = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', timeout: 3000 } as any)
        )
      );
      
      const responseTime = Date.now() - startTime;
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const total = results.length;
      
      if (successful === total) {
        return {
          name: 'API Endpoints',
          status: 'online',
          responseTime,
          lastChecked: new Date(),
          details: `${successful}/${total} endpoints responding`
        };
      } else if (successful > 0) {
        return {
          name: 'API Endpoints',
          status: 'error',
          lastChecked: new Date(),
          details: `${successful}/${total} endpoints responding`
        };
      } else {
        return {
          name: 'API Endpoints',
          status: 'offline',
          lastChecked: new Date(),
          details: 'No endpoints responding'
        };
      }
    } catch (error) {
      return {
        name: 'API Endpoints',
        status: 'offline',
        lastChecked: new Date(),
        details: 'Connection failed'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSystemIcon = (name: string) => {
    switch (name) {
      case 'Backend Server':
        return <Server className="w-4 h-4" />;
      case 'Frontend Application':
        return <Monitor className="w-4 h-4" />;
      case 'MongoDB Atlas':
        return <Database className="w-4 h-4" />;
      case 'API Endpoints':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
            whileHover={{ scale: 1.1 }}
          >
            {overallStatus === 'online' ? (
              <Wifi className="w-5 h-5 text-white" />
            ) : (
              <WifiOff className="w-5 h-5 text-white" />
            )}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">System Status</h3>
            <p className="text-sm text-gray-600">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={checkSystemStatus}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(statusData).map((status, index) => (
          <motion.div
            key={status.name}
            className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-gray-600">
                  {getSystemIcon(status.name)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {status.name}
                </span>
              </div>
              {getStatusIcon(status.status)}
            </div>
            
            <div className="space-y-1">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status.status)}`}>
                {status.status === 'checking' ? 'Checking...' : status.status}
              </div>
              
              {status.responseTime && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{status.responseTime}ms</span>
                </div>
              )}
              
              {status.details && (
                <div className="text-xs text-gray-500 truncate" title={status.details}>
                  {status.details}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
