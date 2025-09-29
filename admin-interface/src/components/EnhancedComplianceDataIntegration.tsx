// Phase 1: Enhanced Data Integration - Enhanced Compliance Data Integration Component
// Real-time data integration with quality monitoring

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';

interface RealTimeDataProps {
  projectId?: string;
  onDataUpdate?: (data: any) => void;
  onQualityChange?: (quality: any) => void;
}

interface ConnectionStatus {
  isConnected: boolean;
  connectionId?: string;
  projectId?: string;
  lastPing?: Date;
  messageCount: number;
}

interface DataQualityStatus {
  overallQuality: number;
  qualityLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  completeness: number;
  accuracy: number;
  timeliness: number;
  issuesFound: number;
  lastValidated: Date;
}

export default function EnhancedComplianceDataIntegration({ 
  projectId, 
  onDataUpdate, 
  onQualityChange 
}: RealTimeDataProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    messageCount: 0
  });
  const [dataQuality, setDataQuality] = useState<DataQualityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeWebSocket = useCallback(() => {
    try {
      // WebSocket endpoint not yet implemented in main server
      console.log('⚠️ WebSocket connection disabled - endpoint not implemented in main server');
      return;
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//requirements-gathering-agent.vercel.app/ws/compliance`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current!.onopen = () => {
        console.log('🔌 WebSocket connected');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastPing: new Date()
        }));
        setError(null);
        
        // Subscribe to project updates
        if (projectId) {
          subscribeToProject(projectId);
        }
        
        startPing();
      };
      
      wsRef.current!.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current!.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false
        }));
        
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            initializeWebSocket();
            reconnectTimeoutRef.current = null;
          }, 5000);
        }
      };
      
      wsRef.current!.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Connection error occurred');
      };
      
    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
      setError('Failed to initialize connection');
    }
  }, []);

  const handleWebSocketMessage = (message: any) => {
    setConnectionStatus(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastPing: new Date()
    }));

    switch (message.type) {
      case 'METRIC_UPDATE':
        console.log('📊 Received metric update:', message.data);
        onDataUpdate?.(message.data);
        setLastUpdate(new Date());
        break;
        
      case 'ISSUE_UPDATE':
        console.log('🐛 Received issue update:', message.data);
        onDataUpdate?.(message.data);
        setLastUpdate(new Date());
        break;
        
      case 'QUALITY_UPDATE':
        console.log('🔍 Received quality update:', message.data);
        onQualityChange?.(message.data);
        setLastUpdate(new Date());
        break;
        
      case 'STATUS_UPDATE':
        if (message.data?.connectionId) {
          setConnectionStatus(prev => ({
            ...prev,
            connectionId: message.data.connectionId
          }));
        }
        break;
        
      case 'PONG':
        // Handle pong response
        break;
        
      default:
        console.log('📨 Unknown message type:', message.type);
    }
  };

  const subscribeToProject = (projectId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'METRIC_UPDATE',
        projectId,
        timestamp: new Date().toISOString()
      };
      
      wsRef.current!.send(JSON.stringify(message));
      
      setConnectionStatus(prev => ({
        ...prev,
        projectId
      }));
    }
  };

  const startPing = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current!.send(JSON.stringify({
          type: 'PING',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Ping every 30 seconds
  };

  const loadDataQuality = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/standards/enhanced/data-quality/${projectId || 'current-project'}`);
      const result = await response.json();
      
      if (result.success && result.data?.currentQuality) {
        const quality = result.data.currentQuality;
        setDataQuality({
          overallQuality: quality.overallScore,
          qualityLevel: quality.qualityLevel,
          completeness: quality.dimensions.completeness,
          accuracy: quality.dimensions.accuracy,
          timeliness: quality.dimensions.timeliness,
          issuesFound: quality.issuesFound,
          lastValidated: new Date(quality.validatedAt)
        });
        
        onQualityChange?.(quality);
      }
    } catch (error) {
      console.error('❌ Error loading data quality:', error);
      setError('Failed to load data quality metrics');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    initializeWebSocket();
    loadDataQuality();
    
    return () => {
      cleanup();
    };
  }, [projectId, initializeWebSocket, loadDataQuality]);

  const refreshData = async () => {
    await loadDataQuality();
    setLastUpdate(new Date());
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current!.close();
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
  };

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50';
      case 'GOOD': return 'text-blue-600 bg-blue-50';
      case 'FAIR': return 'text-yellow-600 bg-yellow-50';
      case 'POOR': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'EXCELLENT': return <CheckCircle className="w-4 h-4" />;
      case 'GOOD': return <CheckCircle className="w-4 h-4" />;
      case 'FAIR': return <AlertCircle className="w-4 h-4" />;
      case 'POOR': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {connectionStatus.isConnected ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Real-time Data Integration</h3>
            <p className="text-xs text-gray-500">
              {connectionStatus.isConnected ? 'Connected to live data stream' : 'Disconnected from data stream'}
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>Messages: {connectionStatus.messageCount}</span>
        </div>
        
        {connectionStatus.projectId && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>Project: {connectionStatus.projectId}</span>
          </div>
        )}
        
        {lastUpdate && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Data Quality Status */}
      {dataQuality && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Data Quality Status</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(dataQuality.qualityLevel)}`}>
              {getQualityIcon(dataQuality.qualityLevel)}
              <span className="ml-1">{dataQuality.qualityLevel}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{dataQuality.overallQuality}%</div>
              <div className="text-xs text-gray-500">Overall Quality</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{dataQuality.completeness}%</div>
              <div className="text-xs text-gray-500">Completeness</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{dataQuality.accuracy}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{dataQuality.timeliness}%</div>
              <div className="text-xs text-gray-500">Timeliness</div>
            </div>
          </div>
          
          {dataQuality.issuesFound > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {dataQuality.issuesFound} data quality issues detected
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center py-4">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Loading data quality metrics...</span>
        </div>
      )}
    </div>
  );
}
