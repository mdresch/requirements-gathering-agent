// Real-time Updates Service - WebSocket integration for live data
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\lib\websocket.ts

import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export interface RealTimeEvent {
  type: 'project_updated' | 'document_generated' | 'compliance_analyzed' | 'template_created' | 'system_status';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface SystemStatus {
  api: 'online' | 'offline' | 'degraded';
  database: 'online' | 'offline' | 'degraded';
  adobe: 'online' | 'offline' | 'degraded';
  compliance: 'online' | 'offline' | 'degraded';
}

class WebSocketService {
  private socket: any | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;

  constructor() {
    this.connect();
  }

  private connect() {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 5000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.emit('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.emit('connection_status', { status: 'reconnected', attempts: attemptNumber });
    });

    this.socket.on('reconnect_error', (error: Error) => {
      this.reconnectAttempts++;
      console.log(`❌ WebSocket reconnection failed (attempt ${this.reconnectAttempts}):`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('connection_status', { status: 'failed', error });
      }
    });

    // Real-time event handlers
    this.socket.on('project_updated', (data: any) => this.emit('project_updated', data));
    this.socket.on('document_generated', (data: any) => this.emit('document_generated', data));
    this.socket.on('compliance_analyzed', (data: any) => this.emit('compliance_analyzed', data));
    this.socket.on('template_created', (data: any) => this.emit('template_created', data));
    this.socket.on('template_updated', (data: any) => this.emit('template_updated', data));
    this.socket.on('system_status', (data: any) => this.emit('system_status', data));
    this.socket.on('user_activity', (data: any) => this.emit('user_activity', data));
  }

  public subscribe(event: string, handler: (data: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public sendMessage(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, message not sent:', { event, data });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// React Hook for WebSocket
export function useWebSocket() {
  return {
    subscribe: webSocketService.subscribe.bind(webSocketService),
    sendMessage: webSocketService.sendMessage.bind(webSocketService),
    isConnected: webSocketService.isConnected.bind(webSocketService),
    getConnectionStatus: webSocketService.getConnectionStatus.bind(webSocketService),
  };
}
