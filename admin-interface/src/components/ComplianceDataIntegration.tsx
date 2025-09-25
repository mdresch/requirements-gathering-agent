// Enhanced Data Integration Component for Standards Compliance Dashboard
// This component will provide real-time data integration capabilities

'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface RealTimeDataProps {
  projectId?: string;
  onDataUpdate?: (data: any) => void;
}

export default function ComplianceDataIntegration({ projectId, onDataUpdate }: RealTimeDataProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataQuality, setDataQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  useEffect(() => {
    // Simulate real-time data connection
    const interval = setInterval(() => {
      setIsConnected(true);
      setLastUpdate(new Date());
      // In real implementation, this would fetch actual project data
      onDataUpdate?.({
        timestamp: new Date(),
        source: 'project-database',
        quality: dataQuality
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [onDataUpdate, dataQuality]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Database className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Data Integration</h3>
            <p className="text-xs text-gray-500">
              {isConnected ? 'Connected to project database' : 'Disconnected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {lastUpdate && (
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            {dataQuality === 'excellent' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {dataQuality === 'good' && <CheckCircle className="w-4 h-4 text-blue-500" />}
            {dataQuality === 'fair' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
            {dataQuality === 'poor' && <AlertCircle className="w-4 h-4 text-red-500" />}
            <span className="capitalize">{dataQuality} quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}
