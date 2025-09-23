import mongoose from 'mongoose';
import { AIContextTrackingService } from './dist/services/AIContextTrackingService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function testServiceDirect() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const projectId = '68cc74380846c36e221ee391';
    console.log(`🔍 Testing service directly for project: ${projectId}`);

    // Test the service method directly
    const analytics = await AIContextTrackingService.getProjectAnalytics(projectId);
    console.log('📊 Analytics result:', JSON.stringify(analytics, null, 2));

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testServiceDirect();
