/**
 * Direct database test script
 * Tests MongoDB Atlas connection and queries audit trail data
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/requirements-gathering-agent';

async function testDatabaseConnection() {
    let client;
    
    try {
        console.log('🔍 Testing MongoDB Atlas Database Connection...\n');
        
        // Connect to MongoDB Atlas
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas successfully');
        
        const db = client.db();
        
        // Test 1: Check collections
        console.log('\n📋 Checking collections...');
        const collections = await db.listCollections().toArray();
        console.log(`   Found ${collections.length} collections:`);
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Test 2: Query audit trail entries
        console.log('\n📄 Testing audit trail entries...');
        const auditCount = await db.collection('documentaudittrails').countDocuments();
        console.log(`   Total audit trail entries: ${auditCount}`);
        
        if (auditCount > 0) {
            const sampleEntry = await db.collection('documentaudittrails').findOne({});
            console.log('   Sample entry:', {
                documentName: sampleEntry.documentName,
                action: sampleEntry.action,
                userName: sampleEntry.userName,
                timestamp: sampleEntry.timestamp
            });
        }
        
        // Test 3: Query compliance metrics
        console.log('\n📈 Testing compliance metrics...');
        const complianceCount = await db.collection('compliancemetrics').countDocuments();
        console.log(`   Total compliance metrics: ${complianceCount}`);
        
        if (complianceCount > 0) {
            const sampleMetric = await db.collection('compliancemetrics').findOne({});
            console.log('   Sample metric:', {
                standardType: sampleMetric.standardType,
                score: sampleMetric.score,
                projectId: sampleMetric.projectId
            });
        }
        
        // Test 4: Query compliance issues
        console.log('\n🚨 Testing compliance issues...');
        const issuesCount = await db.collection('complianceissues').countDocuments();
        console.log(`   Total compliance issues: ${issuesCount}`);
        
        if (issuesCount > 0) {
            const sampleIssue = await db.collection('complianceissues').findOne({});
            console.log('   Sample issue:', {
                title: sampleIssue.title,
                severity: sampleIssue.severity,
                status: sampleIssue.status
            });
        }
        
        // Test 5: Query user sessions
        console.log('\n👥 Testing user sessions...');
        const sessionsCount = await db.collection('usersessions').countDocuments();
        console.log(`   Total user sessions: ${sessionsCount}`);
        
        if (sessionsCount > 0) {
            const sampleSession = await db.collection('usersessions').findOne({});
            console.log('   Sample session:', {
                userId: sampleSession.userId,
                sessionId: sampleSession.sessionId,
                duration: sampleSession.duration
            });
        }
        
        // Test 6: Query real-time metrics
        console.log('\n📊 Testing real-time metrics...');
        const metricsCount = await db.collection('realtimemetrics').countDocuments();
        console.log(`   Total real-time metrics: ${metricsCount}`);
        
        if (metricsCount > 0) {
            const sampleMetric = await db.collection('realtimemetrics').findOne({});
            console.log('   Sample metric:', {
                activeUsers: sampleMetric.activeUsers,
                activeSessions: sampleMetric.activeSessions,
                timestamp: sampleMetric.timestamp
            });
        }
        
        // Test 7: Query alerts
        console.log('\n⚠️ Testing alerts...');
        const alertsCount = await db.collection('alerts').countDocuments();
        console.log(`   Total alerts: ${alertsCount}`);
        
        if (alertsCount > 0) {
            const sampleAlert = await db.collection('alerts').findOne({});
            console.log('   Sample alert:', {
                title: sampleAlert.title,
                type: sampleAlert.type,
                severity: sampleAlert.severity,
                status: sampleAlert.status
            });
        }
        
        // Test 8: Test aggregation queries
        console.log('\n🔍 Testing aggregation queries...');
        
        // Count by action type
        const actionStats = await db.collection('documentaudittrails').aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log('   Actions by frequency:', actionStats);
        
        // Count by user
        const userStats = await db.collection('documentaudittrails').aggregate([
            { $group: { _id: '$userName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).toArray();
        console.log('   Top users by activity:', userStats);
        
        // Count by project
        const projectStats = await db.collection('documentaudittrails').aggregate([
            { $group: { _id: '$projectName', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log('   Projects by activity:', projectStats);
        
        console.log('\n🎉 Database connection and data access test completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   📄 Audit Trail Entries: ${auditCount}`);
        console.log(`   📈 Compliance Metrics: ${complianceCount}`);
        console.log(`   🚨 Compliance Issues: ${issuesCount}`);
        console.log(`   👥 User Sessions: ${sessionsCount}`);
        console.log(`   📊 Real-time Metrics: ${metricsCount}`);
        console.log(`   ⚠️ Alerts: ${alertsCount}`);
        
    } catch (error) {
        console.error('❌ Error testing database connection:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Disconnected from MongoDB Atlas');
        }
    }
}

// Run the test
testDatabaseConnection();
