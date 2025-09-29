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

  // Simple auth check
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY || 'dev-api-key-123';
  
  if (apiKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Mock data for now
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
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
