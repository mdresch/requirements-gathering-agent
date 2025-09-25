// server.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\src\api\server.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { DocumentController } from './controllers/DocumentController.js';
import { HealthController } from './controllers/HealthController.js';
// ...existing code...
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiKeyAuth } from './middleware/auth.js';
import { trackApiMetrics, trackUserActivity } from '../middleware/metricsTracking.js';
// ...existing code...
import projectRoutes from './routes/projects.js';
import feedbackRoutes from './routes/feedback.js';
import contextTrackingRoutes from './routes/contextTracking.js';
import templateRouter from '../routes/templates.js';
import auditTrailRoutes from './routes/auditTrail.js';
import enhancedAuditTrailRoutes from './routes/enhancedAuditTrail.js';
import simpleEnhancedAuditTrailRoutes from './routes/simpleEnhancedAuditTrail.js';
import standardsComplianceRoutes from './routes/standardsCompliance.js';
import complianceAuditRoutes from './routes/complianceAudit.js';
import complianceAuditMockRoutes from './routes/complianceAuditMock.js';
import dataQualityAuditRoutes from './routes/dataQualityAudit.js';
import realTimeActivityRoutes, { setupWebSocketServer } from './routes/realTimeActivity.js';
import categoryRoutes from './routes/categories.js';
import databaseHealthRoutes from './routes/databaseHealth.js';
import realTimeMetricsRoutes from './routes/realTimeMetrics.js';
import aiBillingRoutes from './routes/aiBilling.js';
import dataAggregationRoutes from './routes/dataAggregation.js';
import predictiveAnalyticsRoutes from './routes/predictiveAnalyticsSimple.js';
import alertRoutes from './routes/alerts.js';
import documentGenerationRoutes from './routes/documentGeneration.js';
import dbConnection from '../config/database.js';
import { TemplateController } from './controllers/TemplateController.js';
import { TemplateRepository } from '../repositories/TemplateRepository.js';
import { RealTimeActivityTrackingService } from '../services/RealTimeActivityTrackingService.js';



/**
 * ADPA API Server
 * Express.js server implementing the TypeSpec-defined API endpoints
 * for professional document processing and conversion services.
 */

const app = express();
// Always run API server on port 3002 for npm run api:server
const PORT = 3002;

// Apply CORS globally for all routes FIRST
app.use(cors({
    origin: true, // or ['http://localhost:3003'] for stricter dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key'],
    optionsSuccessStatus: 200
}));

// Security middleware
app.use(helmet());

// Rate limiting - Very generous for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very high limit for development
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.',
            timestamp: new Date().toISOString()
        }
    }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(requestLogger);

// Metrics tracking middleware
app.use(trackApiMetrics);
app.use(trackUserActivity);

// API key authentication for protected endpoints
app.use('/admin-api/v1/documents', apiKeyAuth);
app.use('/admin-api/v1/templates', apiKeyAuth);
app.use('/admin-api/v1/projects', apiKeyAuth);
app.use('/admin-api/v1/feedback', apiKeyAuth);


// Basic Markdown API documentation for /docs/api
app.get('/docs/api', (req: Request, res: Response) => {
    res.type('text/markdown').send(`
# Requirements Gathering Agent API Documentation

API Endpoints:
- /admin-api/v1/health
- /admin-api/v1/health/ready
- /admin-api/v1/documents/convert
- /admin-api/v1/documents/batch/convert
- /admin-api/v1/documents/jobs
- /admin-api/v1/documents/stats
- /admin-api/v1/templates
- /admin-api/v1/projects
- /admin-api/v1/feedback

Authentication:
- Protected endpoints require an API key in the 'X-API-Key' header.

See /api/docs for more details.
`);
});

// Health check routes (public)
app.get('/admin-api/v1/health', HealthController.getHealth);
app.get('/admin-api/v1/health/ready', HealthController.getReadiness);
app.post('/admin-api/v1/documents/convert', DocumentController.convertDocument);
app.post('/admin-api/v1/documents/batch/convert', DocumentController.batchConvert);
app.get('/admin-api/v1/documents/jobs', DocumentController.listJobs);
app.get('/admin-api/v1/documents/stats', DocumentController.getStats);

// Public frontend API endpoint for templates
app.use('/api/v1/templates', templateRouter);

// Public frontend API endpoint for projects
app.use('/api/v1/projects', projectRoutes);

// Feedback routes
app.use('/api/v1/feedback', feedbackRoutes);

// Context tracking routes
app.use('/api/v1/context-tracking', contextTrackingRoutes);

// Audit trail routes (basic)
app.use('/api/v1/audit-trail', auditTrailRoutes);

// Enhanced audit trail routes (extended functionality)
app.use('/api/v1/audit-trail/enhanced', enhancedAuditTrailRoutes);

// Simple enhanced audit trail routes (for testing)
app.use('/api/v1/audit-trail/simple', simpleEnhancedAuditTrailRoutes);

// Standards compliance routes
app.use('/api/v1/standards', standardsComplianceRoutes);

// Compliance audit routes
app.use('/api/v1/compliance-audit', complianceAuditRoutes);

// Compliance audit mock routes (for testing)
app.use('/api/v1/compliance-audit', complianceAuditMockRoutes);

// Data quality audit routes
app.use('/api/v1/data-quality-audit', dataQualityAuditRoutes);

// Real-time activity tracking routes
app.use('/api/v1/real-time-activity', realTimeActivityRoutes);

// Database health routes
app.use('/api/v1', databaseHealthRoutes);

// Real-time metrics routes
app.use('/api/v1', realTimeMetricsRoutes);

// AI billing routes
app.use('/api/v1', aiBillingRoutes);

// Data aggregation routes
app.use('/api/v1', dataAggregationRoutes);

// Predictive analytics routes
console.log('🔄 Registering predictive analytics routes...');
console.log('Predictive analytics routes object:', predictiveAnalyticsRoutes);
try {
    app.use('/api/v1', predictiveAnalyticsRoutes);
    console.log('✅ Predictive analytics routes registered successfully');
} catch (error) {
    console.error('❌ Error registering predictive analytics routes:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
}

// Alert system routes
app.use('/api/v1', alertRoutes);

// Document generation routes
app.use('/api/v1/document-generation', documentGenerationRoutes);

// Category routes
console.log('🔄 Registering category routes...');
console.log('Category routes object:', categoryRoutes);
try {
    app.use('/api/v1/categories', categoryRoutes);
    console.log('✅ Category routes registered successfully');
} catch (error) {
    console.error('❌ Error registering category routes:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
}
// API documentation route
app.get('/api/docs', (req: Request, res: Response) => {
    res.type('text/markdown').send(`
# Requirements Gathering Agent API Reference

This endpoint provides documentation for the API.
Refer to /docs/api for endpoint details.
`);
});

// Error handling middleware
app.use(errorHandler);


// Start server
if (process.env.NODE_ENV !== 'test') {
    const actualPort = PORT;
    
    // Initialize database connection
    const initializeServer = async () => {
        try {
            console.log('🔄 Initializing database connection...');
            await dbConnection.connect();
            console.log('✅ Database connection established');
            
            // Initialize template repository
            console.log('🔄 Initializing template repository...');
            const templateRepository = new TemplateRepository();
            TemplateController.setTemplateRepository(templateRepository);
            console.log('✅ Template repository initialized');
            
            // Synchronous import and registration for reliability
            try {
                // Use require for CommonJS or static import for ESM
                // For ESM:
                // import { templateRouter } from '../routes/templates.js';
                // For dynamic import:
                // const module = await import('../routes/templates.js');
                // const { templateRouter } = module;
                // But here, use static import for reliability:
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                // const { templateRouter } = require('../routes/templates.js');
                // For ESM static import:
                // Place at top: import { templateRouter } from '../routes/templates.js';
                // Here, do static import at top and register:
                // ...existing code...
                // So, add at top: import { templateRouter } from '../routes/templates.js';
                // And here:
                app.use('/admin-api/v1/templates', templateRouter);
            } catch (err) {
                console.error('Failed to register templates router:', err);
            }
            
            const server = app.listen(PORT, () => {
                if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
                    console.warn('⚠️  NODE_ENV is not set to development or test. Some features may not work as expected.');
                }
                console.log('ADPA API Server running on port ' + PORT);
                console.log('API Documentation: http://localhost:' + PORT + '/docs/api/');
                console.log('Health Check: http://localhost:' + PORT + '/admin-api/v1/health');
                console.log('Admin Interface: http://localhost:' + PORT + '/admin');
                console.log('CORS: Open (Development)');
                console.log('Ready to process documents via API!');
                
                // Setup WebSocket server for real-time activity tracking
                try {
                    setupWebSocketServer(server);
                    console.log('🔌 WebSocket server for real-time activity tracking initialized');
                } catch (error) {
                    console.error('❌ Failed to setup WebSocket server:', error);
                }
                
                // Initialize real-time activity tracking service
                try {
                    RealTimeActivityTrackingService.initialize();
                    console.log('🔄 Real-time activity tracking service initialized');
                } catch (error) {
                    console.error('❌ Failed to initialize real-time activity tracking service:', error);
                }
            });
        } catch (error) {
            console.error('❌ Failed to initialize server:', error);
            process.exit(1);
        }
    };
    
    initializeServer();
}


// Export the Express app instance for use in tests or other modules
export default app;
