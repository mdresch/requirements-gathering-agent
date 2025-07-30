// server.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\src\api\server.ts

import { createRequire } from 'module';
import { Request, Response } from 'express';
import { DocumentController } from './controllers/DocumentController.js';
import { TemplateController } from './controllers/TemplateController.js';
import { TemplateRepository } from '../repositories/TemplateRepository.js';
import { HealthController } from './controllers/HealthController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiKeyAuth } from './middleware/auth.js';
import { dbConnection } from '../config/database.js';
import projectRoutes from './routes/projects.js';

// In-memory project database (sample data)
const projects = [
  {
    id: '1',
    name: 'Financial Services Digital Transformation',
    description: 'Comprehensive requirements gathering for digital banking platform',
    status: 'active',
    framework: 'babok',
    complianceScore: 94,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-13',
    documents: 12,
    stakeholders: 8
  },
  {
    id: '2',
    name: 'Healthcare Management System',
    description: 'HIPAA-compliant patient management system requirements',
    status: 'review',
    framework: 'pmbok',
    complianceScore: 87,
    createdAt: '2025-01-08',
    updatedAt: '2025-01-12',
    documents: 9,
    stakeholders: 12
  },
  {
    id: '3',
    name: 'E-commerce Platform Redesign',
    description: 'Modern e-commerce platform with AI-powered recommendations',
    status: 'completed',
    framework: 'multi',
    complianceScore: 96,
    createdAt: '2024-12-15',
    updatedAt: '2025-01-05',
    documents: 18,
    stakeholders: 15
  }
];

const require = createRequire(import.meta.url);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * ADPA API Server
 * Express.js server implementing the TypeSpec-defined API endpoints
 * for professional document processing and conversion services.
 */

const app = express();
const PORT = process.env.PORT || 3001;

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

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
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

// API key authentication for protected endpoints
app.use('/api/v1/documents', apiKeyAuth);
app.use('/api/v1/templates', apiKeyAuth);
app.use('/api/v1/projects', apiKeyAuth);

// Project management routes
app.use('/api/v1/projects', projectRoutes);

// Health check routes (public)
app.get('/api/v1/health', HealthController.getHealth);
app.get('/api/v1/health/ready', HealthController.getReadiness);
app.get('/api/v1/health/live', HealthController.getLiveness);
app.get('/api/v1/health/metrics', HealthController.getMetrics);
app.get('/api/v1/health/version', HealthController.getVersion);

// Document processing routes
app.post('/api/v1/documents/convert', DocumentController.convertDocument);
app.post('/api/v1/documents/batch/convert', DocumentController.batchConvert);
app.get('/api/v1/documents/jobs/:jobId', DocumentController.getJobStatus);
app.get('/api/v1/documents/batch/:batchId', DocumentController.getBatchStatus);
app.get('/api/v1/documents/download/:jobId', DocumentController.downloadDocument);
app.delete('/api/v1/documents/jobs/:jobId', DocumentController.cancelJob);
app.get('/api/v1/documents/jobs', DocumentController.listJobs);
app.get('/api/v1/documents/stats', DocumentController.getStats);
app.post('/api/v1/documents/jobs/:jobId/retry', DocumentController.retryJob);
app.get('/api/v1/documents/formats', DocumentController.getSupportedFormats);

// Template management routes


// API documentation route
app.get('/api/docs', (req: Request, res: Response) => {
    res.redirect('/docs/api/index.html');
});

// Serve static API documentation
app.use('/docs', express.static('docs'));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);


// Start server
if (process.env.NODE_ENV !== 'test') {
    const actualPort = PORT;
    dbConnection.connect()
        .then(() => {
            console.log('✅ Database connection established.');
            try {
                const repo = new TemplateRepository();
                TemplateController.setTemplateRepository(repo);
                console.log('✅ TemplateRepository initialized and set on TemplateController.');
            } catch (err) {
                console.error('❌ Failed to initialize TemplateRepository:', err);
            }
            // Import and register templates router only after repo is set
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { createTemplatesRouter } = require('./routes/templates.js');
            const templatesRouter = createTemplatesRouter(TemplateController);
            app.use('/api/v1/templates', templatesRouter);
            app.listen(actualPort, () => {
                if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
                    console.warn('⚠️  NODE_ENV is not set to development or test. Some features may not work as expected.');
                }
                console.log(`🚀 ADPA API Server running on port ${actualPort}`);
                console.log(`📚 API Documentation: http://localhost:${actualPort}/docs/api/`);
                console.log(`🏥 Health Check: http://localhost:${actualPort}/api/v1/health`);
                console.log(`🎯 Admin Interface: http://localhost:${actualPort}/admin`);
                console.log(`🌐 CORS: Open (Development)`);
                console.log(`📊 Database: ${dbConnection.getConnectionStatus()}`);
                console.log(`🎯 Ready to process documents via API!`);
            });
        })
        .catch((error) => {
            console.error('❌ Failed to start server due to database connection error:', error);
            process.exit(1);
        });
}

export { app };
