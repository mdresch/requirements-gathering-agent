import * as fs from 'fs';
import * as path from 'path';

export interface TemplateDefinition {
  id: string;
  name: string;
  application: 'indesign' | 'illustrator' | 'photoshop' | 'docgen';
  filePath: string;
  documentTypes: string[];
  description: string;
  variables: string[];
  category: 'business' | 'technical' | 'visual' | 'compliance';
  tags: string[];
}

export interface DocumentAnalysis {
  type: string;
  confidence: number;
  recommendedTemplates: {
    indesign?: string;
    illustrator?: string[];
    photoshop?: string[];
    documentGeneration?: string;
  };
  visualElements: {
    hasCharts: boolean;
    hasTimelines: boolean;
    hasImages: boolean;
    hasScreenshots: boolean;
  };
  brandingRequired: boolean;
}

export class TemplateManager {
  private templatesPath: string;
  private templates: Map<string, TemplateDefinition> = new Map();
  
  constructor(templatesPath = './src/adobe/templates') {
    this.templatesPath = templatesPath;
    this.ensureDirectoryStructure();
    this.loadTemplates();
  }
  
  private ensureDirectoryStructure(): void {
    const directories = [
      path.join(this.templatesPath, 'indesign'),
      path.join(this.templatesPath, 'illustrator'),
      path.join(this.templatesPath, 'photoshop'),
      path.join(this.templatesPath, 'document-generation'),
      path.join(this.templatesPath, 'assets', 'branding'),
      path.join(this.templatesPath, 'assets', 'images'),
      path.join(this.templatesPath, 'assets', 'fonts')
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }
  
  private loadTemplates(): void {
    // Load existing templates from Phase 2 implementation
    const templateDefinitions: TemplateDefinition[] = [
      {
        id: 'project-charter-indesign',
        name: 'Project Charter (InDesign)',
        application: 'indesign',
        filePath: 'indesign/project-charter.idml',
        documentTypes: ['project-charter', 'project-plan'],
        description: 'Professional layout for project charter documents',
        variables: ['project_name', 'project_manager', 'start_date', 'end_date', 'budget'],
        category: 'business',
        tags: ['project', 'charter', 'business', 'formal']
      },
      {
        id: 'requirements-spec-indesign',
        name: 'Requirements Specification (InDesign)',
        application: 'indesign',
        filePath: 'indesign/requirements-specification.idml',
        documentTypes: ['requirements-specification', 'functional-requirements'],
        description: 'Technical requirements document with professional layout',
        variables: ['system_name', 'version', 'author', 'stakeholders'],
        category: 'technical',
        tags: ['requirements', 'technical', 'specification']
      },
      {
        id: 'project-timeline-illustrator',
        name: 'Project Timeline (Illustrator)',
        application: 'illustrator',
        filePath: 'illustrator/project-timeline.ai',
        documentTypes: ['project-timeline', 'milestones'],
        description: 'Visual timeline for project milestones and phases',
        variables: ['phases', 'milestones', 'dates', 'resources'],
        category: 'visual',
        tags: ['timeline', 'visual', 'milestones', 'chart']
      },
      {
        id: 'screenshot-enhancement-photoshop',
        name: 'Screenshot Enhancement (Photoshop)',
        application: 'photoshop',
        filePath: 'photoshop/screenshot-enhancement.psd',
        documentTypes: ['documentation', 'user-guide'],
        description: 'Professional enhancement for screenshots and diagrams',
        variables: ['image_source', 'callouts', 'annotations'],
        category: 'visual',
        tags: ['screenshot', 'enhancement', 'documentation']
      },
      {
        id: 'business-report-docgen',
        name: 'Business Report (Document Generation)',
        application: 'docgen',
        filePath: 'document-generation/business-report.xml',
        documentTypes: ['business-report', 'executive-summary'],
        description: 'Professional business report with data integration',
        variables: ['report_title', 'author', 'date', 'data_sources'],
        category: 'business',
        tags: ['report', 'business', 'data', 'executive']
      }
    ];
    
    templateDefinitions.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    console.log(`📚 Loaded ${this.templates.size} templates`);
  }
  
  analyzeDocument(content: string): DocumentAnalysis {
    // Analyze document content to determine type and recommended templates
    const analysis: DocumentAnalysis = {
      type: 'unknown',
      confidence: 0,
      recommendedTemplates: {},
      visualElements: {
        hasCharts: /chart|graph|diagram/.test(content.toLowerCase()),
        hasTimelines: /timeline|schedule|milestone|phase/.test(content.toLowerCase()),
        hasImages: /image|screenshot|figure|photo/.test(content.toLowerCase()),
        hasScreenshots: /screenshot|screen shot|ui|interface/.test(content.toLowerCase())
      },
      brandingRequired: true
    };
    
    // Document type detection
    if (/project.?charter|charter/i.test(content)) {
      analysis.type = 'project-charter';
      analysis.confidence = 0.9;
      analysis.recommendedTemplates.indesign = 'project-charter-indesign';
      if (analysis.visualElements.hasTimelines) {
        analysis.recommendedTemplates.illustrator = ['project-timeline-illustrator'];
      }
    } else if (/requirements?|specification|functional/i.test(content)) {
      analysis.type = 'requirements-specification';
      analysis.confidence = 0.85;
      analysis.recommendedTemplates.indesign = 'requirements-spec-indesign';
    } else if (/business.?report|executive.?summary/i.test(content)) {
      analysis.type = 'business-report';
      analysis.confidence = 0.8;
      analysis.recommendedTemplates.documentGeneration = 'business-report-docgen';
    }
    
    // Visual element recommendations
    if (analysis.visualElements.hasScreenshots) {
      analysis.recommendedTemplates.photoshop = ['screenshot-enhancement-photoshop'];
    }
    
    return analysis;
  }
  
  getTemplate(templateId: string): TemplateDefinition | null {
    return this.templates.get(templateId) || null;
  }
  
  getTemplatesByApplication(application: TemplateDefinition['application']): TemplateDefinition[] {
    return Array.from(this.templates.values()).filter(t => t.application === application);
  }
  
  getTemplatesByDocumentType(documentType: string): TemplateDefinition[] {
    return Array.from(this.templates.values()).filter(t => 
      t.documentTypes.includes(documentType)
    );
  }
  
  getTemplatesByCategory(category: TemplateDefinition['category']): TemplateDefinition[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }
  
  getAllTemplates(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }
  
  createTemplateFiles(): void {
    console.log('🔨 Creating template placeholder files...');
    
    this.templates.forEach(template => {
      const fullPath = path.join(this.templatesPath, template.filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (!fs.existsSync(fullPath)) {
        // Create placeholder template files
        const placeholder = this.generateTemplatePlaceholder(template);
        fs.writeFileSync(fullPath, placeholder);
        console.log(`📄 Created template: ${template.name}`);
      }
    });
    
    console.log('✅ Template files creation complete');
  }
  
  private generateTemplatePlaceholder(template: TemplateDefinition): string {
    const header = `<!-- Template: ${template.name} -->
<!-- Application: ${template.application} -->
<!-- Description: ${template.description} -->
<!-- Variables: ${template.variables.join(', ')} -->

`;
    
    switch (template.application) {
      case 'indesign':
        return header + `<?xml version="1.0" encoding="UTF-8"?>
<idml:Document xmlns:idml="http://ns.adobe.com/AdobeInDesign/idml/1.0">
  <!-- InDesign template placeholder for ${template.name} -->
  <idml:Story>
    <idml:ParagraphStyleRange>
      <idml:Content>${template.description}</idml:Content>
    </idml:ParagraphStyleRange>
  </idml:Story>
</idml:Document>`;
      
      case 'illustrator':
        return header + `<!-- Adobe Illustrator Template Placeholder -->
<!-- This would be an .ai file in production -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <text x="50" y="50" font-family="Arial" font-size="16">
    ${template.name} - Template Placeholder
  </text>
</svg>`;
      
      case 'photoshop':
        return header + `<!-- Adobe Photoshop Template Placeholder -->
<!-- This would be a .psd file in production -->
{
  "name": "${template.name}",
  "layers": [
    {
      "name": "Background",
      "type": "background"
    },
    {
      "name": "Content",
      "type": "text",
      "variables": ${JSON.stringify(template.variables)}
    }
  ]
}`;
      
      case 'docgen':
        return header + `<?xml version="1.0" encoding="UTF-8"?>
<template>
  <metadata>
    <name>${template.name}</name>
    <description>${template.description}</description>
  </metadata>
  <variables>
    ${template.variables.map(v => `<variable name="${v}"/>`).join('\\n    ')}
  </variables>
  <content>
    <section>Template content for ${template.name}</section>
  </content>
</template>`;
      
      default:
        return header + `Template placeholder for ${template.name}`;
    }
  }
  
  validateTemplates(): { valid: number; invalid: number; missing: number } {
    let valid = 0;
    let invalid = 0;
    let missing = 0;
    
    console.log('🔍 Validating templates...');
    
    this.templates.forEach(template => {
      const fullPath = path.join(this.templatesPath, template.filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ Missing: ${template.name}`);
        missing++;
      } else {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.length > 0) {
            console.log(`✅ Valid: ${template.name}`);
            valid++;
          } else {
            console.log(`⚠️  Empty: ${template.name}`);
            invalid++;
          }
        } catch (error) {
          console.log(`❌ Invalid: ${template.name}`);
          invalid++;
        }
      }
    });
    
    return { valid, invalid, missing };
  }
}

// Run template operations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new TemplateManager();
  
  console.log('📋 Available Templates:');
  manager.getAllTemplates().forEach(template => {
    console.log(`  - ${template.name} (${template.application})`);
  });
  
  console.log('\\n🔨 Creating template files...');
  manager.createTemplateFiles();
  
  console.log('\\n🔍 Validating templates...');
  const validation = manager.validateTemplates();
  console.log(`\\n📊 Validation Results:`);
  console.log(`  ✅ Valid: ${validation.valid}`);
  console.log(`  ❌ Invalid: ${validation.invalid}`);
  console.log(`  📄 Missing: ${validation.missing}`);
}
