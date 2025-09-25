// Phase 1 & 2: Enhanced Data Integration - MongoDB Atlas Database Configuration
// MongoDB Atlas connection with compliance collections support

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

interface DatabaseConfig {
  uri: string;
  database: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferCommands: boolean;
  };
}

class DatabaseManager {
  private connection: mongoose.Connection | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): DatabaseConfig {
    const config: DatabaseConfig = {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent',
      database: process.env.MONGODB_DATABASE || 'requirements-gathering-agent',
      options: {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
        bufferCommands: false
      }
    };

    logger.info('📊 MongoDB Atlas configuration loaded:', {
      uri: config.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
      database: config.database,
      maxPoolSize: config.options.maxPoolSize
    });

    return config;
  }

  async connect(): Promise<mongoose.Connection> {
    if (this.connection && this.connection.readyState === 1) {
      return this.connection;
    }

    try {
      await mongoose.connect(this.config.uri, this.config.options);
      this.connection = mongoose.connection;
      
      logger.info('✅ MongoDB Atlas connected successfully');
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Initialize compliance collections
      await this.initializeComplianceCollections();
      
      return this.connection;
    } catch (error) {
      logger.error('❌ MongoDB Atlas connection failed:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    this.connection.on('disconnected', () => {
      logger.info('🔌 MongoDB disconnected');
    });

    this.connection.on('reconnected', () => {
      logger.info('🔌 MongoDB reconnected');
    });

    this.connection.on('close', () => {
      logger.info('🔌 MongoDB connection closed');
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('🔌 MongoDB connection closed');
    }
  }

  getConnection(): mongoose.Connection | null {
    return this.connection;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection || this.connection.readyState !== 1) {
        return false;
      }

      await this.connection.db?.admin().ping();
      return true;
    } catch (error) {
      logger.error('❌ MongoDB health check failed:', error);
      return false;
    }
  }

  async initializeComplianceCollections(): Promise<void> {
    try {
      // Import compliance models to ensure they're registered
      await import('../models/ComplianceMetrics.model.js');
      await import('../models/ComplianceIssue.model.js');
      await import('../models/ComplianceWorkflow.model.js');
      await import('../models/ComplianceNotification.model.js');
      
      logger.info('✅ Compliance collections initialized');
    } catch (error) {
      logger.error('❌ Error initializing compliance collections:', error);
      throw error;
    }
  }

  async seedInitialData(): Promise<void> {
    try {
      // Import models
      const ComplianceMetrics = (await import('../models/ComplianceMetrics.model.js')).default;
      const ComplianceIssue = (await import('../models/ComplianceIssue.model.js')).default;
      const ComplianceNotification = (await import('../models/ComplianceNotification.model.js')).default;

      // Check if we already have data
      const metricsCount = await ComplianceMetrics.countDocuments();
      
      if (metricsCount > 0) {
        logger.info('📊 Initial compliance data already exists, skipping seed');
        return;
      }

      // Insert sample compliance metrics
      const sampleMetrics = [
        {
          projectId: 'current-project',
          standardType: 'BABOK',
          score: 94,
          dataSource: 'api',
          calculatedAt: new Date(),
          metadata: {
            version: '1.0',
            framework: 'BABOK v3',
            category: 'Requirements Analysis'
          },
          trends: {
            previousScore: 92,
            changePercentage: 2.2,
            trendDirection: 'IMPROVING',
            period: '30d'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'PMBOK',
          score: 89,
          dataSource: 'api',
          calculatedAt: new Date(),
          metadata: {
            version: '1.0',
            framework: 'PMBOK 7th',
            category: 'Project Management'
          },
          trends: {
            previousScore: 84,
            changePercentage: 5.9,
            trendDirection: 'IMPROVING',
            period: '30d'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'DMBOK',
          score: 78,
          dataSource: 'api',
          calculatedAt: new Date(),
          metadata: {
            version: '1.0',
            framework: 'DMBOK 2.0',
            category: 'Data Management'
          },
          trends: {
            previousScore: 78,
            changePercentage: 0,
            trendDirection: 'STABLE',
            period: '30d'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'ISO',
          score: 85,
          dataSource: 'api',
          calculatedAt: new Date(),
          metadata: {
            version: '1.0',
            framework: 'ISO 15408',
            category: 'Security Management'
          },
          trends: {
            previousScore: 83,
            changePercentage: 2.4,
            trendDirection: 'IMPROVING',
            period: '30d'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'OVERALL',
          score: 87,
          dataSource: 'api',
          calculatedAt: new Date(),
          metadata: {
            version: '1.0',
            framework: 'Multi-Standard',
            category: 'Overall Compliance'
          },
          trends: {
            previousScore: 84,
            changePercentage: 3.6,
            trendDirection: 'IMPROVING',
            period: '30d'
          }
        }
      ];

      await ComplianceMetrics.insertMany(sampleMetrics);

      // Insert sample compliance issues
      const sampleIssues = [
        {
          projectId: 'current-project',
          standardType: 'BABOK',
          issueType: 'Requirements Analysis',
          severity: 'MEDIUM',
          title: 'Incomplete requirements documentation',
          description: 'Some requirements are not fully documented according to BABOK standards',
          status: 'OPEN',
          priority: 'MEDIUM',
          createdBy: 'system',
          tags: ['requirements', 'documentation'],
          metadata: {
            category: 'Requirements',
            impact: 'Medium',
            effort: 'Low'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'PMBOK',
          issueType: 'Project Scope Management',
          severity: 'HIGH',
          title: 'Scope creep detected',
          description: 'Project scope has expanded beyond original boundaries',
          status: 'ASSIGNED',
          priority: 'HIGH',
          createdBy: 'system',
          assigneeId: 'user-1',
          tags: ['scope', 'management'],
          metadata: {
            category: 'Scope',
            impact: 'High',
            effort: 'Medium'
          }
        },
        {
          projectId: 'current-project',
          standardType: 'DMBOK',
          issueType: 'Data Quality',
          severity: 'LOW',
          title: 'Data validation rules need updating',
          description: 'Current data validation rules may not cover all edge cases',
          status: 'OPEN',
          priority: 'LOW',
          createdBy: 'system',
          tags: ['data', 'quality'],
          metadata: {
            category: 'Data Quality',
            impact: 'Low',
            effort: 'Low'
          }
        }
      ];

      await ComplianceIssue.insertMany(sampleIssues);

      // Insert sample notifications
      const sampleNotifications = [
        {
          type: 'COMPLIANCE_UPDATE',
          title: 'BABOK Compliance Score Updated',
          message: 'BABOK compliance score has improved from 92% to 94%',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          priority: 'MEDIUM',
          category: 'COMPLIANCE',
          projectId: 'current-project',
          actions: [
            { label: 'View Details', action: 'view_compliance', type: 'primary' },
            { label: 'Dismiss', action: 'dismiss', type: 'secondary' }
          ]
        },
        {
          type: 'ISSUE_CREATED',
          title: 'New Critical Issue Detected',
          message: 'A critical compliance issue has been identified in Project Alpha',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          priority: 'URGENT',
          category: 'ISSUE',
          projectId: 'current-project',
          actions: [
            { label: 'View Issue', action: 'view_issue', type: 'primary' },
            { label: 'Assign', action: 'assign_issue', type: 'secondary' }
          ]
        }
      ];

      await ComplianceNotification.insertMany(sampleNotifications);

      logger.info('✅ Initial compliance data seeded successfully');
    } catch (error) {
      logger.error('❌ Error seeding initial compliance data:', error);
      throw error;
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;
export { DatabaseManager };