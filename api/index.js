const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY || 'dev-api-key-123';
  
  if (apiKey === expectedKey) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Health check endpoint (no auth required)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ADPA API Server',
    version: '1.0.0',
    description: 'API server for admin interface',
    health: '/api/v1/health',
    endpoints: {
      health: '/api/v1/health',
      templates: '/api/v1/templates',
      projects: '/api/v1/projects'
    }
  });
});

// Templates endpoints
app.get('/api/v1/templates', authMiddleware, (req, res) => {
  const mockTemplates = [
    {
      id: "1",
      name: "Business Case Template",
      description: "Strategic justification and financial analysis for project initiation",
      category: "Strategic Planning",
      tags: ["business", "case", "analysis", "strategy"],
      content: "# Business Case Template\n\n## Executive Summary\n\n## Problem Statement\n\n## Solution Overview\n\n## Financial Analysis\n\n## Recommendations",
      aiInstructions: "Generate a comprehensive business case document following standard business analysis practices.",
      templateType: "ai_instruction",
      isActive: true,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Stakeholder Analysis Template",
      description: "Comprehensive stakeholder identification, analysis, and engagement strategy",
      category: "Stakeholder Management",
      tags: ["stakeholder", "analysis", "engagement", "communication"],
      content: "# Stakeholder Analysis\n\n## Stakeholder Identification\n\n## Stakeholder Analysis Matrix\n\n## Engagement Strategy\n\n## Communication Plan",
      aiInstructions: "Create detailed stakeholder analysis following PMBOK stakeholder management guidelines.",
      templateType: "ai_instruction",
      isActive: true,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: {
      templates: mockTemplates,
      total: mockTemplates.length,
      page: 1,
      limit: 20,
      totalPages: 1
    },
    message: 'Templates loaded successfully'
  });
});

// Projects endpoints
app.get('/api/v1/projects', authMiddleware, (req, res) => {
  const mockProjects = [
    {
      id: '1',
      name: 'Sample Project 1',
      description: 'A sample project for demonstration',
      status: 'active',
      framework: 'babok',
      complianceScore: 85,
      documents: 5,
      stakeholders: 3,
      templatesCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sample Project 2',
      description: 'Another sample project',
      status: 'planning',
      framework: 'pmbok',
      complianceScore: 72,
      documents: 3,
      stakeholders: 2,
      templatesCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: {
      projects: mockProjects,
      total: mockProjects.length,
      page: 1,
      limit: 20,
      totalPages: 1
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      health: '/api/v1/health',
      templates: '/api/v1/templates',
      projects: '/api/v1/projects'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;