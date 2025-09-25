#!/usr/bin/env node

/**
 * Atlas Data Seeding Script
 * 
 * This script seeds sample data for empty collections in MongoDB Atlas.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ATLAS_URI = process.env.MONGODB_URI;

console.log('🌱 Starting Atlas Data Seeding...');
console.log('');

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Sample data for seeding
const sampleData = {
  users: [
    {
      _id: 'user_001',
      email: 'admin@requirements-gathering-agent.com',
      username: 'admin',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    },
    {
      _id: 'user_002',
      email: 'project.manager@requirements-gathering-agent.com',
      username: 'pm_user',
      role: 'project_manager',
      firstName: 'Project',
      lastName: 'Manager',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(),
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true
      }
    },
    {
      _id: 'user_003',
      email: 'analyst@requirements-gathering-agent.com',
      username: 'analyst_user',
      role: 'business_analyst',
      firstName: 'Business',
      lastName: 'Analyst',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: false
      }
    }
  ],

  audittrails: [
    {
      _id: 'audit_001',
      entityType: 'template',
      entityId: 'template_001',
      action: 'created',
      userId: 'user_001',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      changes: {
        before: null,
        after: {
          name: 'Business Case Template',
          category: 'project_management'
        }
      },
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    },
    {
      _id: 'audit_002',
      entityType: 'project',
      entityId: 'project_001',
      action: 'updated',
      userId: 'user_002',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      changes: {
        before: {
          status: 'draft'
        },
        after: {
          status: 'in_progress'
        }
      },
      metadata: {
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    },
    {
      _id: 'audit_003',
      entityType: 'document',
      entityId: 'doc_001',
      action: 'generated',
      userId: 'user_003',
      timestamp: new Date('2024-02-01T09:15:00Z'),
      changes: {
        before: null,
        after: {
          type: 'business_case',
          status: 'generated'
        }
      },
      metadata: {
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  ],

  feedback: [
    {
      _id: 'feedback_001',
      projectId: 'project_001',
      documentId: 'doc_001',
      userId: 'user_002',
      type: 'rating',
      rating: 4,
      comment: 'Good business case structure, but could use more detail on risk assessment.',
      category: 'quality',
      createdAt: new Date('2024-01-20T16:45:00Z'),
      isResolved: false,
      metadata: {
        documentType: 'business_case',
        section: 'risk_assessment'
      }
    },
    {
      _id: 'feedback_002',
      projectId: 'project_002',
      documentId: 'doc_002',
      userId: 'user_003',
      type: 'suggestion',
      rating: 5,
      comment: 'Excellent technical requirements document. Very comprehensive and well-structured.',
      category: 'content',
      createdAt: new Date('2024-01-25T11:20:00Z'),
      isResolved: true,
      metadata: {
        documentType: 'technical_requirements',
        section: 'overall'
      }
    },
    {
      _id: 'feedback_003',
      projectId: 'project_001',
      documentId: 'doc_003',
      userId: 'user_001',
      type: 'issue',
      rating: 2,
      comment: 'Missing stakeholder analysis section. This is critical for project success.',
      category: 'completeness',
      createdAt: new Date('2024-02-01T13:30:00Z'),
      isResolved: false,
      metadata: {
        documentType: 'project_charter',
        section: 'stakeholders'
      }
    }
  ],

  contexttracking: [
    {
      _id: 'context_001',
      projectId: 'project_001',
      documentId: 'doc_001',
      userId: 'user_002',
      contextType: 'project_context',
      contextData: {
        projectName: 'ICT Governance Framework',
        framework: 'pmbok',
        description: 'The ICT modern Multi Cloud multitenant hybrid VMWare and Local infrastructure governance and maintenance.',
        stakeholders: ['IT Department', 'Management', 'End Users'],
        timeline: '6 months',
        budget: '$500,000'
      },
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      isActive: true
    },
    {
      _id: 'context_002',
      projectId: 'project_002',
      documentId: 'doc_002',
      userId: 'user_003',
      contextType: 'technical_context',
      contextData: {
        technologyStack: ['Node.js', 'MongoDB', 'React'],
        architecture: 'Microservices',
        deployment: 'Cloud',
        security: 'Enterprise Grade',
        performance: 'High Availability'
      },
      createdAt: new Date('2024-01-20T14:30:00Z'),
      updatedAt: new Date('2024-01-20T14:30:00Z'),
      isActive: true
    },
    {
      _id: 'context_003',
      projectId: 'project_001',
      documentId: 'doc_003',
      userId: 'user_001',
      contextType: 'business_context',
      contextData: {
        businessObjective: 'Improve operational efficiency',
        successMetrics: ['Cost Reduction', 'Time Savings', 'User Satisfaction'],
        constraints: ['Budget', 'Timeline', 'Resources'],
        risks: ['Technical Complexity', 'User Adoption']
      },
      createdAt: new Date('2024-02-01T09:15:00Z'),
      updatedAt: new Date('2024-02-01T09:15:00Z'),
      isActive: true
    }
  ],

  generationjobs: [
    {
      _id: 'job_001',
      projectId: 'project_001',
      userId: 'user_002',
      status: 'completed',
      documentTypes: ['business_case', 'project_charter'],
      progress: 100,
      startedAt: new Date('2024-01-15T10:00:00Z'),
      completedAt: new Date('2024-01-15T10:15:00Z'),
      generatedDocuments: ['doc_001', 'doc_003'],
      errors: [],
      metadata: {
        templateCount: 2,
        totalDocuments: 2,
        processingTime: 900 // 15 minutes in seconds
      }
    },
    {
      _id: 'job_002',
      projectId: 'project_002',
      userId: 'user_003',
      status: 'in_progress',
      documentTypes: ['technical_requirements', 'system_architecture'],
      progress: 75,
      startedAt: new Date('2024-01-20T14:30:00Z'),
      completedAt: null,
      generatedDocuments: ['doc_002'],
      errors: [],
      metadata: {
        templateCount: 2,
        totalDocuments: 2,
        processingTime: 1800 // 30 minutes in seconds
      }
    },
    {
      _id: 'job_003',
      projectId: 'project_003',
      userId: 'user_001',
      status: 'failed',
      documentTypes: ['user_stories', 'test_plan'],
      progress: 25,
      startedAt: new Date('2024-02-01T09:15:00Z'),
      completedAt: null,
      generatedDocuments: [],
      errors: ['Template not found: user_stories', 'Insufficient context data'],
      metadata: {
        templateCount: 2,
        totalDocuments: 0,
        processingTime: 300 // 5 minutes in seconds
      }
    }
  ],

  qualityassessments: [
    {
      _id: 'qa_001',
      documentId: 'doc_001',
      assessorId: 'user_001',
      assessmentType: 'automated',
      overallScore: 85,
      criteria: {
        completeness: 90,
        clarity: 80,
        accuracy: 85,
        structure: 90
      },
      recommendations: [
        'Add more detail to risk assessment section',
        'Include stakeholder contact information',
        'Clarify project timeline milestones'
      ],
      assessedAt: new Date('2024-01-20T16:00:00Z'),
      status: 'completed',
      metadata: {
        documentType: 'business_case',
        assessmentVersion: '1.0'
      }
    },
    {
      _id: 'qa_002',
      documentId: 'doc_002',
      assessorId: 'user_002',
      assessmentType: 'manual',
      overallScore: 92,
      criteria: {
        completeness: 95,
        clarity: 90,
        accuracy: 90,
        structure: 95
      },
      recommendations: [
        'Excellent technical detail',
        'Well-structured document',
        'Consider adding more examples'
      ],
      assessedAt: new Date('2024-01-25T11:30:00Z'),
      status: 'completed',
      metadata: {
        documentType: 'technical_requirements',
        assessmentVersion: '1.0'
      }
    },
    {
      _id: 'qa_003',
      documentId: 'doc_003',
      assessorId: 'user_003',
      assessmentType: 'automated',
      overallScore: 65,
      criteria: {
        completeness: 60,
        clarity: 70,
        accuracy: 65,
        structure: 70
      },
      recommendations: [
        'Missing stakeholder analysis',
        'Incomplete project scope',
        'Add risk mitigation strategies'
      ],
      assessedAt: new Date('2024-02-01T13:45:00Z'),
      status: 'in_progress',
      metadata: {
        documentType: 'project_charter',
        assessmentVersion: '1.0'
      }
    }
  ],

  compliancereports: [
    {
      _id: 'compliance_001',
      documentId: 'doc_001',
      reportType: 'pmbok_compliance',
      complianceScore: 88,
      standards: ['PMBOK 7th Edition', 'ISO 21500'],
      findings: [
        {
          standard: 'PMBOK 7th Edition',
          requirement: 'Project Charter',
          status: 'compliant',
          score: 90
        },
        {
          standard: 'ISO 21500',
          requirement: 'Project Planning',
          status: 'partially_compliant',
          score: 85
        }
      ],
      recommendations: [
        'Enhance risk management section',
        'Add quality management plan',
        'Include communication plan'
      ],
      generatedAt: new Date('2024-01-20T17:00:00Z'),
      status: 'completed',
      metadata: {
        documentType: 'business_case',
        reportVersion: '1.0'
      }
    },
    {
      _id: 'compliance_002',
      documentId: 'doc_002',
      reportType: 'technical_compliance',
      complianceScore: 95,
      standards: ['IEEE 830', 'ISO/IEC 25010'],
      findings: [
        {
          standard: 'IEEE 830',
          requirement: 'Software Requirements Specification',
          status: 'compliant',
          score: 95
        },
        {
          standard: 'ISO/IEC 25010',
          requirement: 'Quality Characteristics',
          status: 'compliant',
          score: 95
        }
      ],
      recommendations: [
        'Excellent technical documentation',
        'Well-defined requirements',
        'Consider adding performance metrics'
      ],
      generatedAt: new Date('2024-01-25T12:00:00Z'),
      status: 'completed',
      metadata: {
        documentType: 'technical_requirements',
        reportVersion: '1.0'
      }
    },
    {
      _id: 'compliance_003',
      documentId: 'doc_003',
      reportType: 'project_compliance',
      complianceScore: 70,
      standards: ['PMBOK 7th Edition', 'PRINCE2'],
      findings: [
        {
          standard: 'PMBOK 7th Edition',
          requirement: 'Stakeholder Management',
          status: 'non_compliant',
          score: 60
        },
        {
          standard: 'PRINCE2',
          requirement: 'Project Initiation',
          status: 'partially_compliant',
          score: 80
        }
      ],
      recommendations: [
        'Add comprehensive stakeholder analysis',
        'Include project governance structure',
        'Define clear project roles and responsibilities'
      ],
      generatedAt: new Date('2024-02-01T14:00:00Z'),
      status: 'in_progress',
      metadata: {
        documentType: 'project_charter',
        reportVersion: '1.0'
      }
    }
  ]
};

class AtlasSeeder {
  constructor() {
    this.client = null;
    this.db = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async connect() {
    try {
      this.client = new MongoClient(ATLAS_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      });
      
      await this.client.connect();
      this.db = this.client.db('requirements-gathering-agent');
      this.log('Connected to Atlas successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async seedCollection(collectionName, documents) {
    try {
      const collection = this.db.collection(collectionName);
      
      // Check if collection already has data
      const existingCount = await collection.countDocuments();
      if (existingCount > 0) {
        this.log(`${collectionName}: ${existingCount} documents already exist, skipping`, 'warning');
        return;
      }

      // Insert sample data
      const result = await collection.insertMany(documents);
      this.log(`${collectionName}: Inserted ${result.insertedCount} documents`, 'success');
      
      return result.insertedCount;
    } catch (error) {
      this.log(`Failed to seed ${collectionName}: ${error.message}`, 'error');
      return 0;
    }
  }

  async verifySeeding() {
    this.log('Verifying seeded data...');
    
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      try {
        const collection = this.db.collection(collectionName);
        const count = await collection.countDocuments();
        this.log(`📊 ${collectionName}: ${count} documents`, 'info');
      } catch (error) {
        this.log(`❌ Could not verify ${collectionName}: ${error.message}`, 'error');
      }
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.log('Connection closed', 'info');
    }
  }

  async run() {
    try {
      this.log('Starting Atlas data seeding...');
      
      const connected = await this.connect();
      if (!connected) {
        return;
      }

      let totalSeeded = 0;
      
      // Seed each collection
      for (const [collectionName, documents] of Object.entries(sampleData)) {
        const seeded = await this.seedCollection(collectionName, documents);
        totalSeeded += seeded;
      }

      // Verify seeding
      await this.verifySeeding();

      this.log(`Data seeding completed! Seeded ${totalSeeded} documents across ${Object.keys(sampleData).length} collections`, 'success');
      
      console.log('');
      this.log('Sample data includes:', 'info');
      console.log('👥 Users: Admin, Project Manager, Business Analyst');
      console.log('📋 Audit Trails: Template creation, project updates, document generation');
      console.log('💬 Feedback: Ratings, suggestions, and issues for documents');
      console.log('🎯 Context Tracking: Project, technical, and business context');
      console.log('⚙️ Generation Jobs: Document generation workflows');
      console.log('📊 Quality Assessments: Automated and manual quality reviews');
      console.log('📋 Compliance Reports: PMBOK, IEEE, ISO compliance checks');

    } catch (error) {
      this.log(`Seeding failed: ${error.message}`, 'error');
    } finally {
      await this.close();
    }
  }
}

// Run seeding
const seeder = new AtlasSeeder();
seeder.run().catch(console.error);
