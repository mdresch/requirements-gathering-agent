/**
 * Test script for audit trail data collection
 * This script tests the audit trail endpoints and creates sample data
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002/api/v1';

async function testAuditTrailCollection() {
    console.log('🧪 Testing Audit Trail Data Collection\n');

    try {
        // Test 1: Check if audit trail endpoints are available
        console.log('1️⃣ Testing audit trail endpoint availability...');
        const testResponse = await fetch(`${BASE_URL}/audit-trail/test`);
        
        if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log(`   ✅ Audit trail test endpoint working: ${testData.message}`);
        } else {
            console.log(`   ❌ Audit trail test endpoint not available (${testResponse.status})`);
        }

        // Test 2: Create sample audit trail entries
        console.log('\n2️⃣ Creating sample audit trail entries...');
        
        const sampleAuditEntries = [
            {
                documentId: 'test-doc-001',
                documentName: 'Test Document 1',
                documentType: 'requirements',
                projectId: 'test-project-001',
                projectName: 'Test Project',
                action: 'created',
                actionDescription: 'Document was created for testing',
                userId: 'test-user-001',
                userName: 'Test User',
                userRole: 'analyst',
                userEmail: 'test@example.com',
                timestamp: new Date().toISOString(),
                severity: 'low',
                category: 'document',
                notes: 'Sample audit entry for testing',
                tags: ['test', 'sample', 'document'],
                contextData: {
                    testData: true,
                    source: 'test-script',
                    qualityScore: 85,
                    generationTime: 1200
                }
            },
            {
                documentId: 'test-doc-002',
                documentName: 'Test Document 2',
                documentType: 'specification',
                projectId: 'test-project-001',
                projectName: 'Test Project',
                action: 'updated',
                actionDescription: 'Document was updated with new requirements',
                userId: 'test-user-002',
                userName: 'Test User 2',
                userRole: 'developer',
                userEmail: 'test2@example.com',
                timestamp: new Date().toISOString(),
                severity: 'medium',
                category: 'document',
                notes: 'Sample audit entry for testing updates',
                tags: ['test', 'sample', 'update'],
                contextData: {
                    testData: true,
                    source: 'test-script',
                    qualityScore: 92,
                    generationTime: 800
                }
            }
        ];

        for (const entry of sampleAuditEntries) {
            const createResponse = await fetch(`${BASE_URL}/audit-trail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });

            if (createResponse.ok) {
                const result = await createResponse.json();
                console.log(`   ✅ Created audit entry: ${entry.documentName} (${entry.action})`);
            } else {
                const error = await createResponse.text();
                console.log(`   ❌ Failed to create audit entry: ${entry.documentName} - ${error}`);
            }
        }

        // Test 3: Retrieve audit trail entries
        console.log('\n3️⃣ Retrieving audit trail entries...');
        const getResponse = await fetch(`${BASE_URL}/audit-trail`);
        
        if (getResponse.ok) {
            const auditData = await getResponse.json();
            console.log(`   ✅ Retrieved ${auditData.data?.entries?.length || 0} audit trail entries`);
            
            if (auditData.data?.entries?.length > 0) {
                console.log('   📋 Sample entries:');
                auditData.data.entries.slice(0, 3).forEach((entry, index) => {
                    console.log(`      ${index + 1}. ${entry.documentName} - ${entry.action} by ${entry.userName}`);
                });
            }
        } else {
            const error = await getResponse.text();
            console.log(`   ❌ Failed to retrieve audit trail entries: ${error}`);
        }

        // Test 4: Test enhanced audit trail
        console.log('\n4️⃣ Testing enhanced audit trail...');
        const enhancedResponse = await fetch(`${BASE_URL}/audit-trail/enhanced`);
        
        if (enhancedResponse.ok) {
            const enhancedData = await enhancedResponse.json();
            console.log(`   ✅ Enhanced audit trail working: ${enhancedData.data?.entries?.length || 0} entries`);
        } else {
            const error = await enhancedResponse.text();
            console.log(`   ❌ Enhanced audit trail not available: ${error}`);
        }

        // Test 5: Test data quality audit endpoints
        console.log('\n5️⃣ Testing data quality audit endpoints...');
        const dqEventsResponse = await fetch(`${BASE_URL}/data-quality-audit/events?limit=10`);
        
        if (dqEventsResponse.ok) {
            const dqData = await dqEventsResponse.json();
            console.log(`   ✅ Data quality audit events working: ${dqData.data?.events?.length || 0} events`);
        } else {
            const error = await dqEventsResponse.text();
            console.log(`   ❌ Data quality audit events not available: ${error}`);
        }

        console.log('\n🎉 Audit Trail Data Collection Testing Complete!');

    } catch (error) {
        console.error('❌ Error testing audit trail collection:', error.message);
        console.log('\n💡 Make sure the server is running on port 3002');
        console.log('   Run: npm run dev or node dist/api/server.js');
    }
}

// Run the tests
testAuditTrailCollection();
