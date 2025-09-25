// Simple seed script for audit trail data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import models
import DocumentAuditTrail from '../dist/models/DocumentAuditTrail.model.js';
import ComplianceMetrics from '../dist/models/ComplianceMetrics.model.js';
import ComplianceIssue from '../dist/models/ComplianceIssue.model.js';
import UserSession from '../dist/models/UserSession.model.js';
import RealTimeMetrics from '../dist/models/RealTimeMetrics.model.js';

// Sample data generators
const generateAuditTrailEntries = () => {
  const entries = [];
  const actions = ['create', 'edit', 'view', 'download', 'upload', 'delete', 'copy', 'move'];
  const users = [
    { id: 'user_001', name: 'John Doe', email: 'john.doe@company.com', role: 'Business Analyst' },
    { id: 'user_002', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Technical Architect' },
    { id: 'user_003', name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Project Manager' },
    { id: 'user_004', name: 'Lisa Chen', email: 'lisa.chen@company.com', role: 'Quality Assurance' },
    { id: 'user_005', name: 'David Brown', email: 'david.brown@company.com', role: 'Developer' }
  ];
  
  const projects = [
    { id: 'project_001', name: 'Customer Portal Enhancement' },
    { id: 'project_002', name: 'Mobile App Development' },
    { id: 'project_003', name: 'API Integration Project' },
    { id: 'project_004', name: 'Data Migration Initiative' },
    { id: 'project_005', name: 'Security Audit Project' }
  ];
  
  const documents = [
    'Requirements Specification v2.1',
    'Technical Architecture Document',
    'API Documentation v1.0',
    'User Interface Design',
    'Database Schema Design',
    'Security Assessment Report',
    'Performance Test Results',
    'Project Charter',
    'Risk Assessment Matrix',
    'Quality Assurance Plan'
  ];
  
  const severities = ['low', 'medium', 'high', 'critical'];
  const categories = ['user', 'system', 'quality', 'document', 'ai', 'compliance'];
  
  // Generate entries for the last 30 days
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const document = documents[Math.floor(Math.random() * documents.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Random date within last 30 days
    const randomDays = Math.floor(Math.random() * 30);
    const timestamp = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
    
    // Add some compliance-specific events
    const isComplianceEvent = Math.random() < 0.3; // 30% chance
    let contextData = {
      aiProvider: 'openai',
      aiModel: 'gpt-4',
      tokensUsed: Math.floor(Math.random() * 1000) + 100,
      qualityScore: Math.floor(Math.random() * 20) + 80,
      generationTime: Math.floor(Math.random() * 5000) + 1000,
      templateUsed: 'business_requirements',
      framework: 'babok',
      dependencies: ['stakeholder_analysis', 'risk_assessment'],
      optimizationStrategy: 'automated'
    };
    
    if (isComplianceEvent) {
      const complianceEventTypes = ['SCORE_CHANGE', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'WORKFLOW_STARTED', 'STANDARD_ASSESSMENT'];
      const standardTypes = ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'];
      
      contextData.complianceEvent = true;
      contextData.eventType = complianceEventTypes[Math.floor(Math.random() * complianceEventTypes.length)];
      contextData.standardType = standardTypes[Math.floor(Math.random() * standardTypes.length)];
      
      if (contextData.eventType === 'SCORE_CHANGE') {
        contextData.previousScore = Math.floor(Math.random() * 20) + 70;
        contextData.newScore = Math.floor(Math.random() * 20) + 70;
        contextData.scoreChange = contextData.newScore - contextData.previousScore;
        contextData.changePercentage = ((contextData.scoreChange / contextData.previousScore) * 100).toFixed(1);
      }
    }
    
    entries.push({
      documentId: `doc_${String(i + 1).padStart(3, '0')}`,
      documentName: document,
      documentType: 'requirements_document',
      projectId: project.id,
      projectName: project.name,
      action: action,
      actionDescription: `${action.charAt(0).toUpperCase() + action.slice(1)}d ${document}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      timestamp: timestamp,
      severity: severity,
      category: category,
      notes: `Activity performed on ${document} in ${project.name}`,
      tags: [action, category, project.name.toLowerCase().replace(/\s+/g, '_')],
      contextData: contextData
    });
  }
  
  return entries;
};

const generateComplianceMetrics = () => {
  const metrics = [];
  const projects = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
  const standards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'];
  
  for (const projectId of projects) {
    for (const standard of standards) {
      const now = new Date();
      const randomDays = Math.floor(Math.random() * 7);
      const timestamp = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
      
      metrics.push({
        projectId: projectId,
        standardType: standard,
        overallScore: Math.floor(Math.random() * 20) + 75,
        individualScores: {
          babok: Math.floor(Math.random() * 20) + 70,
          pmbok: Math.floor(Math.random() * 20) + 70,
          dmbok: Math.floor(Math.random() * 20) + 70,
          iso: Math.floor(Math.random() * 20) + 70
        },
        lastUpdated: timestamp,
        trends: {
          weekly: Math.random() > 0.5 ? 1 : -1,
          monthly: Math.random() > 0.5 ? 1 : -1
        },
        issues: Math.floor(Math.random() * 10),
        recommendations: Math.floor(Math.random() * 5) + 1
      });
    }
  }
  
  return metrics;
};

const generateComplianceIssues = () => {
  const issues = [];
  const projects = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
  const standards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  
  const issueTitles = [
    'Missing stakeholder analysis',
    'Incomplete risk assessment',
    'Insufficient documentation',
    'Non-compliance with data privacy',
    'Missing security controls',
    'Inadequate testing coverage',
    'Outdated requirements',
    'Missing approval workflow'
  ];
  
  for (let i = 0; i < 30; i++) {
    const projectId = projects[Math.floor(Math.random() * projects.length)];
    const standard = standards[Math.floor(Math.random() * standards.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = issueTitles[Math.floor(Math.random() * issueTitles.length)];
    
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
    
    issues.push({
      projectId: projectId,
      standardType: standard,
      title: title,
      description: `Compliance issue identified in ${standard} standard: ${title}`,
      severity: severity,
      status: status,
      assignedTo: `user_00${Math.floor(Math.random() * 5) + 1}`,
      createdAt: createdAt,
      updatedAt: createdAt,
      dueDate: new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000)),
      resolutionNotes: status === 'resolved' ? 'Issue has been addressed and verified' : null
    });
  }
  
  return issues;
};

const generateUserSessions = () => {
  const sessions = [];
  const users = [
    { id: 'user_001', name: 'John Doe', email: 'john.doe@company.com' },
    { id: 'user_002', name: 'Sarah Wilson', email: 'sarah.wilson@company.com' },
    { id: 'user_003', name: 'Mike Johnson', email: 'mike.johnson@company.com' },
    { id: 'user_004', name: 'Lisa Chen', email: 'lisa.chen@company.com' },
    { id: 'user_005', name: 'David Brown', email: 'david.brown@company.com' }
  ];
  
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 14);
    const startTime = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
    const duration = Math.floor(Math.random() * 4 * 60 * 60 * 1000) + (30 * 60 * 1000); // 30 minutes to 4 hours
    const endTime = new Date(startTime.getTime() + duration);
    
    sessions.push({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      sessionId: `session_${String(i + 1).padStart(3, '0')}`,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      activities: [
        {
          type: 'login',
          component: 'auth',
          timestamp: startTime,
          duration: 5000,
          metadata: { method: 'password' }
        },
        {
          type: 'page_view',
          component: 'dashboard',
          timestamp: new Date(startTime.getTime() + 10000),
          duration: 30000,
          metadata: { page: 'dashboard' }
        }
      ]
    });
  }
  
  return sessions;
};

const generateRealTimeMetrics = () => {
  const metrics = [];
  const now = new Date();
  
  // Generate hourly metrics for the last 3 days
  for (let i = 0; i < 72; i++) { // 3 days * 24 hours
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    
    metrics.push({
      timestamp: timestamp,
      activeUsers: Math.floor(Math.random() * 20) + 5,
      documentsGenerated: Math.floor(Math.random() * 10) + 1,
      apiRequests: Math.floor(Math.random() * 100) + 50,
      averageResponseTime: Math.floor(Math.random() * 500) + 200,
      errorRate: Math.random() * 2,
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 80 + 20,
      cpuUsage: Math.random() * 60 + 20
    });
  }
  
  return metrics;
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adpa-enterprise');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await DocumentAuditTrail.deleteMany({});
    await ComplianceMetrics.deleteMany({});
    await ComplianceIssue.deleteMany({});
    await UserSession.deleteMany({});
    await RealTimeMetrics.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Generate and insert data
    console.log('📊 Generating audit trail entries...');
    const auditEntries = generateAuditTrailEntries();
    await DocumentAuditTrail.insertMany(auditEntries);
    console.log(`✅ Inserted ${auditEntries.length} audit trail entries`);
    
    console.log('📈 Generating compliance metrics...');
    const complianceMetrics = generateComplianceMetrics();
    await ComplianceMetrics.insertMany(complianceMetrics);
    console.log(`✅ Inserted ${complianceMetrics.length} compliance metrics`);
    
    console.log('🚨 Generating compliance issues...');
    const complianceIssues = generateComplianceIssues();
    await ComplianceIssue.insertMany(complianceIssues);
    console.log(`✅ Inserted ${complianceIssues.length} compliance issues`);
    
    console.log('👥 Generating user sessions...');
    const userSessions = generateUserSessions();
    await UserSession.insertMany(userSessions);
    console.log(`✅ Inserted ${userSessions.length} user sessions`);
    
    console.log('📊 Generating real-time metrics...');
    const realTimeMetrics = generateRealTimeMetrics();
    await RealTimeMetrics.insertMany(realTimeMetrics);
    console.log(`✅ Inserted ${realTimeMetrics.length} real-time metrics`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const summary = {
      auditTrailEntries: await DocumentAuditTrail.countDocuments(),
      complianceMetrics: await ComplianceMetrics.countDocuments(),
      complianceIssues: await ComplianceIssue.countDocuments(),
      userSessions: await UserSession.countDocuments(),
      realTimeMetrics: await RealTimeMetrics.countDocuments()
    };
    
    console.log('\n📋 Database Summary:');
    console.log(`   Audit Trail Entries: ${summary.auditTrailEntries}`);
    console.log(`   Compliance Metrics: ${summary.complianceMetrics}`);
    console.log(`   Compliance Issues: ${summary.complianceIssues}`);
    console.log(`   User Sessions: ${summary.userSessions}`);
    console.log(`   Real-time Metrics: ${summary.realTimeMetrics}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
