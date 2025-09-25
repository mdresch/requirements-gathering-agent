// Phase 1 & 2: Enhanced Data Integration - Real-time Data Service
// WebSocket service for pushing real-time compliance data updates

import { WebSocketServer, WebSocket } from 'ws';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { ComplianceDataService } from './ComplianceDataService.js';
import { DataQualityService } from './DataQualityService.js';
import ComplianceMetrics from '../models/ComplianceMetrics.model.js';
import ComplianceIssue from '../models/ComplianceIssue.model.js';
import ComplianceNotification from '../models/ComplianceNotification.model.js';

export interface RealTimeConnection {
  id: string;
  ws: WebSocket;
  projectId?: string;
  userId?: string;
  connectedAt: Date;
  lastPing: Date;
  isAlive: boolean;
}

export interface RealTimeMessage {
  type: 'METRIC_UPDATE' | 'ISSUE_UPDATE' | 'QUALITY_UPDATE' | 'STATUS_UPDATE' | 'PING' | 'PONG';
  projectId?: string;
  data?: any;
  timestamp: Date;
  messageId?: string;
}

export class RealTimeDataService {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, RealTimeConnection> = new Map();
  private complianceDataService: ComplianceDataService;
  private dataQualityService: DataQualityService;
  private changeStreams: Map<string, any> = new Map();

  constructor() {
    this.complianceDataService = new ComplianceDataService();
    this.dataQualityService = new DataQualityService();
    this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent');
      }
    } catch (error) {
      logger.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  // WebSocket Server Management
  async startWebSocketServer(port: number = 3004): Promise<void> {
    try {
      await this.ensureConnection();

      this.wss = new WebSocketServer({ port });

      this.wss.on('connection', (ws: WebSocket, request) => {
        const connectionId = this.generateConnectionId();
        const connection: RealTimeConnection = {
          id: connectionId,
          ws,
          connectedAt: new Date(),
          lastPing: new Date(),
          isAlive: true
        };

        this.connections.set(connectionId, connection);

        logger.info(`🔌 New WebSocket connection established: ${connectionId}`);

        // Handle incoming messages
        ws.on('message', (data: Buffer) => {
          try {
            const message: RealTimeMessage = JSON.parse(data.toString());
            this.handleMessage(connectionId, message);
          } catch (error) {
            logger.error('❌ Error parsing WebSocket message:', error);
            this.sendError(ws, 'Invalid message format');
          }
        });

        // Handle connection close
        ws.on('close', () => {
          this.handleDisconnection(connectionId);
        });

        // Handle connection errors
        ws.on('error', (error) => {
          logger.error(`❌ WebSocket error for connection ${connectionId}:`, error);
          this.handleDisconnection(connectionId);
        });

        // Send welcome message
        this.sendMessage(ws, {
          type: 'STATUS_UPDATE',
          data: { message: 'Connected to real-time compliance data service' },
          timestamp: new Date()
        });
      });

      // Start MongoDB change streams
      await this.startChangeStreams();

      // Start ping/pong mechanism
      this.startPingPong();

      logger.info(`✅ WebSocket server started on port ${port}`);
    } catch (error) {
      logger.error('❌ Error starting WebSocket server:', error);
      throw error;
    }
  }

  private async startChangeStreams(): Promise<void> {
    try {
      await this.ensureConnection();

      // Start change stream for compliance metrics
      const metricsChangeStream = ComplianceMetrics.watch();
      this.changeStreams.set('metrics', metricsChangeStream);

      metricsChangeStream.on('change', (change) => {
        this.handleMetricsChange(change);
      });

      // Start change stream for compliance issues
      const issuesChangeStream = ComplianceIssue.watch();
      this.changeStreams.set('issues', issuesChangeStream);

      issuesChangeStream.on('change', (change) => {
        this.handleIssuesChange(change);
      });

      // Start change stream for compliance notifications
      const notificationsChangeStream = ComplianceNotification.watch();
      this.changeStreams.set('notifications', notificationsChangeStream);

      notificationsChangeStream.on('change', (change) => {
        this.handleNotificationsChange(change);
      });

      logger.info('✅ MongoDB change streams started');
    } catch (error) {
      logger.error('❌ Error starting change streams:', error);
      throw error;
    }
  }

  private handleMetricsChange(change: any): void {
    try {
      const message: RealTimeMessage = {
        type: 'METRIC_UPDATE',
        projectId: change.fullDocument?.projectId,
        data: {
          operation: change.operationType,
          document: change.fullDocument,
          documentKey: change.documentKey
        },
        timestamp: new Date()
      };

      this.broadcastToProject(message.projectId, message);
      logger.info(`📊 Metrics change broadcasted: ${change.operationType}`);
    } catch (error) {
      logger.error('❌ Error handling metrics change:', error);
    }
  }

  private handleIssuesChange(change: any): void {
    try {
      const message: RealTimeMessage = {
        type: 'ISSUE_UPDATE',
        projectId: change.fullDocument?.projectId,
        data: {
          operation: change.operationType,
          document: change.fullDocument,
          documentKey: change.documentKey
        },
        timestamp: new Date()
      };

      this.broadcastToProject(message.projectId, message);
      logger.info(`🔍 Issues change broadcasted: ${change.operationType}`);
    } catch (error) {
      logger.error('❌ Error handling issues change:', error);
    }
  }

  private handleNotificationsChange(change: any): void {
    try {
      const message: RealTimeMessage = {
        type: 'QUALITY_UPDATE',
        projectId: change.fullDocument?.projectId,
        data: {
          operation: change.operationType,
          document: change.fullDocument,
          documentKey: change.documentKey
        },
        timestamp: new Date()
      };

      this.broadcastToProject(message.projectId, message);
      logger.info(`🔔 Notifications change broadcasted: ${change.operationType}`);
    } catch (error) {
      logger.error('❌ Error handling notifications change:', error);
    }
  }

  private handleMessage(connectionId: string, message: RealTimeMessage): void {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      switch (message.type) {
        case 'PING':
          this.handlePing(connectionId, message);
          break;
        case 'PONG':
          this.handlePong(connectionId, message);
          break;
        default:
          logger.warn(`⚠️ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('❌ Error handling message:', error);
    }
  }

  private handlePing(connectionId: string, message: RealTimeMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.lastPing = new Date();
    connection.isAlive = true;

    this.sendMessage(connection.ws, {
      type: 'PONG',
      timestamp: new Date(),
      messageId: message.messageId
    });
  }

  private handlePong(connectionId: string, message: RealTimeMessage): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.lastPing = new Date();
    connection.isAlive = true;
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      logger.info(`🔌 WebSocket connection closed: ${connectionId}`);
    }
  }

  private startPingPong(): void {
    setInterval(() => {
      this.connections.forEach((connection, connectionId) => {
        if (!connection.isAlive) {
          logger.info(`🔌 Terminating inactive connection: ${connectionId}`);
          connection.ws.terminate();
          this.connections.delete(connectionId);
          return;
        }

        connection.isAlive = false;
        this.sendMessage(connection.ws, {
          type: 'PING',
          timestamp: new Date()
        });
      });
    }, 30000); // Ping every 30 seconds
  }

  // Message Broadcasting
  private broadcastToProject(projectId: string | undefined, message: RealTimeMessage): void {
    if (!projectId) return;

    this.connections.forEach((connection) => {
      if (connection.projectId === projectId) {
        this.sendMessage(connection.ws, message);
      }
    });
  }

  private broadcastToAll(message: RealTimeMessage): void {
    this.connections.forEach((connection) => {
      this.sendMessage(connection.ws, message);
    });
  }

  private sendMessage(ws: WebSocket, message: RealTimeMessage): void {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      logger.error('❌ Error sending WebSocket message:', error);
    }
  }

  private sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, {
      type: 'STATUS_UPDATE',
      data: { error },
      timestamp: new Date()
    });
  }

  // Public API Methods
  async broadcastMetricUpdate(projectId: string, metricData: any): Promise<void> {
    const message: RealTimeMessage = {
      type: 'METRIC_UPDATE',
      projectId,
      data: metricData,
      timestamp: new Date()
    };

    this.broadcastToProject(projectId, message);
    logger.info(`📊 Metric update broadcasted for project: ${projectId}`);
  }

  async broadcastIssueUpdate(projectId: string, issueData: any): Promise<void> {
    const message: RealTimeMessage = {
      type: 'ISSUE_UPDATE',
      projectId,
      data: issueData,
      timestamp: new Date()
    };

    this.broadcastToProject(projectId, message);
    logger.info(`🔍 Issue update broadcasted for project: ${projectId}`);
  }

  async broadcastQualityUpdate(projectId: string, qualityData: any): Promise<void> {
    const message: RealTimeMessage = {
      type: 'QUALITY_UPDATE',
      projectId,
      data: qualityData,
      timestamp: new Date()
    };

    this.broadcastToProject(projectId, message);
    logger.info(`🔔 Quality update broadcasted for project: ${projectId}`);
  }

  async broadcastStatusUpdate(message: string, projectId?: string): Promise<void> {
    const statusMessage: RealTimeMessage = {
      type: 'STATUS_UPDATE',
      projectId,
      data: { message },
      timestamp: new Date()
    };

    if (projectId) {
      this.broadcastToProject(projectId, statusMessage);
    } else {
      this.broadcastToAll(statusMessage);
    }

    logger.info(`📢 Status update broadcasted: ${message}`);
  }

  // Connection Management
  getConnectionCount(): number {
    return this.connections.size;
  }

  getConnectionsByProject(projectId: string): RealTimeConnection[] {
    return Array.from(this.connections.values()).filter(
      connection => connection.projectId === projectId
    );
  }

  // Cleanup
  async stop(): Promise<void> {
    try {
      // Close all change streams
      this.changeStreams.forEach((stream, key) => {
        stream.close();
        logger.info(`🔌 Change stream closed: ${key}`);
      });
      this.changeStreams.clear();

      // Close all WebSocket connections
      this.connections.forEach((connection) => {
        connection.ws.close();
      });
      this.connections.clear();

      // Close WebSocket server
      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }

      logger.info('✅ Real-time data service stopped');
    } catch (error) {
      logger.error('❌ Error stopping real-time data service:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await mongoose.connection.db?.admin().ping();
      return this.wss !== null && this.connections.size >= 0;
    } catch (error) {
      logger.error('❌ Real-time data service health check failed:', error);
      return false;
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}