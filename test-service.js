import mongoose from 'mongoose';
import { AIContextTracking } from './dist/models/AIContextTracking.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function testService() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const projectId = '68cc74380846c36e221ee391';
    console.log(`🔍 Testing analytics for project: ${projectId}`);

    // Test the exact query from the service
    const records = await AIContextTracking.find({ projectId, status: 'completed' });
    console.log(`📊 Found ${records.length} completed records`);

    if (records.length > 0) {
      console.log('📋 First record details:');
      const record = records[0];
      console.log('  - projectId:', record.projectId);
      console.log('  - status:', record.status);
      console.log('  - contextUtilization:', record.contextUtilization);
      console.log('  - performance:', record.performance);
      
      // Test the calculations
      const totalTokensUsed = records.reduce((sum, record) => sum + record.contextUtilization.totalTokensUsed, 0);
      console.log('  - totalTokensUsed:', totalTokensUsed);
      
      const averageUtilization = records.reduce((sum, record) => sum + record.contextUtilization.utilizationPercentage, 0) / records.length;
      console.log('  - averageUtilization:', averageUtilization);
    }

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testService();

