/**
 * Brand Guidelines System
 * 
 * Provides centralized access to brand guidelines for consistent
 * styling across all Adobe Creative Suite generated documents.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface BrandGuidelines {
    version: string;
    brandName: string;
    colors: ColorSystem;
    typography: TypographySystem;
    spacing: SpacingSystem;
    layout: LayoutSystem;
    assets: AssetSystem;
    documentStyles: DocumentStyleSystem;
    templates: TemplateStyleSystem;
    visualizations: VisualizationStyleSystem;
    accessibility: AccessibilitySystem;
}

export interface ColorSystem {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    neutral: Record<string, string>;
    semantic: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}

export interface TypographySystem {
    headings: {
        fontFamily: string;
        fontWeight: string;
        lineHeight: number;
        letterSpacing: string;
    };
    body: {
        fontFamily: string;
        fontWeight: string;
        lineHeight: number;
        letterSpacing: string;
    };
    monospace: {
        fontFamily: string;
        fontWeight: string;
        lineHeight: number;
        letterSpacing: string;
    };
    sizes: Record<string, string>;
}

export interface SpacingSystem {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
}

export interface LayoutSystem {
    margins: {
        page: string;
        section: string;
        paragraph: string;
    };
    columns: {
        default: number;
        wide: number;
        newsletter: number;
    };
    paperSizes: {
        a4: { width: string; height: string };
        letter: { width: string; height: string };
    };
}

export interface AssetSystem {
    logoPath: string;
    logoVariants: {
        primary: string;
        white: string;
        monochrome: string;
    };
    watermark: string;
    backgrounds: {
        header: string;
        footer: string;
        cover: string;
    };
}

export interface DocumentStyleSystem {
    headers: Record<string, StyleProperties>;
    body: Record<string, StyleProperties>;
    code: Record<string, StyleProperties>;
    tables: Record<string, StyleProperties>;
    borders: Record<string, BorderProperties>;
}

export interface StyleProperties {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    marginTop?: string;
    marginBottom?: string;
    padding?: string;
    lineHeight?: number;
    borderRadius?: string;
    border?: string;
    textTransform?: string;
}

export interface BorderProperties {
    width: string;
    style: string;
    color: string;
}

export interface TemplateStyleSystem {
    projectCharter: {
        coverPage: StyleProperties;
        sectionHeaders: StyleProperties;
    };
    requirementsDoc: {
        coverPage: StyleProperties;
        requirementBlocks: StyleProperties;
    };
    technicalSpec: {
        coverPage: StyleProperties;
        codeBlocks: StyleProperties;
    };
}

export interface VisualizationStyleSystem {
    charts: {
        colorPalette: string[];
        gridColor: string;
        textColor: string;
        backgroundColor: string;
    };
    timelines: {
        milestoneColor: string;
        phaseColors: string[];
        connectionColor: string;
        textColor: string;
    };
    infographics: {
        primaryIcon: string;
        secondaryIcon: string;
        accentIcon: string;
        backgroundColor: string;
    };
}

export interface AccessibilitySystem {
    contrastRatios: Record<string, number>;
    fontSize: {
        minimum: string;
        recommended: string;
    };
}

export class BrandGuidelinesManager {
    private guidelines: BrandGuidelines | null = null;
    private guidelinesPath: string;

    constructor(guidelinesPath?: string) {
        this.guidelinesPath = guidelinesPath || path.join(process.cwd(), 'assets', 'branding', 'brand-guidelines.json');
    }

    /**
     * Load brand guidelines from JSON file
     */
    async loadGuidelines(): Promise<BrandGuidelines> {
        if (this.guidelines) {
            return this.guidelines;
        }

        try {
            const guidelinesContent = await fs.readFile(this.guidelinesPath, 'utf-8');
            this.guidelines = JSON.parse(guidelinesContent) as BrandGuidelines;
            return this.guidelines;
        } catch (error) {
            console.error('Failed to load brand guidelines:', error);
            throw new Error(`Failed to load brand guidelines from ${this.guidelinesPath}`);
        }
    }

    /**
     * Get complete brand guidelines
     */
    async getGuidelines(): Promise<BrandGuidelines> {
        return this.loadGuidelines();
    }

    /**
     * Get color system
     */
    async getColors(): Promise<ColorSystem> {
        const guidelines = await this.loadGuidelines();
        return guidelines.colors;
    }

    /**
     * Get typography system
     */
    async getTypography(): Promise<TypographySystem> {
        const guidelines = await this.loadGuidelines();
        return guidelines.typography;
    }

    /**
     * Get document styles for specific template type
     */
    async getTemplateStyles(templateType: keyof TemplateStyleSystem): Promise<any> {
        const guidelines = await this.loadGuidelines();
        return guidelines.templates[templateType];
    }

    /**
     * Get visualization color palette
     */
    async getVisualizationColors(): Promise<string[]> {
        const guidelines = await this.loadGuidelines();
        return guidelines.visualizations.charts.colorPalette;
    }

    /**
     * Get brand assets paths
     */
    async getAssets(): Promise<AssetSystem> {
        const guidelines = await this.loadGuidelines();
        return guidelines.assets;
    }

    /**
     * Generate CSS variables from brand guidelines
     */
    async generateCSSVariables(): Promise<string> {
        const guidelines = await this.loadGuidelines();
        const cssVariables: string[] = [];

        // Add colors
        cssVariables.push('/* Brand Colors */');
        cssVariables.push(`--color-primary: ${guidelines.colors.primary};`);
        cssVariables.push(`--color-primary-light: ${guidelines.colors.primaryLight};`);
        cssVariables.push(`--color-primary-dark: ${guidelines.colors.primaryDark};`);
        cssVariables.push(`--color-secondary: ${guidelines.colors.secondary};`);
        cssVariables.push(`--color-accent: ${guidelines.colors.accent};`);

        // Add neutral colors
        cssVariables.push('/* Neutral Colors */');
        Object.entries(guidelines.colors.neutral).forEach(([key, value]) => {
            cssVariables.push(`--color-neutral-${key}: ${value};`);
        });

        // Add typography
        cssVariables.push('/* Typography */');
        cssVariables.push(`--font-heading: ${guidelines.typography.headings.fontFamily};`);
        cssVariables.push(`--font-body: ${guidelines.typography.body.fontFamily};`);
        cssVariables.push(`--font-mono: ${guidelines.typography.monospace.fontFamily};`);

        // Add spacing
        cssVariables.push('/* Spacing */');
        Object.entries(guidelines.spacing).forEach(([key, value]) => {
            cssVariables.push(`--spacing-${key}: ${value};`);
        });

        return `:root {\n  ${cssVariables.join('\n  ')}\n}`;
    }

    /**
     * Generate Adobe Illustrator color swatches
     */
    async generateIllustratorSwatches(): Promise<any> {
        const guidelines = await this.loadGuidelines();
        
        return {
            name: guidelines.brandName,
            swatches: [
                { name: 'Primary', color: guidelines.colors.primary, type: 'CMYK' },
                { name: 'Secondary', color: guidelines.colors.secondary, type: 'CMYK' },
                { name: 'Accent', color: guidelines.colors.accent, type: 'CMYK' },
                { name: 'Success', color: guidelines.colors.semantic.success, type: 'CMYK' },
                { name: 'Warning', color: guidelines.colors.semantic.warning, type: 'CMYK' },
                { name: 'Error', color: guidelines.colors.semantic.error, type: 'CMYK' }
            ]
        };
    }

    /**
     * Generate InDesign paragraph styles
     */
    async generateInDesignStyles(): Promise<any> {
        const guidelines = await this.loadGuidelines();
        
        const styles = [];
        
        // Header styles
        Object.entries(guidelines.documentStyles.headers).forEach(([key, style]) => {
            styles.push({
                name: key.toUpperCase(),
                fontFamily: guidelines.typography.headings.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                color: style.color,
                marginTop: style.marginTop,
                marginBottom: style.marginBottom
            });
        });

        // Body styles
        styles.push({
            name: 'Body Text',
            fontFamily: guidelines.typography.body.fontFamily,
            fontSize: guidelines.documentStyles.body.paragraph.fontSize,
            lineHeight: guidelines.documentStyles.body.paragraph.lineHeight,
            color: guidelines.documentStyles.body.paragraph.color
        });

        return { styles };
    }

    /**
     * Validate brand compliance of colors
     */
    async validateColorCompliance(colors: string[]): Promise<{
        compliant: boolean;
        issues: string[];
        suggestions: string[];
    }> {
        const guidelines = await this.loadGuidelines();
        const approvedColors = [
            guidelines.colors.primary,
            guidelines.colors.primaryLight,
            guidelines.colors.primaryDark,
            guidelines.colors.secondary,
            guidelines.colors.secondaryLight,
            guidelines.colors.secondaryDark,
            guidelines.colors.accent,
            ...Object.values(guidelines.colors.neutral),
            ...Object.values(guidelines.colors.semantic)
        ];

        const issues: string[] = [];
        const suggestions: string[] = [];

        colors.forEach(color => {
            if (!approvedColors.includes(color.toUpperCase())) {
                issues.push(`Color ${color} is not in the approved brand palette`);
                
                // Find closest approved color (simplified)
                const closest = this.findClosestColor(color, approvedColors);
                suggestions.push(`Consider using ${closest} instead of ${color}`);
            }
        });

        return {
            compliant: issues.length === 0,
            issues,
            suggestions
        };
    }

    /**
     * Get style properties for specific element type
     */
    async getElementStyle(elementType: string, variant?: string): Promise<StyleProperties> {
        const guidelines = await this.loadGuidelines();
        
        const stylePath = variant ? `${elementType}.${variant}` : elementType;
        const pathParts = stylePath.split('.');
        
        let style: any = guidelines.documentStyles;
        for (const part of pathParts) {
            style = style[part];
            if (!style) {
                throw new Error(`Style not found: ${stylePath}`);
            }
        }

        return style as StyleProperties;
    }

    // Private helper methods

    private findClosestColor(targetColor: string, approvedColors: string[]): string {
        // Simplified color distance calculation
        // In a real implementation, this would use proper color space calculations
        return approvedColors[0]; // Return first approved color as fallback
    }

    /**
     * Save updated guidelines back to file
     */
    async saveGuidelines(guidelines: BrandGuidelines): Promise<void> {
        try {
            const guidelinesJSON = JSON.stringify(guidelines, null, 2);
            await fs.writeFile(this.guidelinesPath, guidelinesJSON, 'utf-8');
            this.guidelines = guidelines; // Update cached copy
        } catch (error) {
            console.error('Failed to save brand guidelines:', error);
            throw new Error('Failed to save brand guidelines');
        }
    }

    /**
     * Create a custom brand variation
     */
    async createBrandVariation(
        name: string,
        colorOverrides: Partial<ColorSystem>,
        typographyOverrides?: Partial<TypographySystem>
    ): Promise<BrandGuidelines> {
        const baseGuidelines = await this.loadGuidelines();
        
        const variation: BrandGuidelines = {
            ...baseGuidelines,
            brandName: `${baseGuidelines.brandName} - ${name}`,
            colors: { ...baseGuidelines.colors, ...colorOverrides },
            typography: typographyOverrides 
                ? { ...baseGuidelines.typography, ...typographyOverrides }
                : baseGuidelines.typography
        };

        return variation;
    }
}

// Export singleton instance
export const brandGuidelines = new BrandGuidelinesManager();
