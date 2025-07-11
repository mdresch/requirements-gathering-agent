#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔨 Setting up Adobe Creative Suite Phase 2 Templates');
console.log('===================================================');

// Create template directories
const templateDirs = [
  'src/adobe/templates',
  'src/adobe/templates/indesign', 
  'src/adobe/templates/illustrator',
  'src/adobe/templates/photoshop',
  'src/adobe/templates/document-generation',
  'src/adobe/templates/assets',
  'src/adobe/templates/assets/branding',
  'src/adobe/templates/assets/images',
  'src/adobe/templates/assets/fonts'
];

console.log('\\n📁 Creating template directories:');
templateDirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✅ Created: ${dir}`);
  } else {
    console.log(`  📁 Exists: ${dir}`);
  }
});

// Create template placeholder files
const templates = [
  {
    id: 'project-charter-indesign',
    name: 'Project Charter (InDesign)',
    file: 'src/adobe/templates/indesign/project-charter.idml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- InDesign Template: Project Charter -->
<!-- Variables: project_name, project_manager, start_date, end_date, budget -->
<idml:Document xmlns:idml="http://ns.adobe.com/AdobeInDesign/idml/1.0">
  <idml:Story>
    <idml:ParagraphStyleRange>
      <idml:Content>Project Charter Template - Professional Layout</idml:Content>
    </idml:ParagraphStyleRange>
  </idml:Story>
</idml:Document>`
  },
  {
    id: 'requirements-spec-indesign',
    name: 'Requirements Specification (InDesign)',
    file: 'src/adobe/templates/indesign/requirements-specification.idml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- InDesign Template: Requirements Specification -->
<!-- Variables: system_name, version, author, stakeholders -->
<idml:Document xmlns:idml="http://ns.adobe.com/AdobeInDesign/idml/1.0">
  <idml:Story>
    <idml:ParagraphStyleRange>
      <idml:Content>Requirements Specification Template - Technical Layout</idml:Content>
    </idml:ParagraphStyleRange>
  </idml:Story>
</idml:Document>`
  },
  {
    id: 'project-timeline-illustrator',
    name: 'Project Timeline (Illustrator)',
    file: 'src/adobe/templates/illustrator/project-timeline.ai',
    content: `<!-- Adobe Illustrator Template: Project Timeline -->
<!-- Variables: phases, milestones, dates, resources -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <title>Project Timeline Template</title>
  <text x="50" y="50" font-family="Arial" font-size="16">
    Project Timeline - Visual Timeline Template
  </text>
  <rect x="50" y="100" width="700" height="400" fill="none" stroke="#ccc"/>
</svg>`
  },
  {
    id: 'screenshot-enhancement-photoshop',
    name: 'Screenshot Enhancement (Photoshop)',
    file: 'src/adobe/templates/photoshop/screenshot-enhancement.psd',
    content: `{
  "name": "Screenshot Enhancement Template",
  "description": "Professional enhancement for screenshots and diagrams",
  "variables": ["image_source", "callouts", "annotations"],
  "layers": [
    {
      "name": "Background",
      "type": "background"
    },
    {
      "name": "Content",
      "type": "text",
      "variables": ["image_source", "callouts", "annotations"]
    },
    {
      "name": "Enhancements",
      "type": "effects"
    }
  ]
}`
  },
  {
    id: 'business-report-docgen',
    name: 'Business Report (Document Generation)',
    file: 'src/adobe/templates/document-generation/business-report.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Document Generation Template: Business Report -->
<!-- Variables: report_title, author, date, data_sources -->
<template>
  <metadata>
    <name>Business Report Template</name>
    <description>Professional business report with data integration</description>
  </metadata>
  <variables>
    <variable name="report_title"/>
    <variable name="author"/>
    <variable name="date"/>
    <variable name="data_sources"/>
  </variables>
  <content>
    <section>Business Report Template Content</section>
  </content>
</template>`
  }
];

console.log('\\n📄 Creating template files:');
templates.forEach(template => {
  const fullPath = path.join(projectRoot, template.file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, template.content);
    console.log(`  ✅ Created: ${template.name}`);
  } else {
    console.log(`  📄 Exists: ${template.name}`);
  }
});

// Create template registry
const registryPath = path.join(projectRoot, 'src/adobe/templates/template-registry.json');
const registry = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  templates: templates.map(t => ({
    id: t.id,
    name: t.name,
    file: t.file.replace('src/adobe/templates/', ''),
    type: t.file.includes('indesign') ? 'indesign' : 
          t.file.includes('illustrator') ? 'illustrator' :
          t.file.includes('photoshop') ? 'photoshop' : 'document-generation'
  }))
};

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log(`  ✅ Created: template-registry.json`);

console.log('\\n✅ Template setup complete!');
console.log('\\n📋 Summary:');
console.log(`  📁 Directories created: ${templateDirs.length}`);
console.log(`  📄 Template files created: ${templates.length}`);
console.log(`  📊 Template registry: 1 file`);

console.log('\\n🎯 Next steps:');
console.log('  1. Set up Adobe API credentials: node dist/adobe/setup-credentials.js');
console.log('  2. Test API connections: node dist/adobe/test-connections.js');
console.log('  3. Run status check: node scripts/adobe-phase2-status.js');
