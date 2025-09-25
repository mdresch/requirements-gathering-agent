/**
 * Test script for audit trail API endpoints
 * This script tests the various audit trail endpoints to ensure they're working correctly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/v1/audit-trail';

async function testAuditTrailEndpoints() {
    console.log('🧪 Testing Audit Trail API Endpoints\n');

    try {
        // Test 1: Basic GET endpoint
        console.log('1️⃣ Testing GET /api/v1/audit-trail');
        const getResponse = await fetch(`${BASE_URL}`);
        const getData = await getResponse.json();
        console.log(`   Status: ${getResponse.status}`);
        console.log(`   Success: ${getData.success || false}`);
        console.log(`   Message: ${getData.message || 'No message'}\n`);

        // Test 2: Test endpoint
        console.log('2️⃣ Testing GET /api/v1/audit-trail/test');
        const testResponse = await fetch(`${BASE_URL}/test`);
        const testData = await testResponse.json();
        console.log(`   Status: ${testResponse.status}`);
        console.log(`   Success: ${testData.success || false}`);
        console.log(`   Message: ${testData.message || 'No message'}\n`);

        // Test 3: Basic POST endpoint
        console.log('3️⃣ Testing POST /api/v1/audit-trail');
        const postData = {
            documentId: 'test-doc-123',
            documentName: 'Test Document',
            action: 'created',
            userId: 'test-user',
            projectId: 'test-project',
            details: {
                description: 'Test audit entry creation'
            }
        };

        const postResponse = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        const postResult = await postResponse.json();
        console.log(`   Status: ${postResponse.status}`);
        console.log(`   Success: ${postResult.success || false}`);
        console.log(`   Message: ${postResult.message || 'No message'}\n`);

        // Test 4: Fallback basic POST endpoint
        console.log('4️⃣ Testing POST /api/v1/audit-trail/basic');
        const basicPostResponse = await fetch(`${BASE_URL}/basic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        const basicPostResult = await basicPostResponse.json();
        console.log(`   Status: ${basicPostResponse.status}`);
        console.log(`   Success: ${basicPostResult.success || false}`);
        console.log(`   Message: ${basicPostResult.message || 'No message'}\n`);

        // Test 5: Stats endpoint
        console.log('5️⃣ Testing GET /api/v1/audit-trail/stats');
        const statsResponse = await fetch(`${BASE_URL}/stats`);
        const statsData = await statsResponse.json();
        console.log(`   Status: ${statsResponse.status}`);
        console.log(`   Success: ${statsData.success || false}`);
        console.log(`   Message: ${statsData.message || 'No message'}\n`);

        console.log('✅ Audit Trail API Testing Complete!');

    } catch (error) {
        console.error('❌ Error testing audit trail endpoints:', error.message);
        console.log('\n💡 Make sure the server is running on port 3000');
        console.log('   Run: npm run dev or node dist/api/server.js');
    }
}

// Run the tests
testAuditTrailEndpoints();
