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
import documentRoutes from './routes/documents';
import standardsComplianceRoutes from './routes/standards';
import reviewRoutes from './routes/reviews';
import reviewerRoutes from './routes/reviewers';
import documentGenerationRoutes from './routes/documentGeneration';
import scopeControlRoutes from './routes/scopeControl';
import authMiddleware from './middleware/auth';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

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
import healthRoutes from './routes/health';
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
app.use('/api/v1', authMiddleware, scopeControlRoutes);
// 404 handler
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
      documentation: '/api-docs'
    }
  });
});

// Global error handling middleware (must be last)
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;

