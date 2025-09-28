// MongoDB connection
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  console.log('Creating new database connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('MONGODB_DATABASE:', process.env.MONGODB_DATABASE || 'requirements-gathering-agent');

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });

    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DATABASE || 'requirements-gathering-agent');
    console.log('Connected to database:', db.databaseName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

// Simple Vercel serverless function
export default async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { url, method } = req;

    // Health check endpoint
    if (method === 'GET' && url === '/api/v1/health') {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        message: 'API is running successfully',
        mongodb_uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        mongodb_database: process.env.MONGODB_DATABASE || 'requirements-gathering-agent'
      });
      return;
    }

    // Database test endpoint
    if (method === 'GET' && url === '/api/v1/db-test') {
      try {
        console.log('Testing database connection...');
        const { db } = await connectToDatabase();
        const collections = await db.listCollections().toArray();
        
        res.status(200).json({
          success: true,
          message: 'Database connection successful',
          database: db.databaseName,
          collections: collections.map(c => c.name),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Database test failed:', error.message);
        res.status(500).json({
          success: false,
          message: 'Database connection failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
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
          projects: '/api/v1/projects',
          standardsDashboard: '/api/v1/standards/dashboard',
          feedbackSummary: '/api/v1/feedback/summary',
          categoriesActive: '/api/v1/categories/active'
        }
      });
      return;
    }

    // Templates endpoint
    if (method === 'GET' && url.startsWith('/api/v1/templates')) {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('API Key received:', apiKey);
      console.log('Expected API Key:', expectedKey);
      
      // Temporarily disable authentication for debugging
      console.log('API Key received:', apiKey);
      console.log('Expected API Key:', expectedKey);
      // if (apiKey && apiKey !== expectedKey && apiKey !== 'dev-api-key-123') {
      //   console.log('API key mismatch:', apiKey, 'vs', expectedKey);
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      try {
        console.log('Attempting to load templates from database...');
        console.log('URL:', url);
        console.log('Query params:', req.query);
        
        const { db } = await connectToDatabase();
        console.log('Database connected, querying templates collection...');
        
        // Parse query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        console.log(`Pagination: page=${page}, limit=${limit}, skip=${skip}`);
        
        const templates = await db.collection('templates').find({}).skip(skip).limit(limit).toArray();
        const total = await db.collection('templates').countDocuments({});
        
        console.log(`Found ${templates.length} templates in database (page ${page} of ${Math.ceil(total / limit)})`);
        
        res.status(200).json({
          success: true,
          data: {
            templates: templates,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
          },
          message: 'Templates loaded from database'
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        console.log('Falling back to mock data...');
        // Fallback to mock data if database fails
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

        res.status(200).json({
        success: true,
        data: {
            templates: mockTemplates,
            total: mockTemplates.length,
            page: 1,
            limit: 20,
            totalPages: 1
        },
          message: 'Templates loaded from mock data (database unavailable)'
        });
      }
      return;
    }

    // Standards dashboard endpoint
    if (method === 'GET' && url.startsWith('/api/v1/standards/dashboard')) {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('Standards Dashboard API Key received:', apiKey);
      console.log('Standards Dashboard Expected API Key:', expectedKey);

      try {
        console.log('Attempting to load standards dashboard data from database...');
        console.log('URL:', url);
        
        const { db } = await connectToDatabase();
        
        // Get compliance data from projects collection
        const projects = await db.collection('projects').find({}).toArray();
        const totalProjects = projects.length;
        
        // Calculate compliance metrics
        const complianceData = {
          totalProjects: totalProjects,
          compliantProjects: projects.filter(p => p.complianceScore >= 80).length,
          averageCompliance: totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / totalProjects) : 0,
          frameworkBreakdown: {
            babok: projects.filter(p => p.framework === 'babok').length,
            pmbok: projects.filter(p => p.framework === 'pmbok').length,
            agile: projects.filter(p => p.framework === 'agile').length,
            other: projects.filter(p => !['babok', 'pmbok', 'agile'].includes(p.framework)).length
          },
          recentActivity: projects.slice(-5).map(p => ({
            projectName: p.name,
            complianceScore: p.complianceScore || 0,
            lastUpdated: p.updatedAt || p.createdAt
          }))
        };
        
        console.log(`Found ${totalProjects} projects for standards dashboard`);
        
        res.status(200).json({
          success: true,
          data: complianceData,
          message: 'Standards dashboard data loaded from database'
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        console.log('Falling back to mock data...');
        
        // Fallback to mock data
        const mockComplianceData = {
          totalProjects: 4,
          compliantProjects: 3,
          averageCompliance: 85,
          frameworkBreakdown: {
            babok: 2,
            pmbok: 1,
            agile: 1,
            other: 0
          },
          recentActivity: [
            {
              projectName: 'Sample Project 1',
              complianceScore: 85,
              lastUpdated: new Date().toISOString()
            }
          ]
        };

        res.status(200).json({
          success: true,
          data: mockComplianceData,
          message: 'Standards dashboard data loaded from mock data (database unavailable)'
        });
      }
      return;
    }

    // Categories active endpoint
    if (method === 'GET' && url.startsWith('/api/v1/categories/active')) {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('Categories Active API Key received:', apiKey);
      console.log('Categories Active Expected API Key:', expectedKey);

      try {
        console.log('Attempting to load active categories from database...');
        console.log('URL:', url);
        
        const { db } = await connectToDatabase();
        
        // Get unique categories from templates collection
        const templates = await db.collection('templates').find({}).toArray();
        const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
        
        const activeCategories = categories.map(category => ({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          count: templates.filter(t => t.category === category).length,
          isActive: true
        }));
        
        console.log(`Found ${activeCategories.length} active categories`);
        
        res.status(200).json({
          success: true,
          data: activeCategories,
          message: 'Active categories loaded from database'
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        console.log('Falling back to mock data...');
        
        // Fallback to mock data
        const mockCategories = [
          {
            id: 'strategic-planning',
            name: 'Strategic Planning',
            count: 3,
            isActive: true
          },
          {
            id: 'requirements-analysis',
            name: 'Requirements Analysis',
            count: 5,
            isActive: true
          },
          {
            id: 'project-management',
            name: 'Project Management',
            count: 2,
            isActive: true
          },
          {
            id: 'quality-assurance',
            name: 'Quality Assurance',
            count: 4,
            isActive: true
          }
        ];

        res.status(200).json({
          success: true,
          data: mockCategories,
          message: 'Active categories loaded from mock data (database unavailable)'
        });
      }
      return;
    }

    // Feedback summary endpoint
    if (method === 'GET' && url.startsWith('/api/v1/feedback/summary')) {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('Feedback Summary API Key received:', apiKey);
      console.log('Feedback Summary Expected API Key:', expectedKey);

      try {
        console.log('Attempting to load feedback summary from database...');
        console.log('URL:', url);
        
        const { db } = await connectToDatabase();
        
        // Get feedback data from feedback collection (if it exists)
        const feedbackCollection = db.collection('feedback');
        const feedbackExists = await feedbackCollection.countDocuments() > 0;
        
        let feedbackData;
        if (feedbackExists) {
          const feedback = await feedbackCollection.find({}).toArray();
          feedbackData = {
            totalFeedback: feedback.length,
            averageRating: feedback.length > 0 ? Math.round(feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length * 10) / 10 : 0,
            positiveFeedback: feedback.filter(f => (f.rating || 0) >= 4).length,
            recentFeedback: feedback.slice(-3).map(f => ({
              rating: f.rating || 0,
              comment: f.comment || '',
              timestamp: f.createdAt || new Date().toISOString()
            }))
          };
        } else {
          // No feedback collection exists, return empty data
          feedbackData = {
            totalFeedback: 0,
            averageRating: 0,
            positiveFeedback: 0,
            recentFeedback: []
          };
        }
        
        console.log(`Found ${feedbackData.totalFeedback} feedback entries`);
        
        res.status(200).json({
          success: true,
          data: feedbackData,
          message: 'Feedback summary loaded from database'
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        console.log('Falling back to mock data...');
        
        // Fallback to mock data
        const mockFeedbackData = {
          totalFeedback: 12,
          averageRating: 4.2,
          positiveFeedback: 9,
          recentFeedback: [
            {
              rating: 5,
              comment: 'Great template, very helpful!',
              timestamp: new Date().toISOString()
            },
            {
              rating: 4,
              comment: 'Good structure, could use more examples',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
              rating: 5,
              comment: 'Excellent quality, highly recommended',
              timestamp: new Date(Date.now() - 172800000).toISOString()
            }
          ]
        };

        res.status(200).json({
          success: true,
          data: mockFeedbackData,
          message: 'Feedback summary loaded from mock data (database unavailable)'
        });
      }
      return;
    }

    // Projects endpoint
    if (method === 'GET' && url.startsWith('/api/v1/projects')) {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('Projects API Key received:', apiKey);
      console.log('Projects Expected API Key:', expectedKey);
      
      // Temporarily disable authentication for debugging
      console.log('Projects API Key received:', apiKey);
      console.log('Projects Expected API Key:', expectedKey);
      // if (apiKey && apiKey !== expectedKey && apiKey !== 'dev-api-key-123') {
      //   console.log('Projects API key mismatch:', apiKey, 'vs', expectedKey);
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      try {
        console.log('Attempting to load projects from database...');
        console.log('URL:', url);
        console.log('Query params:', req.query);
        
        const { db } = await connectToDatabase();
        
        // Parse query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        
        console.log(`Projects pagination: page=${page}, limit=${limit}, skip=${skip}`);
        
        const projects = await db.collection('projects').find({}).skip(skip).limit(limit).toArray();
        const total = await db.collection('projects').countDocuments({});
        
        console.log(`Found ${projects.length} projects in database (page ${page} of ${Math.ceil(total / limit)})`);
        
        res.status(200).json({
          success: true,
          data: {
            projects: projects,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
          },
          message: 'Projects loaded from database'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Fallback to mock data if database fails
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
          },
          message: 'Projects loaded from mock data (database unavailable)'
        });
      }
      return;
        }

    // 404 handler
    res.status(404).json({
        error: 'Not Found',
      message: `Route ${url} not found`,
      availableEndpoints: {
        health: '/api/v1/health',
        templates: '/api/v1/templates',
        projects: '/api/v1/projects',
        standardsDashboard: '/api/v1/standards/dashboard',
        feedbackSummary: '/api/v1/feedback/summary',
        categoriesActive: '/api/v1/categories/active'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};