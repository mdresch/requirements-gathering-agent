/**
 * Test script for audit trail API endpoints
 * Tests if the API endpoints are working with real database data
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002/api/v1';

async function testAuditTrailEndpoints() {
    console.log('🧪 Testing Audit Trail API Endpoints\n');

    try {
        // Test 1: Basic audit trail endpoint
        console.log('1️⃣ Testing basic audit trail endpoint...');
        const basicResponse = await fetch(`${BASE_URL}/audit-trail`);
        
        if (basicResponse.ok) {
            const basicData = await basicResponse.json();
            console.log(`   ✅ Basic audit trail working: ${basicData.data?.entries?.length || 0} entries`);
            
            if (basicData.data?.entries?.length > 0) {
                const sampleEntry = basicData.data.entries[0];
                console.log('   📋 Sample entry:', {
                    documentName: sampleEntry.documentName,
                    action: sampleEntry.action,
                    userName: sampleEntry.userName,
                    timestamp: sampleEntry.timestamp
                });
            }
        } else {
            const error = await basicResponse.text();
            console.log(`   ❌ Basic audit trail failed: ${error}`);
        }

        // Test 2: Simple enhanced audit trail endpoint
        console.log('\n2️⃣ Testing simple enhanced audit trail endpoint...');
        const simpleResponse = await fetch(`${BASE_URL}/audit-trail/simple?limit=10`);
        
        if (simpleResponse.ok) {
            const simpleData = await simpleResponse.json();
            console.log(`   ✅ Simple enhanced audit trail working: ${simpleData.data?.entries?.length || 0} entries`);
            
            if (simpleData.data?.entries?.length > 0) {
                const sampleEntry = simpleData.data.entries[0];
                console.log('   📋 Sample entry:', {
                    documentName: sampleEntry.documentName,
                    action: sampleEntry.action,
                    userName: sampleEntry.userName,
                    timestamp: sampleEntry.timestamp
                });
            }
        } else {
            const error = await simpleResponse.text();
            console.log(`   ❌ Simple enhanced audit trail failed: ${error}`);
        }

        // Test 3: Enhanced audit trail endpoint
        console.log('\n3️⃣ Testing enhanced audit trail endpoint...');
        const enhancedResponse = await fetch(`${BASE_URL}/audit-trail/enhanced?limit=10`);
        
        if (enhancedResponse.ok) {
            const enhancedData = await enhancedResponse.json();
            console.log(`   ✅ Enhanced audit trail working: ${enhancedData.data?.entries?.length || 0} entries`);
        } else {
            const error = await enhancedResponse.text();
            console.log(`   ❌ Enhanced audit trail failed: ${error}`);
        }

        // Test 4: Analytics endpoint
        console.log('\n4️⃣ Testing analytics endpoint...');
        const analyticsResponse = await fetch(`${BASE_URL}/audit-trail/simple/analytics`);
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log(`   ✅ Analytics endpoint working`);
            
            if (analyticsData.data) {
                console.log('   📊 Analytics data:', {
                    totalEntries: analyticsData.data.totalEntries,
                    entriesByAction: analyticsData.data.entriesByAction,
                    entriesByUser: analyticsData.data.entriesByUser
                });
            }
        } else {
            const error = await analyticsResponse.text();
            console.log(`   ❌ Analytics endpoint failed: ${error}`);
        }

        // Test 5: Data quality audit endpoints
        console.log('\n5️⃣ Testing data quality audit endpoints...');
        const dqEventsResponse = await fetch(`${BASE_URL}/data-quality-audit/events?limit=10`);
        
        if (dqEventsResponse.ok) {
            const dqData = await dqEventsResponse.json();
            console.log(`   ✅ Data quality audit events working: ${dqData.data?.events?.length || 0} events`);
        } else {
            const error = await dqEventsResponse.text();
            console.log(`   ❌ Data quality audit events failed: ${error}`);
        }

        console.log('\n🎉 Audit Trail API Endpoints Testing Complete!');

    } catch (error) {
        console.error('❌ Error testing audit trail endpoints:', error.message);
        console.log('\n💡 Make sure the server is running on port 3002');
    }
}

// Run the tests
testAuditTrailEndpoints();
