/*
 * ADPA Professional Template Engine
 * Applies brand guidelines and templates to generate professional documents
 */

import { 
  DocumentTemplate, 
  BrandGuidelines, 
  ADPA_BRAND_GUIDELINES,
  generateBrandCSS,
  getBrandGuidelinesForDocument 
} from './brand-guidelines';
import { getDocumentTemplate } from './document-templates';

/**
 * Template Engine for Professional Document Generation
 */
export class ADPATemplateEngine {
  private brandGuidelines: BrandGuidelines;

  constructor(customBrandGuidelines?: Partial<BrandGuidelines>) {
    this.brandGuidelines = customBrandGuidelines 
      ? { ...ADPA_BRAND_GUIDELINES, ...customBrandGuidelines }
      : ADPA_BRAND_GUIDELINES;
  }

  /**
   * Generate professional HTML from markdown using template
   */
  async generateProfessionalHTML(
    markdownContent: string,
    templateName: string,
    variables: Record<string, string> = {}
  ): Promise<string> {
    const template = getDocumentTemplate(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const brandGuidelines = getBrandGuidelinesForDocument(templateName);
    const css = generateBrandCSS(brandGuidelines);
    
    // Parse markdown content into sections
    const parsedContent = this.parseMarkdownContent(markdownContent);
    
    // Apply template structure
    const structuredContent = this.applyTemplateStructure(parsedContent, template, variables);
    
    // Generate final HTML
    return this.generateHTML(structuredContent, css, template, variables);
  }

  /**
   * Parse markdown content into structured sections
   */
  private parseMarkdownContent(markdown: string): ParsedContent {
    const lines = markdown.split('\n');
    const sections: ContentSection[] = [];
    let currentSection: ContentSection | null = null;

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          level: headerMatch[1].length,
          title: headerMatch[2].trim(),
          content: []
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      } else {
        // Content before first header
        if (!sections.length) {
          sections.push({
            level: 0,
            title: 'Introduction',
            content: [line]
          });
        } else {
          sections[0].content.push(line);
        }
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      sections,
      metadata: this.extractMetadata(markdown)
    };
  }

  /**
   * Extract metadata from markdown frontmatter
   */
  private extractMetadata(markdown: string): Record<string, string> {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    const metadata: Record<string, string> = {};
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const lines = frontmatter.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          metadata[match[1]] = match[2].trim();
        }
      }
    }
    
    return metadata;
  }

  /**
   * Apply template structure to parsed content
   */
  private applyTemplateStructure(
    parsedContent: ParsedContent,
    template: DocumentTemplate,
    variables: Record<string, string>
  ): StructuredContent {
    const structuredSections: StructuredSection[] = [];
    
    for (const templateSection of template.sections) {
      // Find matching content section
      const contentSection = parsedContent.sections.find(
        section => this.matchesTemplateSection(section, templateSection)
      );
      
      if (contentSection || templateSection.required) {
        structuredSections.push({
          template: templateSection,
          content: contentSection || {
            level: templateSection.styling.headerLevel,
            title: templateSection.name,
            content: [templateSection.content.placeholder]
          }
        });
      }
    }
    
    return {
      sections: structuredSections,
      metadata: { ...parsedContent.metadata, ...variables },
      template
    };
  }

  /**
   * Check if content section matches template section
   */
  private matchesTemplateSection(
    contentSection: ContentSection,
    templateSection: any
  ): boolean {
    const titleLower = contentSection.title.toLowerCase();
    const templateNameLower = templateSection.name.toLowerCase();
    
    // Exact match
    if (titleLower === templateNameLower) return true;
    
    // Partial match
    if (titleLower.includes(templateNameLower) || templateNameLower.includes(titleLower)) {
      return true;
    }
    
    // Common variations
    const variations = {
      'executive summary': ['summary', 'overview', 'executive'],
      'project description': ['description', 'background', 'project'],
      'objectives': ['goals', 'objectives', 'aims'],
      'scope': ['scope', 'boundaries'],
      'stakeholders': ['stakeholders', 'participants', 'team'],
      'timeline': ['timeline', 'schedule', 'milestones'],
      'budget': ['budget', 'cost', 'financial'],
      'risks': ['risks', 'issues', 'challenges']
    };
    
    for (const [key, values] of Object.entries(variations)) {
      if (templateNameLower.includes(key)) {
        return values.some(value => titleLower.includes(value));
      }
    }
    
    return false;
  }

  /**
   * Generate final HTML document
   */
  private generateHTML(
    structuredContent: StructuredContent,
    css: string,
    template: DocumentTemplate,
    variables: Record<string, string>
  ): string {
    const { sections, metadata } = structuredContent;
    
    // Generate title
    const title = this.replaceVariables(
      metadata.title || template.name,
      { ...metadata, ...variables }
    );
    
    // Generate sections HTML
    const sectionsHTML = sections.map(section => 
      this.generateSectionHTML(section)
    ).join('\n\n');
    
    // Generate complete HTML document
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${css}
        
        /* Additional template-specific styles */
        .document-header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: ${this.brandGuidelines.colors.gradients.primary};
            color: white;
            border-radius: 8px;
        }
        
        .document-footer {
            margin-top: 3rem;
            padding: 1.5rem;
            background-color: ${this.brandGuidelines.colors.neutral.lightest};
            border-radius: 8px;
            font-size: 0.9em;
            color: ${this.brandGuidelines.colors.neutral.medium};
        }
        
        .section {
            margin-bottom: 2rem;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            .document-header {
                background: ${this.brandGuidelines.colors.primary} !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <h1>${title}</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Template:</strong> ${template.name}</p>
        <p><strong>Version:</strong> ${template.metadata.version}</p>
    </div>
    
    <main>
        ${sectionsHTML}
    </main>
    
    <div class="document-footer">
        <p><strong>Document generated by ADPA (Automated Documentation Project Assistant)</strong></p>
        <p>Professional formatting powered by ADPA Template Engine</p>
        <p>Template: ${template.name} v${template.metadata.version} | Generated: ${new Date().toISOString()}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for a single section
   */
  private generateSectionHTML(structuredSection: StructuredSection): string {
    const { template, content } = structuredSection;
    const headerTag = `h${template.styling.headerLevel}`;
    
    // Convert content to HTML
    const contentHTML = content.content
      .join('\n')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    const pageBreakClass = template.styling.pageBreak === 'before' ? ' page-break' : '';
    
    return `
<section class="section${pageBreakClass}" id="${template.id}">
    <${headerTag} style="color: ${template.styling.color}; margin-top: ${template.styling.spacing.before}; margin-bottom: ${template.styling.spacing.after};">
        ${content.title}
    </${headerTag}>
    <div class="section-content">
        <p>${contentHTML}</p>
    </div>
</section>`;
  }

  /**
   * Replace template variables in text
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}

// Interfaces for template engine
interface ParsedContent {
  sections: ContentSection[];
  metadata: Record<string, string>;
}

interface ContentSection {
  level: number;
  title: string;
  content: string[];
}

interface StructuredContent {
  sections: StructuredSection[];
  metadata: Record<string, string>;
  template: DocumentTemplate;
}

interface StructuredSection {
  template: any; // TemplateSection from brand-guidelines
  content: ContentSection;
}

/**
 * Create template engine instance
 */
export function createTemplateEngine(customBrandGuidelines?: Partial<BrandGuidelines>): ADPATemplateEngine {
  return new ADPATemplateEngine(customBrandGuidelines);
}

/**
 * Quick function to generate professional HTML from markdown
 */
export async function generateProfessionalDocument(
  markdownContent: string,
  templateName: string = 'project-charter',
  variables: Record<string, string> = {}
): Promise<string> {
  const engine = createTemplateEngine();
  return await engine.generateProfessionalHTML(markdownContent, templateName, variables);
}
