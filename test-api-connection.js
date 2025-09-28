// Simple API Connection Test Script
// Run this with: node test-api-connection.js

const API_BASE_URL = 'http://localhost:3002/api/v1';

async function testApiConnection() {
  console.log('🧪 Testing API Connection...');
  console.log(`📡 Base URL: ${API_BASE_URL}`);
  
  try {
    // Test basic health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(`Health Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    }
    
    // Test standards dashboard endpoint
    console.log('\n2️⃣ Testing standards dashboard endpoint...');
    const dashboardResponse = await fetch(`${API_BASE_URL}/standards/dashboard`, {
      headers: {
        'X-API-Key': 'dev-api-key-123',
        'Content-Type': 'application/json'
      }
    });
    console.log(`Dashboard Status: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard endpoint working:', {
        hasProjectSummary: !!dashboardData.projectSummary,
        hasComplianceOverview: !!dashboardData.complianceOverview,
        overallScore: dashboardData.projectSummary?.overallScore
      });
    } else {
      const errorText = await dashboardResponse.text();
      console.log('❌ Dashboard endpoint failed:', errorText);
    }
    
    // Test executive summary endpoint
    console.log('\n3️⃣ Testing executive summary endpoint...');
    const summaryResponse = await fetch(`${API_BASE_URL}/standards/reports/executive-summary`, {
      headers: {
        'X-API-Key': 'dev-api-key-123',
        'Content-Type': 'application/json'
      }
    });
    console.log(`Summary Status: ${summaryResponse.status} ${summaryResponse.statusText}`);
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Executive summary endpoint working');
    } else {
      const errorText = await summaryResponse.text();
      console.log('❌ Executive summary endpoint failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Make sure the backend server is running: npm start');
    console.log('2. Check if the server is running on port 3001');
    console.log('3. Verify CORS is properly configured');
    console.log('4. Check if the API key is correct');
  }
}

// Run the test
testApiConnection();
