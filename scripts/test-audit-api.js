// Test audit trail API endpoints and add sample data
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002';
const AUDIT_TRAIL_API_URL = 'http://localhost:3004';

async function testAPIs() {
  console.log('🔍 Testing Audit Trail APIs...\n');
  
  // Test 1: Check if main API server is running
  console.log('1. Testing main API server...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Main API server is running');
      console.log(`   Status: ${data.status}`);
    } else {
      console.log('❌ Main API server not responding');
    }
  } catch (error) {
    console.log('❌ Main API server not accessible:', error.message);
  }
  
  // Test 2: Check if audit trail server is running
  console.log('\n2. Testing audit trail server...');
  try {
    const response = await fetch(`${AUDIT_TRAIL_API_URL}/api/v1/audit-trail/simple-enhanced/analytics`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Audit trail server is running');
      console.log(`   Total entries: ${data.data?.totalEntries || 0}`);
    } else {
      console.log('❌ Audit trail server not responding');
    }
  } catch (error) {
    console.log('❌ Audit trail server not accessible:', error.message);
  }
  
  // Test 3: Check compliance audit endpoints
  console.log('\n3. Testing compliance audit endpoints...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/compliance-audit/analytics`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Compliance audit API is working');
      console.log(`   Total events: ${data.data?.totalEvents || 0}`);
    } else {
      console.log('❌ Compliance audit API not responding');
    }
  } catch (error) {
    console.log('❌ Compliance audit API not accessible:', error.message);
  }
  
  // Test 4: Add sample compliance events
  console.log('\n4. Adding sample compliance events...');
  
  const sampleEvents = [
    {
      type: 'score_change',
      data: {
        projectId: 'project_001',
        documentId: 'doc_001',
        userId: 'user_001',
        userName: 'John Doe',
        standardType: 'BABOK',
        previousScore: 82,
        newScore: 87,
        contextData: {
          sessionId: 'session_001',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.100',
          component: 'compliance_dashboard'
        }
      }
    },
    {
      type: 'issue_created',
      data: {
        projectId: 'project_002',
        documentId: 'doc_002',
        userId: 'user_002',
        userName: 'Sarah Wilson',
        issueId: 'issue_001',
        issueTitle: 'Missing stakeholder analysis',
        issueSeverity: 'high',
        standardType: 'PMBOK',
        contextData: {
          sessionId: 'session_002',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.101',
          component: 'compliance_dashboard'
        }
      }
    },
    {
      type: 'workflow_event',
      data: {
        eventType: 'WORKFLOW_STARTED',
        projectId: 'project_003',
        documentId: 'doc_003',
        userId: 'user_003',
        userName: 'Mike Johnson',
        workflowId: 'workflow_001',
        workflowName: 'Quality Review Process',
        workflowStatus: 'IN_PROGRESS',
        standardType: 'DMBOK',
        contextData: {
          sessionId: 'session_003',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.102',
          component: 'compliance_dashboard'
        }
      }
    }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of sampleEvents) {
    try {
      let endpoint = '';
      let body = {};
      
      switch (event.type) {
        case 'score_change':
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-score-change`;
          body = event.data;
          break;
        case 'issue_created':
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-issue-created`;
          body = event.data;
          break;
        case 'workflow_event':
          endpoint = `${API_BASE_URL}/api/v1/compliance-audit/log-workflow-event`;
          body = event.data;
          break;
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
          console.log(`✅ Added ${event.type} event for ${event.data.standardType}`);
        } else {
          errorCount++;
          const errorText = await response.text();
          console.log(`❌ Failed to add ${event.type} event: ${response.status} - ${errorText}`);
        }
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ Error adding ${event.type} event: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Event Addition Results:`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  
  // Test 5: Verify data retrieval
  console.log('\n5. Verifying data retrieval...');
  
  try {
    const analyticsResponse = await fetch(`${AUDIT_TRAIL_API_URL}/api/v1/audit-trail/simple-enhanced/analytics`);
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics data retrieved successfully');
      console.log(`   Total entries: ${analyticsData.data?.totalEntries || 0}`);
      console.log(`   Categories: ${Object.keys(analyticsData.data?.entriesByCategory || {}).length}`);
      console.log(`   Severities: ${Object.keys(analyticsData.data?.entriesBySeverity || {}).length}`);
      console.log(`   Actions: ${Object.keys(analyticsData.data?.entriesByAction || {}).length}`);
    } else {
      console.log('❌ Failed to retrieve analytics data');
    }
  } catch (error) {
    console.log('❌ Error retrieving analytics data:', error.message);
  }
  
  try {
    const complianceResponse = await fetch(`${API_BASE_URL}/api/v1/compliance-audit/analytics`);
    if (complianceResponse.ok) {
      const complianceData = await complianceResponse.json();
      console.log('✅ Compliance analytics data retrieved successfully');
      console.log(`   Total events: ${complianceData.data?.totalEvents || 0}`);
      console.log(`   Events by type: ${Object.keys(complianceData.data?.eventsByType || {}).length}`);
      console.log(`   Events by standard: ${Object.keys(complianceData.data?.eventsByStandard || {}).length}`);
    } else {
      console.log('❌ Failed to retrieve compliance analytics data');
    }
  } catch (error) {
    console.log('❌ Error retrieving compliance analytics data:', error.message);
  }
  
  console.log('\n🎉 API testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Open the web interface at http://localhost:3003');
  console.log('   2. Navigate to the audit-trail page');
  console.log('   3. Switch between "Audit Trail" and "Activity Reports" tabs');
  console.log('   4. Verify that data is displaying correctly in both views');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPIs();
}

export { testAPIs };
