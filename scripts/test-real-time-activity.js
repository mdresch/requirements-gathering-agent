// Test script for real-time activity tracking
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002';

async function testRealTimeActivity() {
  console.log('🧪 Testing Real-Time Activity Tracking...\n');
  
  // Test 1: Start a session
  console.log('1. Starting user session...');
  const sessionId = `session_${Date.now()}`;
  try {
    const sessionData = {
      sessionId: sessionId,
      userId: 'user_001',
      userName: 'John Doe',
      userEmail: 'john.doe@company.com',
      metadata: {
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (response.ok) {
      console.log('✅ Session started successfully');
      console.log(`   Session ID: ${sessionId}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to start session:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error starting session:', error.message);
  }

  // Test 2: Track page view
  console.log('\n2. Tracking page view...');
  try {
    const pageViewData = {
      userId: 'user_001',
      userName: 'John Doe',
      userEmail: 'john.doe@company.com',
      sessionId: sessionId,
      page: '/audit-trail',
      metadata: {
        referrer: '/dashboard',
        loadTime: 1200
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/track/page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageViewData)
    });

    if (response.ok) {
      console.log('✅ Page view tracked successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to track page view:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error tracking page view:', error.message);
  }

  // Test 3: Track document action
  console.log('\n3. Tracking document action...');
  try {
    const documentActionData = {
      userId: 'user_001',
      userName: 'John Doe',
      userEmail: 'john.doe@company.com',
      sessionId: sessionId,
      action: 'view',
      documentId: 'doc_001',
      documentName: 'Requirements Specification v2.1',
      projectId: 'project_001',
      metadata: {
        duration: 45000,
        scrollDepth: 75
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/track/document-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentActionData)
    });

    if (response.ok) {
      console.log('✅ Document action tracked successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to track document action:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error tracking document action:', error.message);
  }

  // Test 4: Track search activity
  console.log('\n4. Tracking search activity...');
  try {
    const searchData = {
      userId: 'user_001',
      userName: 'John Doe',
      userEmail: 'john.doe@company.com',
      sessionId: sessionId,
      searchQuery: 'data quality assessment',
      resultsCount: 15,
      metadata: {
        searchTime: 800,
        filters: ['project_001', 'last_30_days']
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/track/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData)
    });

    if (response.ok) {
      console.log('✅ Search activity tracked successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to track search:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error tracking search:', error.message);
  }

  // Test 5: Track general activity
  console.log('\n5. Tracking general activity...');
  try {
    const activityData = {
      userId: 'user_001',
      userName: 'John Doe',
      userEmail: 'john.doe@company.com',
      sessionId: sessionId,
      activityType: 'FORM_INTERACTION',
      component: 'filters',
      action: 'filter_applied',
      duration: 2000,
      metadata: {
        filterType: 'date_range',
        filterValue: 'last_7_days'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    });

    if (response.ok) {
      console.log('✅ General activity tracked successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to track activity:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error tracking activity:', error.message);
  }

  // Wait a bit to simulate user activity
  console.log('\n⏳ Simulating user activity (5 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test 6: Get active sessions
  console.log('\n6. Retrieving active sessions...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/sessions`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Active sessions retrieved successfully');
      console.log(`   Total active sessions: ${data.data.sessions.length}`);
      data.data.sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.userName} - ${session.activities.length} activities`);
      });
    } else {
      console.log('❌ Failed to retrieve sessions:', response.status);
    }
  } catch (error) {
    console.log('❌ Error retrieving sessions:', error.message);
  }

  // Test 7: Get activity analytics
  console.log('\n7. Retrieving activity analytics...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/analytics`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Activity analytics retrieved successfully');
      console.log(`   Total activities: ${data.data.totalActivities}`);
      console.log(`   Active sessions: ${data.data.activeSessions}`);
      console.log(`   Unique users: ${Object.keys(data.data.activitiesByUser).length}`);
      console.log(`   Average session duration: ${Math.round(data.data.sessionStats.averageSessionDuration / 1000)}s`);
    } else {
      console.log('❌ Failed to retrieve analytics:', response.status);
    }
  } catch (error) {
    console.log('❌ Error retrieving analytics:', error.message);
  }

  // Test 8: End the session
  console.log('\n8. Ending user session...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/real-time-activity/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: sessionId })
    });

    if (response.ok) {
      console.log('✅ Session ended successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to end session:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error ending session:', error.message);
  }

  console.log('\n🎉 Real-time activity tracking testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Open the web interface at http://localhost:3003');
  console.log('   2. Navigate to the audit-trail page');
  console.log('   3. Switch to the "Real-Time" tab');
  console.log('   4. Verify that the real-time activity data is displaying correctly');
  console.log('   5. Check WebSocket connection status in the dashboard');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealTimeActivity();
}

export { testRealTimeActivity };
