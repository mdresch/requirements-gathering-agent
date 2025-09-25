import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002/api/v1';

async function testCategoryAPI() {
  try {
    console.log('🧪 Testing Category API endpoints...');
    
    // Test 1: Get all categories
    console.log('\n1. Testing GET /categories');
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 2: Get active categories
    console.log('\n2. Testing GET /categories/active');
    try {
      const response = await fetch(`${API_BASE_URL}/categories/active`);
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: Create a test category
    console.log('\n3. Testing POST /categories');
    try {
      const testCategory = {
        name: 'test-category',
        description: 'Test category for API testing',
        color: '#FF5733',
        icon: '🧪',
        isActive: true
      };
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCategory),
      });
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCategoryAPI();
