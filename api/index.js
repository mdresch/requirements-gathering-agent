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
          projects: '/api/v1/projects'
        }
      });
      return;
    }

    // Templates endpoint
    if (method === 'GET' && url === '/api/v1/templates') {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('API Key received:', apiKey);
      console.log('Expected API Key:', expectedKey);
      
      // Check if API key matches (allow both dev key and Vercel env key)
      if (apiKey && apiKey !== expectedKey && apiKey !== 'dev-api-key-123') {
        console.log('API key mismatch:', apiKey, 'vs', expectedKey);
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      try {
        console.log('Attempting to load templates from database...');
        const { db } = await connectToDatabase();
        console.log('Database connected, querying templates collection...');
        
        const templates = await db.collection('templates').find({}).toArray();
        console.log(`Found ${templates.length} templates in database`);
        
        res.status(200).json({
          success: true,
          data: {
            templates: templates,
            total: templates.length,
            page: 1,
            limit: 20,
            totalPages: 1
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

    // Projects endpoint
    if (method === 'GET' && url === '/api/v1/projects') {
      const apiKey = req.headers['x-api-key'];
      const expectedKey = process.env.API_KEY || 'dev-api-key-123';
      
      console.log('Projects API Key received:', apiKey);
      console.log('Projects Expected API Key:', expectedKey);
      
      // Check if API key matches (allow both dev key and Vercel env key)
      if (apiKey && apiKey !== expectedKey && apiKey !== 'dev-api-key-123') {
        console.log('Projects API key mismatch:', apiKey, 'vs', expectedKey);
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      try {
        const { db } = await connectToDatabase();
        const projects = await db.collection('projects').find({}).toArray();
        
        res.status(200).json({
          success: true,
          data: {
            projects: projects,
            total: projects.length,
            page: 1,
            limit: 20,
            totalPages: 1
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
        projects: '/api/v1/projects'
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