import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemplateModel } from '../models/Template.model.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const templatesPath = path.join(__dirname, '../data/templates.json');

// Helper function to read templates
function readTemplates(): any[] {
  try {
    const raw = fs.readFileSync(templatesPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read templates:', err);
    return [];
  }
}

// Helper function to write templates
function writeTemplates(templates: any[]): boolean {
  try {
    fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write templates:', err);
    return false;
  }
}

// GET /api/v1/templates?page=1&limit=20
router.get('/', async (req, res) => {
  try {
    logger.info('📋 Fetching templates from MongoDB database...');
    
    // Try to get templates from MongoDB first
    const dbTemplates = await TemplateModel.find({ is_active: true }).sort({ created_at: -1 });
    
    if (dbTemplates && dbTemplates.length > 0) {
      logger.info(`✅ Found ${dbTemplates.length} templates in MongoDB`);
      
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paged = dbTemplates.slice(start, end);
      
      // Transform MongoDB templates to match expected format
      const transformedTemplates = paged.map((template: any) => ({
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        category: template.category,
        fields: template.metadata?.variables || [],
        contextRequirements: template.metadata?.contextRequirements || template.contextRequirements || [],
        dependencies: template.metadata?.dependencies || [],
        aiInstructions: template.ai_instructions,
        promptTemplate: template.prompt_template,
        isActive: template.is_active,
        version: template.version,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        metadata: {
          ...template.metadata,
          dependencies: template.metadata?.dependencies || [],
          contextRequirements: template.metadata?.contextRequirements || template.contextRequirements || [],
          complexity: template.metadata?.complexity || 'medium',
          estimatedTime: template.metadata?.estimatedTime || '2-3 hours',
          pmbokKnowledgeArea: template.metadata?.pmbokKnowledgeArea || 'General',
          complianceStandards: template.metadata?.complianceStandards || []
        }
      }));
      
      res.json({
        page,
        limit,
        total: dbTemplates.length,
        templates: transformedTemplates
      });
    } else {
      logger.warn('⚠️ No templates found in MongoDB, falling back to JSON file');
      
      // Fallback to JSON file if no MongoDB templates
      const templates = readTemplates();
      
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paged = templates.slice(start, end);

      res.json({
        page,
        limit,
        total: templates.length,
        templates: paged
      });
    }
  } catch (error) {
    logger.error('❌ Error fetching templates from MongoDB:', error);
    
    // Fallback to JSON file on error
    const templates = readTemplates();
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = templates.slice(start, end);

    res.json({
      page,
      limit,
      total: templates.length,
      templates: paged
    });
  }
});

// GET /api/v1/templates/:id
router.get('/:id', (req, res) => {
  const templates = readTemplates();
  const templateId = req.params.id;
  const template = templates.find(t => t.id.toString() === templateId);
  
  if (!template) {
    return res.status(404).json({ 
      success: false,
      error: 'Template not found' 
    });
  }
  
  res.json({
    success: true,
    data: template
  });
});

// POST /api/v1/templates
router.post('/', (req, res) => {
  const templates = readTemplates();
  const newTemplate = {
    id: Math.max(...templates.map(t => parseInt(t.id.toString())), 0) + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  
  if (writeTemplates(templates)) {
    res.status(201).json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save template'
    });
  }
});

// PUT /api/v1/templates/:id
router.put('/:id', (req, res) => {
  const templates = readTemplates();
  const templateId = req.params.id;
  const templateIndex = templates.findIndex(t => t.id.toString() === templateId);
  
  if (templateIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Template not found' 
    });
  }
  
  // Update the template
  templates[templateIndex] = {
    ...templates[templateIndex],
    ...req.body,
    id: templates[templateIndex].id, // Keep original ID
    updatedAt: new Date().toISOString()
  };
  
  if (writeTemplates(templates)) {
    res.json({
      success: true,
      data: templates[templateIndex],
      message: 'Template updated successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save template'
    });
  }
});

// DELETE /api/v1/templates/:id
router.delete('/:id', (req, res) => {
  const templates = readTemplates();
  const templateId = req.params.id;
  const templateIndex = templates.findIndex(t => t.id.toString() === templateId);
  
  if (templateIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Template not found' 
    });
  }
  
  templates.splice(templateIndex, 1);
  
  if (writeTemplates(templates)) {
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete template'
    });
  }
});

export default router;
