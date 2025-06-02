import { getAiSummaryAndGoals, getAiUserStories, getAiProjectCharter } from './index.js';
import { mkdir, writeFile } from 'fs/promises';

(async () => {
  // Ensure docs directory exists
  try {
    await mkdir('./docs', { recursive: true });
  } catch (err) {
    console.error('Error creating docs directory:', err);
  }

  console.log('Testing Requirements Gathering Agent functions...');
  
  const sampleContext = `
# Test Project
A SaaS platform for remote team collaboration

## Features
- Real-time chat functionality
- File sharing and storage
- Project management tools
- Team collaboration features

## Technology Stack
- Node.js backend
- React frontend
- PostgreSQL database
- WebSocket for real-time features
`;

  // Test AI Summary and Goals generation
  try {
    console.log('Testing getAiSummaryAndGoals...');
    const summary = await getAiSummaryAndGoals(sampleContext);
    if (summary) {
      console.log('✅ AI Summary generated successfully');
      await writeFile('./docs/test-summary.md', summary);
    } else {
      console.log('❌ AI Summary generation failed (likely missing API key)');
    }
  } catch (error) {
    console.log('❌ AI Summary generation error:', error.message);
  }

  // Test AI User Stories generation
  try {
    console.log('Testing getAiUserStories...');
    const userStories = await getAiUserStories(sampleContext);
    if (userStories) {
      console.log('✅ AI User Stories generated successfully');
      await writeFile('./docs/test-user-stories.md', userStories);
    } else {
      console.log('❌ AI User Stories generation failed (likely missing API key)');
    }
  } catch (error) {
    console.log('❌ AI User Stories generation error:', error.message);
  }

  // Test AI Project Charter generation
  try {
    console.log('Testing getAiProjectCharter...');
    const charter = await getAiProjectCharter({
      summaryAndGoals: 'Sample project summary',
      strategicStatements: 'Sample strategic statements',
      coreValuesAndPurpose: 'Sample core values',
      keyRolesAndNeeds: 'Sample roles and needs',
      riskAnalysis: 'Sample risk analysis',
      personas: 'Sample personas',
      techStackAnalysis: 'Sample tech analysis'
    });
    if (charter) {
      console.log('✅ AI Project Charter generated successfully');
      await writeFile('./docs/test-project-charter.md', charter);
    } else {
      console.log('❌ AI Project Charter generation failed (likely missing API key)');
    }
  } catch (error) {
    console.log('❌ AI Project Charter generation error:', error.message);
  }

  // Write some sample documentation to demonstrate directory structure
  const sampleDocs = [
    {
      file: './docs/sample-tech-stack.md',
      content: `# Technology Stack\n\n- Node.js\n- React\n- PostgreSQL\n- WebSocket`
    },
    {
      file: './docs/sample-requirements.md', 
      content: `# Sample Requirements\n\n## Functional Requirements\n- Real-time messaging\n- File upload/download\n- Project management\n\n## Non-Functional Requirements\n- Performance\n- Security\n- Scalability`
    }
  ];

  for (const doc of sampleDocs) {
    try {
      await writeFile(doc.file, doc.content);
      console.log(`✅ Created ${doc.file}`);
    } catch (error) {
      console.log(`❌ Failed to create ${doc.file}:`, error.message);
    }
  }

  console.log('\n✅ Test completed! Check ./docs/ directory for generated files.');
  console.log('Note: AI functions require valid API keys to generate content.');
  console.log('📁 Directory structure created in project root as expected.');
})();
