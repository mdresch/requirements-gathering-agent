import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'requirements-gathering-agent';

// Mock the TemplateConverter (simplified version)
class TemplateConverter {
  static fromDatabase(dbTemplate) {
    return {
      id: dbTemplate._id?.toString() || dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description || '',
      category: dbTemplate.category,
      documentKey: dbTemplate.documentKey || '',
      templateType: dbTemplate.template_type || 'basic',
      content: {
        aiInstructions: dbTemplate.ai_instructions || '',
        promptTemplate: dbTemplate.prompt_template || '',
        variables: dbTemplate.metadata?.variables || [],
        layout: dbTemplate.metadata?.layout
      },
      metadata: {
        tags: dbTemplate.metadata?.tags || [],
        priority: dbTemplate.metadata?.priority || 100,
        emoji: dbTemplate.metadata?.emoji || '📄',
        source: dbTemplate.metadata?.source || 'unknown',
        contextPriority: dbTemplate.contextPriority || 'medium',
        author: dbTemplate.metadata?.author,
        framework: dbTemplate.metadata?.framework,
        complexity: dbTemplate.metadata?.complexity,
        estimatedTime: dbTemplate.metadata?.estimatedTime,
        dependencies: dbTemplate.metadata?.dependencies,
        version: dbTemplate.metadata?.version
      },
      version: dbTemplate.version || 1,
      isActive: dbTemplate.is_active !== false,
      isSystem: dbTemplate.is_system === true,
      createdBy: dbTemplate.created_by || 'unknown',
      createdAt: dbTemplate.created_at || new Date(),
      updatedAt: dbTemplate.updated_at || new Date()
    };
  }

  static toApiResponse(unifiedTemplate) {
    return {
      id: unifiedTemplate.id,
      name: unifiedTemplate.name,
      description: unifiedTemplate.description,
      category: unifiedTemplate.category,
      documentKey: unifiedTemplate.documentKey,
      tags: unifiedTemplate.metadata.tags,
      templateData: {
        content: unifiedTemplate.content.promptTemplate,
        aiInstructions: unifiedTemplate.content.aiInstructions,
        variables: unifiedTemplate.content.variables,
        layout: unifiedTemplate.content.layout
      },
      metadata: {
        tags: unifiedTemplate.metadata.tags,
        priority: unifiedTemplate.metadata.priority,
        emoji: unifiedTemplate.metadata.emoji,
        source: unifiedTemplate.metadata.source,
        contextPriority: unifiedTemplate.metadata.contextPriority,
        author: unifiedTemplate.metadata.author,
        framework: unifiedTemplate.metadata.framework,
        complexity: unifiedTemplate.metadata.complexity,
        estimatedTime: unifiedTemplate.metadata.estimatedTime,
        dependencies: unifiedTemplate.metadata.dependencies,
        version: unifiedTemplate.metadata.version
      },
      version: unifiedTemplate.version,
      isActive: unifiedTemplate.isActive,
      isSystem: unifiedTemplate.isSystem,
      createdBy: unifiedTemplate.createdBy,
      createdAt: unifiedTemplate.createdAt,
      updatedAt: unifiedTemplate.updatedAt
    };
  }
}

async function testTemplateConversion() {
  console.log('🧪 Testing Template Conversion...');
  
  try {
    // Connect to database
    const connectionUri = MONGODB_URI.includes('?') 
      ? `${MONGODB_URI}&dbName=${MONGODB_DATABASE}`
      : `${MONGODB_URI}${MONGODB_DATABASE}`;
    
    await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    
    // Get templates using the same query as the repository
    console.log('\n📊 Getting templates from database...');
    const repositoryQuery = {
      is_active: true,
      is_deleted: { $ne: true }
    };
    const templates = await db.collection('templates').find(repositoryQuery).limit(3).toArray();
    console.log(`   Found ${templates.length} templates`);

    if (templates.length > 0) {
      console.log('\n🔄 Testing conversion process...');
      
      // Test the conversion process
      const apiTemplates = templates.map((template) => {
        console.log(`   Converting template: ${template.name}`);
        try {
          const unifiedTemplate = TemplateConverter.fromDatabase(template);
          console.log(`   ✅ Unified template created: ${unifiedTemplate.name}`);
          
          const apiResponse = TemplateConverter.toApiResponse(unifiedTemplate);
          console.log(`   ✅ API response created: ${apiResponse.name}`);
          
          return apiResponse;
        } catch (error) {
          console.error(`   ❌ Error converting template ${template.name}:`, error);
          return null;
        }
      }).filter(template => template !== null);

      console.log(`\n📊 Conversion Results:`);
      console.log(`   Input templates: ${templates.length}`);
      console.log(`   Output templates: ${apiTemplates.length}`);
      
      if (apiTemplates.length > 0) {
        console.log('\n📄 Sample API Response:');
        console.log(JSON.stringify(apiTemplates[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error testing template conversion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
  }
}

testTemplateConversion();
