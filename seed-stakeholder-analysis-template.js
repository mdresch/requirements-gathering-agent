/**
 * Seed Database with Stakeholder Analysis Template
 * 
 * This script creates the stakeholder-analysis template in the database
 * so that the database-first generation can work properly.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent';

async function seedStakeholderAnalysisTemplate() {
  console.log('🌱 Seeding Stakeholder Analysis Template');
  console.log('========================================');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import TemplateModel
    const { TemplateModel } = await import('./src/models/Template.model.js');
    
    // Check if template already exists
    const existingTemplate = await TemplateModel.findOne({ 
      documentKey: 'stakeholder-analysis',
      is_deleted: false 
    });
    
    if (existingTemplate) {
      console.log('✅ stakeholder-analysis template already exists:');
      console.log(`   - Name: ${existingTemplate.name}`);
      console.log(`   - ID: ${existingTemplate._id}`);
      console.log(`   - Active: ${existingTemplate.is_active}`);
      return;
    }
    
    // Create the stakeholder analysis template
    console.log('🔧 Creating stakeholder-analysis template...');
    
    const stakeholderAnalysisTemplate = new TemplateModel({
      name: 'Stakeholder Analysis',
      description: 'Comprehensive stakeholder analysis document that identifies, assesses, and provides engagement strategies for all project stakeholders.',
      category: 'Stakeholder Management',
      documentKey: 'stakeholder-analysis',
      template_type: 'system',
      ai_instructions: 'You are a project management expert specializing in stakeholder analysis and engagement strategies. Create comprehensive stakeholder assessments that identify, analyze, and provide actionable engagement strategies. Focus on creating detailed stakeholder profiles, power/interest grids, communication plans, and risk mitigation strategies.',
      prompt_template: `Based on the following project context, generate a comprehensive Stakeholder Analysis document.

Project Context:
- Name: {{projectName}}
- Type: {{projectType}}
- Description: {{description}}

Create a detailed stakeholder analysis that identifies, assesses, and provides engagement strategies for all project stakeholders.

# Stakeholder Analysis

## Executive Summary
- Purpose and scope of stakeholder analysis
- Key stakeholder insights and recommendations
- Critical engagement priorities

## Stakeholder Identification

### Internal Stakeholders
| Stakeholder | Role/Title | Department | Interest Level | Influence Level |
|-------------|------------|------------|----------------|-----------------|
| [Name/Role] | [Title] | [Dept] | [High/Med/Low] | [High/Med/Low] |

### External Stakeholders
| Stakeholder | Organization | Relationship | Interest Level | Influence Level |
|-------------|--------------|--------------|----------------|-----------------|
| [Name/Role] | [Org] | [Type] | [High/Med/Low] | [High/Med/Low] |

### End Users
| User Group | Description | Size | Impact Level | Engagement Need |
|------------|-------------|------|--------------|-----------------|
| [Group] | [Description] | [Count] | [High/Med/Low] | [High/Med/Low] |

## Stakeholder Assessment

### Power/Interest Grid
**High Power, High Interest (Manage Closely)**
- [Stakeholder 1]: [Brief description and key concerns]
- [Stakeholder 2]: [Brief description and key concerns]

**High Power, Low Interest (Keep Satisfied)**
- [Stakeholder 1]: [Brief description and engagement approach]
- [Stakeholder 2]: [Brief description and engagement approach]

**Low Power, High Interest (Keep Informed)**
- [Stakeholder 1]: [Brief description and information needs]
- [Stakeholder 2]: [Brief description and information needs]

**Low Power, Low Interest (Monitor)**
- [Stakeholder 1]: [Brief description and monitoring approach]
- [Stakeholder 2]: [Brief description and monitoring approach]

### Stakeholder Attitudes
**Supporters (Positive)**
- [Stakeholder]: [Why they support, how to leverage]

**Neutral (Neutral)**
- [Stakeholder]: [Current position, how to gain support]

**Resistors (Negative)**
- [Stakeholder]: [Concerns, mitigation strategies]

## Detailed Stakeholder Profiles

### [Stakeholder Name/Role]
**Basic Information:**
- Name/Title: [Full name and title]
- Organization: [Department/company]
- Contact Information: [Email, phone]

**Analysis:**
- Interest in Project: [High/Medium/Low] - [Why they care]
- Influence Level: [High/Medium/Low] - [Type of influence]
- Attitude: [Supporter/Neutral/Resistor] - [Current stance]
- Requirements: [What they need from the project]
- Expectations: [What they expect to happen]
- Concerns: [What they're worried about]
- Success Criteria: [How they define project success]

**Engagement Strategy:**
- Communication Frequency: [Daily/Weekly/Monthly/Ad-hoc]
- Preferred Communication Method: [Email/Meetings/Reports/Dashboard]
- Key Messages: [What they need to hear]
- Engagement Activities: [Specific activities to keep them engaged]
- Escalation Path: [When and how to escalate issues]

[Repeat for each key stakeholder]

## Engagement Strategies

### Communication Plan
| Stakeholder | Frequency | Method | Content Type | Responsible |
|-------------|-----------|--------|--------------|-------------|
| [Name] | [Frequency] | [Method] | [Type] | [Person] |

### Influence Strategies
**Building Coalition Support:**
- [Strategy 1]: [How to build support among key influencers]
- [Strategy 2]: [How to address resistance]

**Managing Competing Interests:**
- [Conflict 1]: [Description and resolution approach]
- [Conflict 2]: [Description and resolution approach]

### Risk Mitigation
**Stakeholder Risks:**
| Risk | Stakeholder | Impact | Probability | Mitigation Strategy |
|------|-------------|--------|-------------|-------------------|
| [Risk] | [Who] | [H/M/L] | [H/M/L] | [Strategy] |

## Engagement Activities

### Phase-Based Engagement
**Project Initiation:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Planning Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Execution Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Closing Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

### Ongoing Engagement
**Regular Communications:**
- Status Reports: [Frequency, audience, content]
- Steering Committee: [Frequency, participants, agenda items]
- Working Sessions: [Frequency, participants, objectives]

**Feedback Mechanisms:**
- Surveys: [Frequency, target audience, key questions]
- Focus Groups: [Schedule, participants, topics]
- One-on-One Meetings: [Schedule, key stakeholders]

## Success Metrics

### Engagement Effectiveness
- Stakeholder Satisfaction Score: [Target and measurement method]
- Communication Effectiveness: [Metrics and targets]
- Participation Rates: [Meeting attendance, response rates]
- Issue Resolution Time: [Average time to resolve stakeholder concerns]

### Relationship Health
- Trust Indicators: [How to measure trust levels]
- Collaboration Quality: [Metrics for collaboration effectiveness]
- Influence Alignment: [How well stakeholder influence supports project]

## Monitoring and Control

### Regular Reviews
- Stakeholder Analysis Updates: [Monthly/quarterly review schedule]
- Engagement Strategy Effectiveness: [How to assess and adjust]
- New Stakeholder Identification: [Process for identifying new stakeholders]

### Escalation Procedures
- Issue Escalation: [When and how to escalate stakeholder issues]
- Conflict Resolution: [Process for resolving stakeholder conflicts]
- Communication Breakdowns: [How to address communication failures]

## Recommendations

### Immediate Actions
1. [Action 1]: [Description and timeline]
2. [Action 2]: [Description and timeline]
3. [Action 3]: [Description and timeline]

### Long-term Strategies
1. [Strategy 1]: [Description and implementation approach]
2. [Strategy 2]: [Description and implementation approach]
3. [Strategy 3]: [Description and implementation approach]

### Resource Requirements
- **Communication Support:** [Resources needed for communication activities]
- **Facilitation Support:** [Resources for meetings and workshops]
- **Technology Support:** [Tools and systems for stakeholder management]

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating actionable insights that enable effective stakeholder engagement and project success.`,
      generation_function: 'generateStakeholderAnalysis',
      contextPriority: 'high',
      metadata: {
        tags: ['stakeholder', 'analysis', 'engagement', 'management'],
        variables: [
          { name: 'projectName', type: 'string', required: true },
          { name: 'projectType', type: 'string', required: false },
          { name: 'description', type: 'string', required: true }
        ],
        layout: {
          sections: [
            'Executive Summary',
            'Stakeholder Identification',
            'Stakeholder Assessment',
            'Detailed Stakeholder Profiles',
            'Engagement Strategies',
            'Engagement Activities',
            'Success Metrics',
            'Monitoring and Control',
            'Recommendations'
          ]
        },
        emoji: '👥',
        priority: 1,
        source: 'database-seeded',
        author: 'ADPA-System',
        framework: 'pmbok',
        complexity: 'high',
        estimatedTime: '3-4 hours',
        dependencies: ['stakeholder-register'],
        version: '1.0.0'
      },
      version: 1,
      is_active: true,
      is_system: true,
      created_by: 'ADPA-System',
      created_at: new Date(),
      updated_at: new Date(),
      contextRequirements: ['project context', 'stakeholder information', 'organizational structure'],
      is_deleted: false
    });
    
    // Save the template
    await stakeholderAnalysisTemplate.save();
    
    console.log('✅ stakeholder-analysis template created successfully:');
    console.log(`   - Name: ${stakeholderAnalysisTemplate.name}`);
    console.log(`   - ID: ${stakeholderAnalysisTemplate._id}`);
    console.log(`   - Document Key: ${stakeholderAnalysisTemplate.documentKey}`);
    console.log(`   - Category: ${stakeholderAnalysisTemplate.category}`);
    console.log(`   - Active: ${stakeholderAnalysisTemplate.is_active}`);
    console.log(`   - AI Instructions Length: ${stakeholderAnalysisTemplate.ai_instructions.length} characters`);
    console.log(`   - Prompt Template Length: ${stakeholderAnalysisTemplate.prompt_template.length} characters`);
    
    console.log('\n🎉 Template seeding completed successfully!');
    console.log('========================================');
    console.log('✅ The stakeholder-analysis template is now available in the database');
    console.log('✅ Database-first generation should now work properly');
    console.log('✅ AI processing will use the template content and instructions');
    
  } catch (error) {
    console.error('❌ Error seeding template:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the seeding
seedStakeholderAnalysisTemplate().catch(console.error);
