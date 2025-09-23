import mongoose from 'mongoose';
import { ContextTrackingController } from './dist/api/controllers/ContextTrackingController.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function testController() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a mock request and response
    const mockReq = {
      params: { projectId: '68cc74380846c36e221ee391' },
      headers: { 'x-request-id': 'test-request' }
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`📊 Response (${code}):`, JSON.stringify(data, null, 2));
        }
      }),
      json: (data) => {
        console.log('📊 Response:', JSON.stringify(data, null, 2));
      }
    };

    const mockNext = (error) => {
      if (error) {
        console.error('❌ Next function called with error:', error.message);
      } else {
        console.log('✅ Next function called without error');
      }
    };

    console.log('🔍 Testing controller directly...');
    await ContextTrackingController.getProjectAnalytics(mockReq, mockRes, mockNext);

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testController();

