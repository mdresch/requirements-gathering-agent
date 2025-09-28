module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different routes
  const pathname = req.url || '/';

  if (pathname === '/api/v1/health' || pathname === '/health') {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      message: 'API is running successfully',
      path: pathname
    });
    return;
  }

  if (pathname === '/api/v1/templates' || pathname === '/templates') {
    // Simple auth check
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
    return;
  }

  // Default response
  res.json({
    name: 'ADPA API Server',
    version: '1.0.0',
    description: 'API server for admin interface',
    endpoints: {
      health: '/api/v1/health',
      templates: '/api/v1/templates'
    },
    path: pathname,
    method: req.method
  });
};