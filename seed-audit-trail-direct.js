/**
 * Direct database seeding for audit trail data
 * This script bypasses the API and directly seeds the database
 */

import mongoose from 'mongoose';
import { DocumentAuditTrail } from './src/models/DocumentAuditTrail.model.js';
import ComplianceMetrics from './src/models/ComplianceMetrics.model.js';
import ComplianceIssue from './src/models/ComplianceIssue.model.js';
import { RealTimeMetrics } from './src/models/RealTimeMetrics.model.js';
import { UserSession } from './src/models/UserSession.model.js';
import { Alert } from './src/models/Alert.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent';

async function seedAuditTrailData() {
    try {
        console.log('🌱 Starting direct audit trail data seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Clear existing data
        console.log('🧹 Clearing existing audit trail data...');
        await DocumentAuditTrail.deleteMany({});
        await ComplianceMetrics.deleteMany({});
        await ComplianceIssue.deleteMany({});
        await RealTimeMetrics.deleteMany({});
        await UserSession.deleteMany({});
        await Alert.deleteMany({});
        console.log('✅ Existing data cleared');
        
        // Generate sample audit trail entries
        console.log('📊 Generating sample audit trail entries...');
        const auditEntries = generateAuditTrailEntries();
        await DocumentAuditTrail.insertMany(auditEntries);
        console.log(`✅ Inserted ${auditEntries.length} audit trail entries`);
        
        // Generate compliance metrics
        console.log('📈 Generating compliance metrics...');
        const complianceMetrics = generateComplianceMetrics();
        await ComplianceMetrics.insertMany(complianceMetrics);
        console.log(`✅ Inserted ${complianceMetrics.length} compliance metrics`);
        
        // Generate compliance issues
        console.log('🚨 Generating compliance issues...');
        const complianceIssues = generateComplianceIssues();
        await ComplianceIssue.insertMany(complianceIssues);
        console.log(`✅ Inserted ${complianceIssues.length} compliance issues`);
        
        // Generate user sessions
        console.log('👥 Generating user sessions...');
        const userSessions = generateUserSessions();
        await UserSession.insertMany(userSessions);
        console.log(`✅ Inserted ${userSessions.length} user sessions`);
        
        // Generate real-time metrics
        console.log('📊 Generating real-time metrics...');
        const realTimeMetrics = generateRealTimeMetrics();
        await RealTimeMetrics.insertMany(realTimeMetrics);
        console.log(`✅ Inserted ${realTimeMetrics.length} real-time metrics`);
        
        // Generate alerts
        console.log('⚠️ Generating alerts...');
        const alerts = generateAlerts();
        await Alert.insertMany(alerts);
        console.log(`✅ Inserted ${alerts.length} alerts`);
        
        console.log('\n🎉 Audit trail data seeding completed successfully!');
        
        // Display summary
        const summary = {
            auditTrailEntries: await DocumentAuditTrail.countDocuments(),
            complianceMetrics: await ComplianceMetrics.countDocuments(),
            complianceIssues: await ComplianceIssue.countDocuments(),
            userSessions: await UserSession.countDocuments(),
            realTimeMetrics: await RealTimeMetrics.countDocuments(),
            alerts: await Alert.countDocuments()
        };
        
        console.log('\n📊 Database Summary:');
        console.log(`   📄 Audit Trail Entries: ${summary.auditTrailEntries}`);
        console.log(`   📈 Compliance Metrics: ${summary.complianceMetrics}`);
        console.log(`   🚨 Compliance Issues: ${summary.complianceIssues}`);
        console.log(`   👥 User Sessions: ${summary.userSessions}`);
        console.log(`   📊 Real-time Metrics: ${summary.realTimeMetrics}`);
        console.log(`   ⚠️ Alerts: ${summary.alerts}`);
        
    } catch (error) {
        console.error('❌ Error seeding audit trail data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

function generateAuditTrailEntries() {
    const entries = [];
    const actions = ['created', 'updated', 'deleted', 'viewed', 'generated', 'validated'];
    const documentTypes = ['requirements', 'specification', 'business-case', 'test-plan', 'user-story'];
    const users = [
        { id: 'user-001', name: 'John Doe', email: 'john@example.com', role: 'analyst' },
        { id: 'user-002', name: 'Jane Smith', email: 'jane@example.com', role: 'developer' },
        { id: 'user-003', name: 'Mike Johnson', email: 'mike@example.com', role: 'manager' },
        { id: 'user-004', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'tester' }
    ];
    const projects = [
        { id: 'project-001', name: 'E-commerce Platform' },
        { id: 'project-002', name: 'Mobile Banking App' },
        { id: 'project-003', name: 'IoT Dashboard' },
        { id: 'project-004', name: 'AI Chatbot System' }
    ];
    
    for (let i = 0; i < 50; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const project = projects[Math.floor(Math.random() * projects.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
        
        const entry = {
            documentId: `doc-${String(i + 1).padStart(3, '0')}`,
            documentName: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document ${i + 1}`,
            documentType: documentType,
            projectId: project.id,
            projectName: project.name,
            action: action,
            actionDescription: `Document ${action} by ${user.name}`,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            userEmail: user.email,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            category: ['document', 'user', 'system', 'quality'][Math.floor(Math.random() * 4)],
            notes: `Sample audit entry ${i + 1} for testing purposes`,
            tags: ['sample', 'test', documentType, action],
            contextData: {
                testData: true,
                source: 'seed-script',
                qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
                generationTime: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
                aiProvider: ['google-ai', 'azure-openai', 'ollama'][Math.floor(Math.random() * 3)]
            }
        };
        
        entries.push(entry);
    }
    
    return entries;
}

function generateComplianceMetrics() {
    const metrics = [];
    const standards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO-27001', 'ISO-9001'];
    const projects = ['project-001', 'project-002', 'project-003', 'project-004'];
    
    for (let i = 0; i < 20; i++) {
        const standard = standards[Math.floor(Math.random() * standards.length)];
        const projectId = projects[Math.floor(Math.random() * projects.length)];
        
        const metric = {
            projectId: projectId,
            standardType: standard,
            score: Math.floor(Math.random() * 30) + 70, // 70-100
            calculatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            trends: {
                previousScore: Math.floor(Math.random() * 30) + 70,
                changePercentage: (Math.random() - 0.5) * 20, // -10% to +10%
                trendDirection: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
            },
            details: {
                totalRequirements: Math.floor(Math.random() * 100) + 50,
                compliantRequirements: Math.floor(Math.random() * 80) + 20,
                nonCompliantRequirements: Math.floor(Math.random() * 20) + 5
            }
        };
        
        metrics.push(metric);
    }
    
    return metrics;
}

function generateComplianceIssues() {
    const issues = [];
    const severities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'in-progress', 'resolved', 'closed'];
    const standards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO-27001'];
    
    for (let i = 0; i < 15; i++) {
        const issue = {
            projectId: `project-${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
            standardType: standards[Math.floor(Math.random() * standards.length)],
            issueType: ['requirement', 'process', 'documentation', 'validation'][Math.floor(Math.random() * 4)],
            title: `Compliance Issue ${i + 1}`,
            description: `This is a sample compliance issue for testing purposes. Issue ${i + 1} relates to ${standards[Math.floor(Math.random() * standards.length)]} compliance.`,
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            discoveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            assignedTo: `user-${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
            dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Next 14 days
            tags: ['compliance', 'issue', 'sample'],
            contextData: {
                testData: true,
                source: 'seed-script',
                impactLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                remediationEffort: Math.floor(Math.random() * 5) + 1 // 1-5 days
            }
        };
        
        issues.push(issue);
    }
    
    return issues;
}

function generateUserSessions() {
    const sessions = [];
    const users = ['user-001', 'user-002', 'user-003', 'user-004'];
    
    for (let i = 0; i < 25; i++) {
        const userId = users[Math.floor(Math.random() * users.length)];
        const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const duration = Math.floor(Math.random() * 4 * 60 * 60 * 1000); // Up to 4 hours
        
        const session = {
            userId: userId,
            sessionId: `session-${String(i + 1).padStart(3, '0')}`,
            startTime: startTime,
            endTime: new Date(startTime.getTime() + duration),
            duration: duration,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            activities: [
                {
                    type: 'page_view',
                    component: 'dashboard',
                    duration: Math.floor(Math.random() * 300000), // Up to 5 minutes
                    metadata: { page: 'dashboard', timestamp: startTime }
                },
                {
                    type: 'document_created',
                    component: 'document-editor',
                    duration: Math.floor(Math.random() * 600000), // Up to 10 minutes
                    metadata: { documentType: 'requirements', timestamp: new Date(startTime.getTime() + 300000) }
                }
            ],
            contextData: {
                testData: true,
                source: 'seed-script',
                browserType: 'Chrome',
                deviceType: 'Desktop'
            }
        };
        
        sessions.push(session);
    }
    
    return sessions;
}

function generateRealTimeMetrics() {
    const metrics = [];
    
    for (let i = 0; i < 30; i++) {
        const metric = {
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
            activeUsers: Math.floor(Math.random() * 50) + 10,
            activeSessions: Math.floor(Math.random() * 30) + 5,
            documentsGenerated: Math.floor(Math.random() * 20) + 1,
            apiRequests: Math.floor(Math.random() * 1000) + 100,
            averageResponseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
            errorRate: Math.random() * 0.05, // 0-5%
            contextData: {
                testData: true,
                source: 'seed-script',
                serverLoad: Math.random() * 100,
                memoryUsage: Math.random() * 80 + 20 // 20-100%
            }
        };
        
        metrics.push(metric);
    }
    
    return metrics;
}

function generateAlerts() {
    const alerts = [];
    const severities = ['low', 'medium', 'high', 'critical'];
    const types = ['system', 'compliance', 'quality', 'performance'];
    const statuses = ['active', 'acknowledged', 'resolved'];
    
    for (let i = 0; i < 10; i++) {
        const alert = {
            title: `Alert ${i + 1}`,
            message: `This is a sample alert for testing purposes. Alert ${i + 1} is related to system monitoring.`,
            type: types[Math.floor(Math.random() * types.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            projectId: `project-${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
            userId: `user-${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            acknowledgedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
            resolvedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) : null,
            tags: ['alert', 'sample', 'test'],
            contextData: {
                testData: true,
                source: 'seed-script',
                alertSource: 'monitoring-system',
                threshold: Math.floor(Math.random() * 100) + 50
            }
        };
        
        alerts.push(alert);
    }
    
    return alerts;
}

// Run the seeding
seedAuditTrailData();
