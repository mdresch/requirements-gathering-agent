// Project Data Seeding Script
// filepath: src/scripts/seedProjects.ts

import { dbConnection } from '../config/database.js';
import { Project } from '../models/Project.js';
import { logger } from '../utils/logger.js';

const sampleProjects = [
  {
    name: 'Financial Services Digital Transformation',
    description: 'Comprehensive requirements gathering for digital banking platform',
    status: 'active',
    framework: 'babok',
    documents: 12,
    stakeholders: 8,
    owner: 'Sarah Johnson',
    priority: 'high',
    tags: ['banking', 'digital-transformation', 'fintech'],
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-06-30'),
    budget: 500000,
    currency: 'USD'
  },
  {
    name: 'Healthcare Management System',
    description: 'HIPAA-compliant patient management system requirements',
    status: 'review',
    framework: 'pmbok',
    documents: 9,
    stakeholders: 12,
    owner: 'Dr. Michael Chen',
    priority: 'critical',
    tags: ['healthcare', 'hipaa', 'patient-management'],
    startDate: new Date('2025-01-08'),
    endDate: new Date('2025-08-15'),
    budget: 750000,
    currency: 'USD'
  },
  {
    name: 'E-commerce Platform Redesign',
    description: 'Modern e-commerce platform with AI-powered recommendations',
    status: 'completed',
    framework: 'multi',
    documents: 18,
    stakeholders: 15,
    owner: 'Alex Rodriguez',
    priority: 'medium',
    tags: ['e-commerce', 'ai', 'recommendations', 'retail'],
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-01-05'),
    budget: 300000,
    currency: 'USD'
  },
  {
    name: 'Supply Chain Optimization',
    description: 'Enterprise supply chain management system with real-time tracking',
    status: 'draft',
    framework: 'babok',
    documents: 5,
    stakeholders: 6,
    owner: 'Jennifer Liu',
    priority: 'medium',
    tags: ['supply-chain', 'logistics', 'tracking'],
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-09-30'),
    budget: 400000,
    currency: 'USD'
  },
  {
    name: 'Customer Service Portal',
    description: 'Self-service customer portal with AI chatbot integration',
    status: 'active',
    framework: 'pmbok',
    documents: 8,
    stakeholders: 10,
    owner: 'David Thompson',
    priority: 'high',
    tags: ['customer-service', 'portal', 'chatbot', 'ai'],
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-30'),
    budget: 250000,
    currency: 'USD'
  }
];

export async function seedProjects(): Promise<void> {
  try {
    logger.info('🌱 Starting project data seeding...');
    
    // Connect to database
    await dbConnection.connect();
    
    // Clear existing projects (optional - remove this line if you want to keep existing data)
    const existingCount = await Project.countDocuments();
    if (existingCount > 0) {
      logger.info(`📊 Found ${existingCount} existing projects. Skipping seed to avoid duplicates.`);
      logger.info('💡 To force re-seed, delete existing projects first.');
      return;
    }
    
    // Insert sample projects
    const createdProjects = await Project.insertMany(sampleProjects);
    
    logger.info(`✅ Successfully seeded ${createdProjects.length} projects:`);
    createdProjects.forEach(project => {
      logger.info(`   📋 ${project.name} (${project.status}) - ${project.framework}`);
    });
    
    // Display statistics
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          averageComplianceScore: { $avg: '$complianceScore' },
          totalDocuments: { $sum: '$documents' },
          totalStakeholders: { $sum: '$stakeholders' }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const stat = stats[0];
      logger.info('📊 Database Statistics:');
      logger.info(`   📋 Total Projects: ${stat.totalProjects}`);
      logger.info(`   📈 Average Compliance Score: ${stat.averageComplianceScore.toFixed(2)}%`);
      logger.info(`   📄 Total Documents: ${stat.totalDocuments}`);
      logger.info(`   👥 Total Stakeholders: ${stat.totalStakeholders}`);
    }
    
  } catch (error) {
    logger.error('❌ Error seeding projects:', error);
    throw error;
  }
}

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProjects()
    .then(() => {
      logger.info('🎉 Project seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Project seeding failed:', error);
      process.exit(1);
    });
}

