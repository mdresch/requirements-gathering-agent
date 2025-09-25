import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/v1';

async function testUpdatedMetrics() {
  console.log('🧪 Testing Updated Homepage Metrics...');
  
  try {
    // Test templates endpoint
    console.log('\n📊 Testing Templates Count...');
    const templatesResponse = await axios.get(`${API_BASE_URL}/templates`);
    console.log('Templates Response:', JSON.stringify(templatesResponse.data, null, 2));
    const templatesCount = templatesResponse.data?.data?.templates?.length || templatesResponse.data?.data?.length || 0;
    console.log(`   📁 Templates Created: ${templatesCount}`);

    // Test projects endpoint
    console.log('\n📋 Testing Projects Count...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log('Projects Response:', JSON.stringify(projectsResponse.data, null, 2));
    const projects = projectsResponse.data?.data?.projects || projectsResponse.data?.data || [];
    console.log(`   📊 Active Projects: ${projects.length}`);

    const timeSaved = projects.length * 2;
    console.log(`   ⏰ Time Saved: ${timeSaved} hours`);

    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const successRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;
    console.log(`   ✅ Success Rate: ${successRate}%`);

    console.log('\n📈 Updated Homepage Metrics Summary:');
    console.log(`   📁 Templates Created: ${templatesCount}`);
    console.log(`   👥 Active Users: 3 (default)`);
    console.log(`   ⏰ Time Saved: ${timeSaved}h`);
    console.log(`   🎯 Success Rate: ${successRate}%`);

    console.log('\n🎉 Updated metrics are ready for the homepage!');

  } catch (error) {
    console.error('❌ Error testing updated metrics:', error.message);
    if (error.response) {
      console.error('   API Response Status:', error.response.status);
      console.error('   API Response Data:', error.response.data);
    }
  }
}

testUpdatedMetrics();
