/*
 * ADPA Brand Guidelines and Template System
 * Professional branding standards for consistent document presentation
 */

/**
 * ADPA Corporate Brand Guidelines
 * These colors, fonts, and styling rules ensure consistent professional appearance
 */
export interface BrandGuidelines {
  colors: BrandColors;
  typography: BrandTypography;
  spacing: BrandSpacing;
  logos: BrandLogos;
  templates: BrandTemplates;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  neutral: {
    lightest: string;
    light: string;
    medium: string;
    dark: string;
    darkest: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    hero: string;
  };
}

export interface BrandTypography {
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  sizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
    caption: string;
  };
  weights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface BrandSpacing {
  margins: {
    page: string;
    section: string;
    paragraph: string;
  };
  padding: {
    small: string;
    medium: string;
    large: string;
  };
  gaps: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface BrandLogos {
  primary: {
    svg: string;
    png: string;
    dimensions: { width: number; height: number };
  };
  secondary: {
    svg: string;
    png: string;
    dimensions: { width: number; height: number };
  };
  watermark: {
    svg: string;
    opacity: number;
  };
}

export interface BrandTemplates {
  documentTypes: {
    [key: string]: DocumentTemplate;
  };
  layouts: {
    [key: string]: LayoutTemplate;
  };
  components: {
    [key: string]: ComponentTemplate;
  };
}

export interface DocumentTemplate {
  name: string;
  description: string;
  category: 'project-management' | 'technical' | 'business' | 'presentation';
  layout: string;
  sections: TemplateSection[];
  styling: TemplateStyling;
  metadata: TemplateMetadata;
}

export interface TemplateSection {
  id: string;
  name: string;
  required: boolean;
  order: number;
  styling: SectionStyling;
  content: {
    placeholder: string;
    format: 'markdown' | 'html' | 'text';
  };
}

export interface TemplateStyling {
  colors: Partial<BrandColors>;
  typography: Partial<BrandTypography>;
  spacing: Partial<BrandSpacing>;
  layout: {
    columns: number;
    pageBreaks: boolean;
    headerFooter: boolean;
  };
}

export interface SectionStyling {
  headerLevel: 1 | 2 | 3 | 4;
  color: string;
  spacing: {
    before: string;
    after: string;
  };
  pageBreak: 'auto' | 'before' | 'after' | 'avoid';
}

export interface LayoutTemplate {
  name: string;
  columns: number;
  margins: string;
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'Letter' | 'Legal';
  headerHeight: string;
  footerHeight: string;
}

export interface ComponentTemplate {
  name: string;
  type: 'header' | 'footer' | 'titlePage' | 'tableOfContents' | 'section' | 'table';
  html: string;
  css: string;
  variables: string[];
}

export interface TemplateMetadata {
  version: string;
  author: string;
  created: string;
  updated: string;
  tags: string[];
  compatibility: {
    adobe: string[];
    office: string[];
  };
}

/**
 * ADPA Default Brand Guidelines
 * Professional corporate branding for all ADPA documents
 */
export const ADPA_BRAND_GUIDELINES: BrandGuidelines = {
  colors: {
    primary: '#2E86AB',      // Professional Blue
    secondary: '#A23B72',    // Corporate Magenta
    accent: '#F18F01',       // Energetic Orange
    danger: '#C73E1D',       // Alert Red
    success: '#28A745',      // Success Green
    warning: '#FFC107',      // Warning Yellow
    neutral: {
      lightest: '#F8F9FA',
      light: '#E9ECEF',
      medium: '#6C757D',
      dark: '#343A40',
      darkest: '#212529'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2E86AB 0%, #A23B72 100%)',
      secondary: 'linear-gradient(135deg, #A23B72 0%, #F18F01 100%)',
      hero: 'linear-gradient(135deg, #2E86AB 0%, #A23B72 50%, #F18F01 100%)'
    }
  },
  typography: {
    fonts: {
      primary: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      secondary: '"Times New Roman", Times, serif',
      monospace: '"Courier New", Courier, monospace'
    },
    sizes: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.5rem',
      h4: '1.25rem',
      body: '1rem',
      small: '0.875rem',
      caption: '0.75rem'
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.6,
      relaxed: 1.8
    }
  },
  spacing: {
    margins: {
      page: '2.5cm',
      section: '1.5rem',
      paragraph: '1rem'
    },
    padding: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem'
    },
    gaps: {
      tight: '0.5rem',
      normal: '1rem',
      wide: '2rem'
    }
  },
  logos: {
    primary: {
      svg: '/assets/adpa-logo-primary.svg',
      png: '/assets/adpa-logo-primary.png',
      dimensions: { width: 200, height: 60 }
    },
    secondary: {
      svg: '/assets/adpa-logo-secondary.svg',
      png: '/assets/adpa-logo-secondary.png',
      dimensions: { width: 150, height: 45 }
    },
    watermark: {
      svg: '/assets/adpa-watermark.svg',
      opacity: 0.1
    }
  },
  templates: {
    documentTypes: {},
    layouts: {},
    components: {}
  }
};

/**
 * Get brand guidelines for specific document type
 */
export function getBrandGuidelinesForDocument(documentType: string): BrandGuidelines {
  // Return customized brand guidelines based on document type
  const guidelines = { ...ADPA_BRAND_GUIDELINES };
  
  switch (documentType) {
    case 'project-charter':
      guidelines.colors.primary = '#2E86AB';
      break;
    case 'technical-specification':
      guidelines.colors.primary = '#A23B72';
      break;
    case 'business-requirements':
      guidelines.colors.primary = '#F18F01';
      break;
    default:
      // Use default guidelines
      break;
  }
  
  return guidelines;
}

/**
 * Generate CSS from brand guidelines
 */
export function generateBrandCSS(guidelines: BrandGuidelines): string {
  return `
    :root {
      --color-primary: ${guidelines.colors.primary};
      --color-secondary: ${guidelines.colors.secondary};
      --color-accent: ${guidelines.colors.accent};
      --color-success: ${guidelines.colors.success};
      --color-warning: ${guidelines.colors.warning};
      --color-danger: ${guidelines.colors.danger};
      
      --font-primary: ${guidelines.typography.fonts.primary};
      --font-secondary: ${guidelines.typography.fonts.secondary};
      --font-monospace: ${guidelines.typography.fonts.monospace};
      
      --size-h1: ${guidelines.typography.sizes.h1};
      --size-h2: ${guidelines.typography.sizes.h2};
      --size-h3: ${guidelines.typography.sizes.h3};
      --size-h4: ${guidelines.typography.sizes.h4};
      --size-body: ${guidelines.typography.sizes.body};
      
      --spacing-page: ${guidelines.spacing.margins.page};
      --spacing-section: ${guidelines.spacing.margins.section};
      --spacing-paragraph: ${guidelines.spacing.margins.paragraph};
    }
    
    body {
      font-family: var(--font-primary);
      font-size: var(--size-body);
      line-height: ${guidelines.typography.lineHeights.normal};
      color: ${guidelines.colors.neutral.darkest};
      margin: var(--spacing-page);
    }
    
    h1 {
      color: var(--color-primary);
      font-size: var(--size-h1);
      font-weight: ${guidelines.typography.weights.bold};
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: 10px;
      margin-top: var(--spacing-section);
      margin-bottom: var(--spacing-paragraph);
    }
    
    h2 {
      color: var(--color-secondary);
      font-size: var(--size-h2);
      font-weight: ${guidelines.typography.weights.semibold};
      margin-top: var(--spacing-section);
      margin-bottom: var(--spacing-paragraph);
    }
    
    h3 {
      color: var(--color-accent);
      font-size: var(--size-h3);
      font-weight: ${guidelines.typography.weights.medium};
      margin-top: var(--spacing-paragraph);
      margin-bottom: calc(var(--spacing-paragraph) * 0.5);
    }
  `;
}
