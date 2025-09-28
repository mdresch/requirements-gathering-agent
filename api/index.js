// Vercel-compatible API handler
module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;

  // Health check endpoint (no auth required)
  if (method === 'GET' && url === '/api/v1/health') {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      message: 'API is running successfully'
    });
    return;
  }

  // Root endpoint
  if (method === 'GET' && url === '/') {
    res.status(200).json({
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
    return;
  }

  // Templates endpoint
  if (method === 'GET' && url === '/api/v1/templates') {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.API_KEY || 'dev-api-key-123';
    
    if (apiKey !== expectedKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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

    res.status(200).json({
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
    return;
  }

  // Projects endpoint
  if (method === 'GET' && url === '/api/v1/projects') {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.API_KEY || 'dev-api-key-123';
    
    if (apiKey !== expectedKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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

    res.status(200).json({
      success: true,
      data: {
        projects: mockProjects,
        total: mockProjects.length,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    });
    return;
  }

  // 404 handler
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${url} not found`,
    availableEndpoints: {
      health: '/api/v1/health',
      templates: '/api/v1/templates',
      projects: '/api/v1/projects'
    }
  });
}