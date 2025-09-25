// Standalone Enhanced Audit Trail Server
// Simple server for testing enhanced audit trail functionality

import express from 'express';
import cors from 'cors';
import { logger } from '../utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Audit Trail Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Enhanced audit trail routes - inline implementation for now
app.get('/api/v1/audit-trail/simple-enhanced', (req, res) => {
  // Mock enhanced audit trail data
  const mockData = {
    success: true,
    message: 'Simple enhanced audit trail retrieved successfully',
    data: {
      entries: [
        {
          _id: 'audit_001',
          documentId: 'doc_123',
          documentName: 'Requirements Specification v2.1',
          documentType: 'requirements',
          projectId: 'project_456',
          projectName: 'Customer Portal Enhancement',
          action: 'quality_assessed',
          actionDescription: 'Document quality assessed with compliance scoring',
          userId: 'user_789',
          userName: 'John Doe',
          userRole: 'Business Analyst',
          userEmail: 'john.doe@company.com',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'medium',
          category: 'quality',
          notes: 'Compliance score improved from 82% to 87%',
          tags: ['compliance', 'quality', 'babok'],
          
          // Enhanced data
          complianceMetrics: {
            standardType: 'BABOK',
            score: 87,
            previousScore: 82,
            changePercentage: 6.1,
            trendDirection: 'IMPROVING'
          },
          
          dataQuality: {
            qualityScore: 89,
            completenessScore: 92,
            accuracyScore: 87,
            consistencyScore: 88,
            issuesFound: 2
          },
          
          realTimeContext: {
            sessionId: 'session_abc123',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: '192.168.1.100',
            component: 'DocumentEditor',
            action: 'quality_check',
            duration: 1250
          },
          
          workflowContext: {
            workflowId: 'workflow_001',
            workflowName: 'Quality Review Process',
            status: 'IN_PROGRESS',
            assignedTo: 'Jane Smith',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          _id: 'audit_002',
          documentId: 'doc_124',
          documentName: 'Technical Architecture Document',
          documentType: 'architecture',
          projectId: 'project_456',
          projectName: 'Customer Portal Enhancement',
          action: 'created',
          actionDescription: 'New technical architecture document created',
          userId: 'user_790',
          userName: 'Sarah Wilson',
          userRole: 'Technical Architect',
          userEmail: 'sarah.wilson@company.com',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          severity: 'low',
          category: 'document',
          notes: 'Initial architecture document created based on requirements',
          tags: ['architecture', 'technical', 'pmbok'],
          
          complianceMetrics: {
            standardType: 'PMBOK',
            score: 94,
            previousScore: null,
            changePercentage: 0,
            trendDirection: 'STABLE'
          },
          
          dataQuality: {
            qualityScore: 91,
            completenessScore: 88,
            accuracyScore: 94,
            consistencyScore: 92,
            issuesFound: 1
          },
          
          realTimeContext: {
            sessionId: 'session_def456',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            ipAddress: '192.168.1.101',
            component: 'DocumentCreator',
            action: 'document_creation',
            duration: 3200
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      },
      analytics: {
        totalEntries: 2,
        entriesByCategory: {
          'document': 1,
          'quality': 1,
          'user': 0,
          'system': 0,
          'ai': 0
        },
        entriesBySeverity: {
          'low': 1,
          'medium': 1,
          'high': 0,
          'critical': 0
        },
        entriesByAction: {
          'created': 1,
          'quality_assessed': 1
        },
        complianceScoreTrends: [
          {
            standardType: 'BABOK',
            currentScore: 87,
            previousScore: 82,
            changePercentage: 6.1,
            trendDirection: 'IMPROVING'
          },
          {
            standardType: 'PMBOK',
            currentScore: 94,
            previousScore: 0,
            changePercentage: 0,
            trendDirection: 'STABLE'
          }
        ],
        dataQualityTrends: [
          {
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            overallScore: 85,
            completenessScore: 88,
            accuracyScore: 82,
            issuesFound: 5
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            overallScore: 87,
            completenessScore: 90,
            accuracyScore: 85,
            issuesFound: 3
          },
          {
            date: new Date().toISOString(),
            overallScore: 89,
            completenessScore: 92,
            accuracyScore: 87,
            issuesFound: 2
          }
        ],
        userActivitySummary: [
          {
            userId: 'user_789',
            userName: 'John Doe',
            totalActions: 15,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            topActions: ['quality_assessed', 'viewed', 'updated'],
            complianceScore: 87
          },
          {
            userId: 'user_790',
            userName: 'Sarah Wilson',
            totalActions: 8,
            lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            topActions: ['created', 'viewed'],
            complianceScore: 94
          }
        ],
        systemHealth: {
          averageResponseTime: 245,
          errorRate: 0.8,
          activeUsers: 2,
          systemUptime: 99.9
        }
      }
    }
  };
  
  res.json(mockData);
});

// Analytics endpoint
app.get('/api/v1/audit-trail/simple-enhanced/analytics', (req, res) => {
  const mockAnalytics = {
    success: true,
    message: 'Simple enhanced audit analytics retrieved successfully',
    data: {
      totalEntries: 2,
      entriesByCategory: {
        'document': 1,
        'quality': 1,
        'user': 0,
        'system': 0,
        'ai': 0
      },
      entriesBySeverity: {
        'low': 1,
        'medium': 1,
        'high': 0,
        'critical': 0
      },
      entriesByAction: {
        'created': 1,
        'quality_assessed': 1
      },
      complianceScoreTrends: [
        {
          standardType: 'BABOK',
          currentScore: 87,
          previousScore: 82,
          changePercentage: 6.1,
          trendDirection: 'IMPROVING'
        },
        {
          standardType: 'PMBOK',
          currentScore: 94,
          previousScore: 0,
          changePercentage: 0,
          trendDirection: 'STABLE'
        }
      ],
      dataQualityTrends: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          overallScore: 85,
          completenessScore: 88,
          accuracyScore: 82,
          issuesFound: 5
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          overallScore: 87,
          completenessScore: 90,
          accuracyScore: 85,
          issuesFound: 3
        },
        {
          date: new Date().toISOString(),
          overallScore: 89,
          completenessScore: 92,
          accuracyScore: 87,
          issuesFound: 2
        }
      ],
      userActivitySummary: [
        {
          userId: 'user_789',
          userName: 'John Doe',
          totalActions: 15,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          topActions: ['quality_assessed', 'viewed', 'updated'],
          complianceScore: 87
        },
        {
          userId: 'user_790',
          userName: 'Sarah Wilson',
          totalActions: 8,
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          topActions: ['created', 'viewed'],
          complianceScore: 94
        }
      ],
      systemHealth: {
        averageResponseTime: 245,
        errorRate: 0.8,
        activeUsers: 2,
        systemUptime: 99.9
      }
    }
  };
  
  res.json(mockAnalytics);
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: {
      health: '/health',
      enhancedAuditTrail: '/api/v1/audit-trail/simple-enhanced',
      analytics: '/api/v1/audit-trail/simple-enhanced/analytics',
      compliance: '/api/v1/audit-trail/simple-enhanced/compliance/:projectId',
      export: '/api/v1/audit-trail/simple-enhanced/export'
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Enhanced Audit Trail Server running on port ${PORT}`);
  logger.info(`📊 Available endpoints:`);
  logger.info(`   Health: http://localhost:${PORT}/health`);
  logger.info(`   Enhanced Audit Trail: http://localhost:${PORT}/api/v1/audit-trail/simple-enhanced`);
  logger.info(`   Analytics: http://localhost:${PORT}/api/v1/audit-trail/simple-enhanced/analytics`);
  logger.info(`   Compliance: http://localhost:${PORT}/api/v1/audit-trail/simple-enhanced/compliance/:projectId`);
  logger.info(`   Export: http://localhost:${PORT}/api/v1/audit-trail/simple-enhanced/export`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
