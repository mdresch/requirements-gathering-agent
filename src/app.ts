import { createRequire } from 'module';
import { Request, Response } from 'express';

const require = createRequire(import.meta.url);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

// Routes
import documentRoutes from './api/routes/documents.js';
import healthRoutes from './api/routes/health.js';
import standardsComplianceRoutes from './api/routes/standardsCompliance.js';
import reviewRoutes from './api/routes/reviews.js';
import reviewerRoutes from './api/routes/reviewers.js';
import documentGenerationRoutes from './api/routes/documentGeneration.js';
import scopeControlRoutes from './api/routes/scopeControl.js';

// Middleware
import { errorHandler } from './api/middleware/errorHandler.js';
import { authMiddleware } from './api/middleware/auth.js';
import { logger } from './config/logger.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// --- GUARANTEED DEV CORS CONFIG ---
app.use(cors({
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
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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
const limiter = rateLimit({
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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// API Documentation - Serve the generated OpenAPI spec
const openApiPath = path.join(process.cwd(), 'api-specs', 'generated', '@typespec', 'openapi3', 'openapi.yaml');
if (fs.existsSync(openApiPath)) {
  const yaml = require('yaml');
  const swaggerDocument = yaml.parse(fs.readFileSync(openApiPath, 'utf8'));
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));
}

// Health check endpoint (no auth required)
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

// Protected API routes
app.use('/api/v1/documents', authMiddleware, documentRoutes);
app.use('/api/v1/standards', authMiddleware, standardsComplianceRoutes);
app.use('/api/v1/reviews', authMiddleware, reviewRoutes);
app.use('/api/v1/reviewers', authMiddleware, reviewerRoutes);
app.use('/api/v1/document-generation', authMiddleware, documentGenerationRoutes);
app.use('/api/v1', authMiddleware, scopeControlRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      health: '/api/v1/health',
      documents: '/api/v1/documents',
      templates: '/api/v1/templates',
      standards: '/api/v1/standards',
      reviews: '/api/v1/reviews',
      reviewers: '/api/v1/reviewers',
      documentGeneration: '/api/v1/document-generation',
      documentation: '/api-docs'
    }
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
