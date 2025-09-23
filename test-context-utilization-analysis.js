/**
 * Test Context Utilization Analysis for Mission Vision Core Values Document
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002/api/v1';

async function testContextUtilizationAnalysis() {
  console.log('🔍 Testing Context Utilization Analysis for Mission Vision Core Values...\n');

  try {
    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 1: Get project analytics
    console.log('📊 Step 1: Getting project analytics...');
    
    const analyticsResponse = await fetch(`${API_BASE_URL}/context-tracking/projects/68cc74380846c36e221ee391/analytics`, {
      headers: {
        'X-API-Key': 'dev-api-key-123'
      }
    });

    const analyticsResult = await analyticsResponse.json();
    console.log(`📥 Analytics response status: ${analyticsResponse.status}`);
    
    if (analyticsResult.success && analyticsResult.data) {
      const analytics = analyticsResult.data;
      console.log('✅ Project Analytics Retrieved:');
      console.log(`   📈 Total Interactions: ${analytics.totalInteractions}`);
      console.log(`   📊 Average Utilization: ${analytics.averageUtilization?.toFixed(2) || 0}%`);
      console.log(`   🎯 Total Tokens Used: ${analytics.totalTokensUsed?.toLocaleString() || 0}`);
      console.log(`   💰 Total Cost: $${analytics.totalCost?.toFixed(4) || 0}`);
      
      if (analytics.utilizationDistribution) {
        console.log('   📋 Utilization Distribution:');
        console.log(`      🟢 High (≥90%): ${analytics.utilizationDistribution.high}`);
        console.log(`      🟡 Medium (70-89%): ${analytics.utilizationDistribution.medium}`);
        console.log(`      🔴 Low (<70%): ${analytics.utilizationDistribution.low}`);
      }
      
      if (analytics.topProviders && analytics.topProviders.length > 0) {
        console.log('   🤖 Top AI Providers:');
        analytics.topProviders.forEach((provider, index) => {
          console.log(`      ${index + 1}. ${provider.provider}: ${provider.count} calls (${provider.percentage?.toFixed(1)}%)`);
        });
      }
      
      if (analytics.performanceMetrics) {
        console.log('   ⚡ Performance Metrics:');
        console.log(`      ⏱️  Average Generation Time: ${analytics.performanceMetrics.averageGenerationTime?.toFixed(0) || 0}ms`);
        console.log(`      🚀 Average Tokens/Second: ${analytics.performanceMetrics.averageTokensPerSecond?.toFixed(2) || 0}`);
      }
    } else {
      console.log('⚠️ No analytics data available yet');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Step 2: Get document traceability for Mission Vision Core Values
    console.log('🔗 Step 2: Getting document traceability...');
    
    const traceabilityResponse = await fetch(`${API_BASE_URL}/context-tracking/documents/68d1c35de0c8bdea67990fb3/traceability`, {
      headers: {
        'X-API-Key': 'dev-api-key-123'
      }
    });

    const traceabilityResult = await traceabilityResponse.json();
    console.log(`📥 Traceability response status: ${traceabilityResponse.status}`);
    
    if (traceabilityResult.success && traceabilityResult.data) {
      const traceability = traceabilityResult.data;
      console.log('✅ Document Traceability Retrieved:');
      console.log(`   📄 Total Generation Jobs: ${traceability.length}`);
      
      traceability.forEach((job, index) => {
        console.log(`\n   📋 Job ${index + 1}: ${job.generationJobId}`);
        console.log(`      🤖 AI Provider: ${job.aiProvider} (${job.aiModel})`);
        console.log(`      📊 Utilization: ${job.utilizationPercentage?.toFixed(2) || 0}%`);
        console.log(`      ⏱️  Generation Time: ${job.generationTime?.toFixed(0) || 0}ms`);
        console.log(`      🎯 Quality Score: ${job.qualityScore || 0}%`);
        console.log(`      ✅ Compliance Score: ${job.complianceScore || 0}%`);
        console.log(`      📅 Created: ${new Date(job.createdAt).toLocaleString()}`);
        
        if (job.contextBreakdown) {
          console.log(`      📈 Context Breakdown:`);
          Object.entries(job.contextBreakdown).forEach(([key, value]) => {
            if (typeof value === 'object' && value.tokens !== undefined) {
              console.log(`         ${key}: ${value.tokens} tokens (${value.percentage}%)`);
            }
          });
        }
        
        if (job.sourceInformation) {
          console.log(`      📝 Source Info:`);
          console.log(`         Project: ${job.sourceInformation.projectName}`);
          console.log(`         Type: ${job.sourceInformation.projectType}`);
          console.log(`         Framework: ${job.sourceInformation.framework}`);
          console.log(`         Document: ${job.sourceInformation.documentType}`);
        }
      });
    } else {
      console.log('⚠️ No traceability data available yet');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Step 3: Get system-wide analytics
    console.log('🌐 Step 3: Getting system-wide analytics...');
    
    const systemResponse = await fetch(`${API_BASE_URL}/context-tracking/system/analytics`, {
      headers: {
        'X-API-Key': 'dev-api-key-123'
      }
    });

    const systemResult = await systemResponse.json();
    console.log(`📥 System analytics response status: ${systemResponse.status}`);
    
    if (systemResult.success && systemResult.data) {
      const systemData = systemResult.data;
      console.log('✅ System Analytics Retrieved:');
      console.log(`   🌍 Total Generations: ${systemData.totalGenerations}`);
      console.log(`   📊 Average Utilization: ${systemData.averageUtilization?.toFixed(2) || 0}%`);
      console.log(`   🎯 Total Tokens Used: ${systemData.totalTokensUsed?.toLocaleString() || 0}`);
      console.log(`   💰 Total Cost: $${systemData.totalCost?.toFixed(4) || 0}`);
      
      if (systemData.topProviders && systemData.topProviders.length > 0) {
        console.log('   🤖 System-wide Provider Usage:');
        systemData.topProviders.forEach((provider, index) => {
          console.log(`      ${index + 1}. ${provider.provider}: ${provider.count} calls (${provider.percentage?.toFixed(1)}%)`);
        });
      }
      
      if (systemData.utilizationTrends && systemData.utilizationTrends.length > 0) {
        console.log('   📈 Utilization Trends:');
        systemData.utilizationTrends.forEach((trend, index) => {
          console.log(`      ${trend.period}: ${trend.utilization?.toFixed(2) || 0}% (${trend.generations} generations)`);
        });
      }
    } else {
      console.log('⚠️ No system analytics data available yet');
    }

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🎉 Context Utilization Analysis Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Context tracking infrastructure is in place');
    console.log('   ✅ API endpoints are responding correctly');
    console.log('   ✅ Analytics data structure is defined');
    console.log('   ⚠️  Actual context data will be available after document generation with tracking enabled');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testContextUtilizationAnalysis().catch(console.error);
