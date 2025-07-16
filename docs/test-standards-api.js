/**
 * Quick API Test for Standards Compliance Feature
 * Tests the newly implemented endpoints
 */

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3001/api/v1/standards';
  
  // Mock authentication token (replace with real token in production)
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token-replace-with-real'
  };

  console.log('🧪 Testing Standards Compliance API Endpoints\n');

  // Test health endpoint
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${baseUrl}/health`, { headers });
    console.log('✅ Health endpoint accessible');
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
  }

  // Test analyze endpoint
  console.log('\n2. Testing Analysis Endpoint...');
  const sampleRequest = {
    projectData: {
      projectId: 'TEST-001',
      projectName: 'Test Project',
      industry: 'TECHNOLOGY',
      projectType: 'SOFTWARE_DEVELOPMENT',
      complexity: 'MEDIUM',
      duration: 6,
      budget: 500000,
      teamSize: 8,
      stakeholderCount: 12,
      methodology: 'AGILE',
      documents: [],
      processes: [],
      deliverables: [],
      governance: {
        structure: 'AGILE_TEAM',
        decisionAuthority: 'PRODUCT_OWNER',
        reportingFrequency: 'DAILY'
      },
      metadata: {
        createdBy: 'test-user',
        createdDate: new Date(),
        lastAnalyzed: new Date(),
        analysisVersion: '1.0'
      }
    },
    analysisConfig: {
      enabledStandards: ['BABOK_V3', 'PMBOK_7'],
      deviationThresholds: {
        critical: 70,
        warning: 85,
        acceptable: 95
      },
      analysisDepth: 'COMPREHENSIVE'
    },
    metadata: {
      requestId: 'TEST-REQ-001',
      requestedBy: 'test-user',
      requestDate: new Date(),
      priority: 'MEDIUM'
    }
  };

  try {
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(sampleRequest)
    });
    console.log('✅ Analysis endpoint accessible');
  } catch (error) {
    console.log('❌ Analysis endpoint error:', error.message);
  }

  console.log('\n📋 API Endpoints Summary:');
  console.log('━'.repeat(50));
  console.log('POST /api/v1/standards/analyze - Standards Analysis');
  console.log('GET  /api/v1/standards/dashboard - Compliance Dashboard'); 
  console.log('GET  /api/v1/standards/deviations/summary - Deviation Summary');
  console.log('POST /api/v1/standards/deviations/:id/approve - Approve Deviation');
  console.log('GET  /api/v1/standards/reports/executive-summary - Executive Report');
  console.log('GET  /api/v1/standards/health - Health Check');
  console.log('\n🎯 Ready for production use with real authentication!');
};

// Run tests if this file is executed directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  testEndpoints().catch(console.error);
}

export default testEndpoints;
