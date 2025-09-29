import templateRouter from './routes/templates.js';
import projectRouter from './api/routes/projects.js';
import projectDocumentRouter from './api/routes/projectDocuments.js';
import stakeholderRouter from './api/routes/stakeholders.js';
import feedbackRouter from './api/routes/feedback.js';
import auditTrailRouter from './api/routes/auditTrail.js';
import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import rateLimitLib from 'express-rate-limit';
// Protected API routes
import documentRoutes from './routes/documents.js';
import standardsComplianceRoutes from './api/routes/standardsCompliance.js';
import reviewRoutes from './routes/reviews.js';
import reviewerRoutes from './routes/reviewers.js';
import documentGenerationRoutes from './routes/documentGeneration.js';
import scopeControlRoutes from './routes/scopeControl.js';
import templatesRoutes from './routes/templates.js';
import categoryRoutes from './api/routes/categories.js';
import predictiveAnalyticsRoutes from './api/routes/predictiveAnalyticsMinimal.js';
import advancedReportingRoutes from './api/routes/advancedReporting.js';
import contextTrackingRoutes from './api/routes/contextTracking.js';
import qualityRoutes from './api/routes/quality.js';
import analyticsRoutes from './api/routes/analytics.js';
import authMiddleware from './middleware/auth.js';

const app = express();

// Middleware must come before routes
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Register project documents API endpoint first (more specific routes)
app.use('/api/v1/projects', projectDocumentRouter);
// Register project API endpoint
app.use('/api/v1/projects', projectRouter);
// Register stakeholders API endpoint
app.use('/api/v1/stakeholders', authMiddleware, stakeholderRouter);
// Register feedback API endpoint
app.use('/api/v1/feedback', authMiddleware, feedbackRouter);
// Register audit trail API endpoint
app.use('/api/v1/audit-trail', authMiddleware, auditTrailRouter);

// Explicit OPTIONS handler for all routes (for CORS preflight)
app.options('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  optionsSuccessStatus: 204
}));

// Rate limiting - More generous for API development
const limiter = rateLimitLib({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Serve OpenAPI documentation if available
const openApiPath = path.join(process.cwd(), 'api-specs', 'generated', '@typespec', 'openapi3', 'openapi.yaml');
if (fs.existsSync(openApiPath)) {
  (async () => {
    const yamlModule = await import('yaml');
    const swaggerDocument = yamlModule.default.parse(fs.readFileSync(openApiPath, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      swaggerOptions: { persistAuthorization: true },
    }));
  })();
}

// Health check endpoint (no auth required)
import healthRoutes from './routes/health.js';
app.use('/api/v1/health', healthRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ADPA Document Processing API',
    version: '1.0.0',
    description: 'TypeSpec-defined REST API for document processing and template management',
    documentation: '/api-docs',
    health: '/api/v1/health'
  });
});

app.use('/api/v1/documents', authMiddleware, documentRoutes);
app.use('/api/v1/standards', authMiddleware, standardsComplianceRoutes);
app.use('/api/v1/reviews', authMiddleware, reviewRoutes);
app.use('/api/v1/reviewers', authMiddleware, reviewerRoutes);
app.use('/api/v1/document-generation', authMiddleware, documentGenerationRoutes);
app.use('/api/v1/scope-control', authMiddleware, scopeControlRoutes);
app.use('/api/v1/templates', authMiddleware, templatesRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1', predictiveAnalyticsRoutes);
app.use('/api/v1/reports', advancedReportingRoutes);
app.use('/api/v1/context-tracking', authMiddleware, contextTrackingRoutes);
app.use('/api/v1/quality', authMiddleware, qualityRoutes);
// 404 handler

// Global error handling middleware (must be last)
// Catch-all 404 handler (must be last)
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
      availableEndpoints: {
        health: '/api/v1/health',
        documents: '/api/v1/documents',
        standards: '/api/v1/standards',
        reviews: '/api/v1/reviews',
        reviewers: '/api/v1/reviewers',
        documentGeneration: '/api/v1/document-generation',
        scopeControl: '/api/v1/scope-control',
        stakeholders: '/api/v1/stakeholders',
        feedback: '/api/v1/feedback',
        contextTracking: '/api/v1/context-tracking',
        quality: '/api/v1/quality',
        auditTrail: '/api/v1/audit-trail',
        generationJobs: '/api/v1/generation-jobs',
        documentation: '/api-docs'
      }
  });
});
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;

