// Test script for data quality audit events
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3002';

async function testDataQualityAudit() {
  console.log('🧪 Testing Data Quality Audit Events...\n');
  
  // Test 1: Log a data quality assessment
  console.log('1. Logging data quality assessment...');
  try {
    const assessmentData = {
      assessmentId: 'dq_assessment_001',
      documentId: 'doc_001',
      projectId: 'project_001',
      userId: 'user_001',
      userName: 'John Doe',
      assessmentType: 'AUTOMATED',
      overallScore: 85,
      dimensions: {
        completeness: 90,
        accuracy: 88,
        consistency: 82,
        timeliness: 85,
        validity: 87,
        uniqueness: 78
      },
      issues: [
        {
          id: 'issue_001',
          type: 'MISSING_DATA',
          severity: 'medium',
          description: 'Missing required field: stakeholder_contact',
          field: 'stakeholder_contact',
          suggestedFix: 'Add stakeholder contact information'
        },
        {
          id: 'issue_002',
          type: 'INCONSISTENT_FORMAT',
          severity: 'low',
          description: 'Date format inconsistency detected',
          field: 'project_timeline',
          suggestedFix: 'Standardize date format to ISO 8601'
        }
      ],
      recommendations: [
        {
          id: 'rec_001',
          priority: 'high',
          description: 'Implement data validation rules',
          impact: 'Prevent data quality issues',
          effort: 'medium'
        }
      ],
      metadata: {
        dataSource: 'automated_scanner',
        validationRules: ['required_fields', 'format_validation', 'consistency_check'],
        assessmentDuration: 2500,
        aiModel: 'gpt-4',
        confidenceScore: 0.92
      },
      contextData: {
        sessionId: 'session_001',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/log-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData)
    });

    if (response.ok) {
      console.log('✅ Data quality assessment logged successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to log assessment:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error logging assessment:', error.message);
  }

  // Test 2: Log an issue resolution
  console.log('\n2. Logging issue resolution...');
  try {
    const resolutionData = {
      documentId: 'doc_001',
      projectId: 'project_001',
      userId: 'user_002',
      userName: 'Sarah Wilson',
      issueId: 'issue_001',
      issueType: 'MISSING_DATA',
      resolutionMethod: 'manual_data_entry',
      resolutionNotes: 'Added stakeholder contact information from project documentation',
      contextData: {
        sessionId: 'session_002',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.101'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/log-issue-resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolutionData)
    });

    if (response.ok) {
      console.log('✅ Issue resolution logged successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to log resolution:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error logging resolution:', error.message);
  }

  // Test 3: Log a rule validation
  console.log('\n3. Logging rule validation...');
  try {
    const validationData = {
      documentId: 'doc_002',
      projectId: 'project_002',
      userId: 'user_003',
      userName: 'Mike Johnson',
      ruleId: 'rule_001',
      ruleName: 'Required Fields Validation',
      validationResult: 'FAILED',
      violations: [
        {
          field: 'project_description',
          value: null,
          expectedValue: 'Non-empty string',
          message: 'Project description is required'
        }
      ],
      contextData: {
        sessionId: 'session_003',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.102'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/log-rule-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationData)
    });

    if (response.ok) {
      console.log('✅ Rule validation logged successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to log validation:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error logging validation:', error.message);
  }

  // Test 4: Log a quality improvement
  console.log('\n4. Logging quality improvement...');
  try {
    const improvementData = {
      documentId: 'doc_001',
      projectId: 'project_001',
      userId: 'user_001',
      userName: 'John Doe',
      previousScore: 75,
      newScore: 85,
      improvementMethod: 'data_cleaning_and_validation',
      improvements: [
        {
          dimension: 'completeness',
          previousValue: 70,
          newValue: 90,
          improvement: 20
        },
        {
          dimension: 'accuracy',
          previousValue: 80,
          newValue: 88,
          improvement: 8
        }
      ],
      contextData: {
        sessionId: 'session_001',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100'
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/log-quality-improvement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(improvementData)
    });

    if (response.ok) {
      console.log('✅ Quality improvement logged successfully');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to log improvement:', response.status, errorText);
    }
  } catch (error) {
    console.log('❌ Error logging improvement:', error.message);
  }

  // Test 5: Get data quality events
  console.log('\n5. Retrieving data quality events...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/events?limit=10`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Data quality events retrieved successfully');
      console.log(`   Total events: ${data.data.events.length}`);
      data.data.events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.actionDescription} (${event.severity})`);
      });
    } else {
      console.log('❌ Failed to retrieve events:', response.status);
    }
  } catch (error) {
    console.log('❌ Error retrieving events:', error.message);
  }

  // Test 6: Get data quality analytics
  console.log('\n6. Retrieving data quality analytics...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/data-quality-audit/analytics`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Data quality analytics retrieved successfully');
      console.log(`   Total assessments: ${data.data.totalAssessments}`);
      console.log(`   Total issues: ${data.data.totalIssues}`);
      console.log(`   Total resolutions: ${data.data.totalResolutions}`);
      console.log(`   Average score: ${data.data.averageScores.overall.toFixed(1)}%`);
    } else {
      console.log('❌ Failed to retrieve analytics:', response.status);
    }
  } catch (error) {
    console.log('❌ Error retrieving analytics:', error.message);
  }

  console.log('\n🎉 Data quality audit testing completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Open the web interface at http://localhost:3003');
  console.log('   2. Navigate to the audit-trail page');
  console.log('   3. Switch to the "Data Quality" tab');
  console.log('   4. Verify that the data quality events are displaying correctly');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testDataQualityAudit();
}

export { testDataQualityAudit };
