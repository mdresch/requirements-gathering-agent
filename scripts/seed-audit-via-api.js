// Seed audit trail data via API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002';
const AUDIT_TRAIL_API_URL = 'http://localhost:3004';

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
  for (let i = 0; i < 100; i++) {
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

const generateComplianceEvents = () => {
  const events = [];
  const projects = ['project_001', 'project_002', 'project_003', 'project_004', 'project_005'];
  const users = [
    { id: 'user_001', name: 'John Doe' },
    { id: 'user_002', name: 'Sarah Wilson' },
    { id: 'user_003', name: 'Mike Johnson' },
    { id: 'user_004', name: 'Lisa Chen' },
    { id: 'user_005', name: 'David Brown' }
  ];
  
  const standards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'];
  const documents = ['Requirements Specification v2.1', 'Technical Architecture Document', 'API Documentation v1.0'];
  
  for (let i = 0; i < 50; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const standard = standards[Math.floor(Math.random() * standards.length)];
    const document = documents[Math.floor(Math.random() * documents.length)];
    
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const timestamp = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
    
    // Generate different types of compliance events
    const eventTypes = ['SCORE_CHANGE', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'WORKFLOW_STARTED', 'STANDARD_ASSESSMENT'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    let eventData = {
      projectId: project,
      documentId: `doc_${String(i + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      standardType: standard,
      timestamp: timestamp,
      contextData: {
        sessionId: `session_${String(i + 1).padStart(3, '0')}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        component: 'compliance_dashboard',
        action: eventType.toLowerCase(),
        duration: Math.floor(Math.random() * 5000) + 1000
      }
    };
    
    if (eventType === 'SCORE_CHANGE') {
      eventData.previousScore = Math.floor(Math.random() * 20) + 70;
      eventData.newScore = Math.floor(Math.random() * 20) + 70;
    } else if (eventType === 'ISSUE_CREATED') {
      eventData.issueId = `issue_${String(i + 1).padStart(3, '0')}`;
      eventData.issueTitle = 'Compliance issue detected';
      eventData.issueSeverity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
    } else if (eventType === 'WORKFLOW_STARTED') {
      eventData.workflowId = `workflow_${String(i + 1).padStart(3, '0')}`;
      eventData.workflowName = 'Compliance Review Process';
      eventData.workflowStatus = 'IN_PROGRESS';
    } else if (eventType === 'STANDARD_ASSESSMENT') {
      eventData.assessmentType = ['AUTOMATED', 'MANUAL', 'REVIEW'][Math.floor(Math.random() * 3)];
      eventData.complianceLevel = ['FULL', 'PARTIAL', 'NON_COMPLIANT'][Math.floor(Math.random() * 3)];
      eventData.score = Math.floor(Math.random() * 20) + 70;
    }
    
    events.push(eventData);
  }
  
  return events;
};

async function seedViaAPI() {
  try {
    console.log('🌱 Starting API-based seeding...');
    
    // Test API connectivity
    console.log('🔍 Testing API connectivity...');
    
    // Test main API server
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/api/v1/health`);
      if (healthResponse.ok) {
        console.log('✅ Main API server is running');
      } else {
        console.log('⚠️ Main API server not responding');
      }
    } catch (error) {
      console.log('⚠️ Main API server not accessible:', error.message);
    }
    
    // Test audit trail server
    try {
      const auditHealthResponse = await fetch(`${AUDIT_TRAIL_API_URL}/api/v1/audit-trail/simple-enhanced/analytics`);
      if (auditHealthResponse.ok) {
        console.log('✅ Audit trail server is running');
      } else {
        console.log('⚠️ Audit trail server not responding');
      }
    } catch (error) {
      console.log('⚠️ Audit trail server not accessible:', error.message);
    }
    
    // Generate sample data
    console.log('📊 Generating sample audit trail data...');
    const auditEntries = generateAuditTrailEntries();
    const complianceEvents = generateComplianceEvents();
    
    console.log(`✅ Generated ${auditEntries.length} audit trail entries`);
    console.log(`✅ Generated ${complianceEvents.length} compliance events`);
    
    // Try to add compliance events via API
    console.log('📝 Adding compliance events via API...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of complianceEvents.slice(0, 10)) { // Limit to 10 for testing
      try {
        let endpoint = '';
        let body = {};
        
        if (event.previousScore !== undefined) {
          // Score change event
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-score-change`;
          body = {
            projectId: event.projectId,
            documentId: event.documentId,
            userId: event.userId,
            userName: event.userName,
            standardType: event.standardType,
            previousScore: event.previousScore,
            newScore: event.newScore,
            contextData: event.contextData
          };
        } else if (event.issueId !== undefined) {
          // Issue created event
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-issue-created`;
          body = {
            projectId: event.projectId,
            documentId: event.documentId,
            userId: event.userId,
            userName: event.userName,
            issueId: event.issueId,
            issueTitle: event.issueTitle,
            issueSeverity: event.issueSeverity,
            standardType: event.standardType,
            contextData: event.contextData
          };
        } else if (event.workflowId !== undefined) {
          // Workflow event
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-workflow-event`;
          body = {
            eventType: 'WORKFLOW_STARTED',
            projectId: event.projectId,
            documentId: event.documentId,
            userId: event.userId,
            userName: event.userName,
            workflowId: event.workflowId,
            workflowName: event.workflowName,
            workflowStatus: event.workflowStatus,
            standardType: event.standardType,
            contextData: event.contextData
          };
        } else if (event.assessmentType !== undefined) {
          // Assessment event
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-assessment`;
          body = {
            projectId: event.projectId,
            documentId: event.documentId,
            userId: event.userId,
            userName: event.userName,
            standardType: event.standardType,
            assessmentType: event.assessmentType,
            complianceLevel: event.complianceLevel,
            score: event.score,
            contextData: event.contextData
          };
        }
        
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
          });
          
          if (response.ok) {
            successCount++;
            console.log(`✅ Added ${event.standardType} event`);
          } else {
            errorCount++;
            console.log(`❌ Failed to add event: ${response.status}`);
          }
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ Error adding event: ${error.message}`);
      }
    }
    
    console.log(`\n📊 API Seeding Results:`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    
    // Test data retrieval
    console.log('\n🔍 Testing data retrieval...');
    
    try {
      const analyticsResponse = await fetch(`${AUDIT_TRAIL_API_URL}/api/v1/audit-trail/simple-enhanced/analytics`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        console.log('✅ Analytics data retrieved successfully');
        console.log(`   Total entries: ${analyticsData.data?.totalEntries || 0}`);
        console.log(`   Categories: ${Object.keys(analyticsData.data?.entriesByCategory || {}).length}`);
        console.log(`   Severities: ${Object.keys(analyticsData.data?.entriesBySeverity || {}).length}`);
      } else {
        console.log('❌ Failed to retrieve analytics data');
      }
    } catch (error) {
      console.log('❌ Error retrieving analytics data:', error.message);
    }
    
    console.log('\n🎉 API-based seeding completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Check the audit-trail page in the web interface');
    console.log('   2. Switch between "Audit Trail" and "Activity Reports" tabs');
    console.log('   3. Verify data is displaying correctly in both views');
    
  } catch (error) {
    console.error('❌ Error in API-based seeding:', error);
  }
}

// Run the seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedViaAPI();
}

export { seedViaAPI };
