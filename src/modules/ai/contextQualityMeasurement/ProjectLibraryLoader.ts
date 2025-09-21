/**
 * Project Library Loader
 * Loads entire project libraries into large context windows for comprehensive document generation
 * 
 * This module enables the utilization of 1M+ token context windows by intelligently
 * loading and organizing project files for maximum context utilization.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface ProjectFile {
    path: string;
    content: string;
    tokens: number;
    priority: number;
    category: string;
    lastModified: Date;
    dependencies: string[];
}

export interface ProjectLibrary {
    files: ProjectFile[];
    totalTokens: number;
    totalFiles: number;
    categories: Map<string, ProjectFile[]>;
    dependencies: Map<string, string[]>;
    summary: {
        sourceCodeFiles: number;
        documentationFiles: number;
        configurationFiles: number;
        templateFiles: number;
        dataFiles: number;
    };
}

export interface LibraryLoadOptions {
    maxTokens?: number;
    includePatterns?: string[];
    excludePatterns?: string[];
    prioritizeRecent?: boolean;
    includeDependencies?: boolean;
    categoryWeights?: Map<string, number>;
    minFileSize?: number;
    maxFileSize?: number;
}

export class ProjectLibraryLoader {
    private static instance: ProjectLibraryLoader;
    private loadedLibraries: Map<string, ProjectLibrary> = new Map();
    
    // Default file patterns for different categories
    private readonly defaultIncludePatterns = [
        '**/*.md',           // Documentation
        '**/*.ts',           // TypeScript source
        '**/*.js',           // JavaScript source
        '**/*.json',         // Configuration
        '**/*.yaml',         // YAML configs
        '**/*.yml',          // YAML configs
        '**/*.txt',          // Text files
        '**/*.csv',          // Data files
        '**/README*',        // README files
        '**/CHANGELOG*',     // Changelog files
        '**/LICENSE*',       // License files
        '**/package.json',   // Package configs
        '**/tsconfig.json',  // TypeScript configs
        '**/jest.config.*',  // Test configs
        '**/webpack.config.*', // Build configs
        '**/*.env*',         // Environment files
        '**/docs/**/*',      // Documentation directory
        '**/src/**/*',       // Source code directory
        '**/templates/**/*', // Template files
        '**/data/**/*',      // Data files
        '**/examples/**/*',  // Example files
        '**/tests/**/*',     // Test files
        '**/scripts/**/*'    // Script files
    ];

    private readonly defaultExcludePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/bin/**',
        '**/obj/**',
        '**/*.log',
        '**/*.tmp',
        '**/*.cache',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/pnpm-lock.yaml',
        '**/.DS_Store',
        '**/Thumbs.db'
    ];

    // Category weights for prioritization
    private readonly defaultCategoryWeights = new Map([
        ['documentation', 1.0],
        ['source_code', 0.9],
        ['configuration', 0.8],
        ['templates', 0.9],
        ['data', 0.7],
        ['tests', 0.6],
        ['scripts', 0.5],
        ['examples', 0.6]
    ]);

    constructor() {
        if (ProjectLibraryLoader.instance) {
            return ProjectLibraryLoader.instance;
        }
        ProjectLibraryLoader.instance = this;
    }

    static getInstance(): ProjectLibraryLoader {
        if (!ProjectLibraryLoader.instance) {
            ProjectLibraryLoader.instance = new ProjectLibraryLoader();
        }
        return ProjectLibraryLoader.instance;
    }

    /**
     * Load entire project library for large context windows
     */
    async loadProjectLibrary(
        projectPath: string,
        options: LibraryLoadOptions = {}
    ): Promise<ProjectLibrary> {
        const cacheKey = `${projectPath}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.loadedLibraries.has(cacheKey)) {
            console.log(`📚 Using cached project library for ${projectPath}`);
            return this.loadedLibraries.get(cacheKey)!;
        }

        console.log(`📚 Loading project library: ${projectPath}`);
        console.log(`🎯 Target tokens: ${options.maxTokens?.toLocaleString() || 'unlimited'}`);

        const startTime = Date.now();
        
        // Configure options
        const config = this.configureOptions(options);
        
        // Discover and categorize files
        const discoveredFiles = await this.discoverProjectFiles(projectPath, config);
        console.log(`🔍 Discovered ${discoveredFiles.length} files`);
        
        // Prioritize and filter files
        const prioritizedFiles = await this.prioritizeFiles(discoveredFiles, config);
        console.log(`⭐ Prioritized ${prioritizedFiles.length} files`);
        
        // Load file contents within token limits
        const loadedFiles = await this.loadFileContents(prioritizedFiles, config);
        console.log(`📄 Loaded ${loadedFiles.length} files`);
        
        // Build project library
        const library = await this.buildProjectLibrary(loadedFiles, projectPath);
        
        const endTime = Date.now();
        console.log(`✅ Project library loaded in ${(endTime - startTime)}ms`);
        console.log(`📊 Total: ${library.totalFiles} files, ${library.totalTokens.toLocaleString()} tokens`);
        
        // Cache the result
        this.loadedLibraries.set(cacheKey, library);
        
        return library;
    }

    /**
     * Load project library optimized for specific document types
     */
    async loadOptimizedLibrary(
        projectPath: string,
        documentType: string,
        maxTokens: number = 1000000
    ): Promise<ProjectLibrary> {
        console.log(`🎯 Loading optimized library for ${documentType} (${maxTokens.toLocaleString()} tokens)`);
        
        // Define document-specific optimization strategies
        const optimizationStrategies = this.getOptimizationStrategies(documentType);
        
        const options: LibraryLoadOptions = {
            maxTokens,
            includePatterns: optimizationStrategies.includePatterns,
            excludePatterns: optimizationStrategies.excludePatterns,
            categoryWeights: optimizationStrategies.categoryWeights,
            prioritizeRecent: true,
            includeDependencies: true
        };
        
        return await this.loadProjectLibrary(projectPath, options);
    }

    /**
     * Convert project library to context string
     */
    async libraryToContext(
        library: ProjectLibrary,
        options: {
            format?: 'structured' | 'concatenated' | 'summarized';
            maxTokens?: number;
            includeMetadata?: boolean;
            groupByCategory?: boolean;
        } = {}
    ): Promise<string> {
        const {
            format = 'structured',
            maxTokens,
            includeMetadata = true,
            groupByCategory = true
        } = options;

        console.log(`🔄 Converting library to context (${format} format)`);

        switch (format) {
            case 'structured':
                return this.createStructuredContext(library, maxTokens, includeMetadata, groupByCategory);
            case 'concatenated':
                return this.createConcatenatedContext(library, maxTokens, includeMetadata);
            case 'summarized':
                return this.createSummarizedContext(library, maxTokens);
            default:
                throw new Error(`Unknown format: ${format}`);
        }
    }

    /**
     * Get library statistics
     */
    getLibraryStats(library: ProjectLibrary): {
        totalFiles: number;
        totalTokens: number;
        categoryBreakdown: Record<string, number>;
        tokenBreakdown: Record<string, number>;
        averageFileSize: number;
        largestFiles: Array<{ path: string; tokens: number }>;
    } {
        const categoryBreakdown: Record<string, number> = {};
        const tokenBreakdown: Record<string, number> = {};
        
        library.files.forEach(file => {
            categoryBreakdown[file.category] = (categoryBreakdown[file.category] || 0) + 1;
            tokenBreakdown[file.category] = (tokenBreakdown[file.category] || 0) + file.tokens;
        });

        const largestFiles = library.files
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, 10)
            .map(file => ({ path: file.path, tokens: file.tokens }));

        return {
            totalFiles: library.totalFiles,
            totalTokens: library.totalTokens,
            categoryBreakdown,
            tokenBreakdown,
            averageFileSize: library.totalTokens / library.totalFiles,
            largestFiles
        };
    }

    /**
     * Configure loading options
     */
    private configureOptions(options: LibraryLoadOptions): Required<LibraryLoadOptions> {
        return {
            maxTokens: options.maxTokens || 1000000,
            includePatterns: options.includePatterns || this.defaultIncludePatterns,
            excludePatterns: options.excludePatterns || this.defaultExcludePatterns,
            prioritizeRecent: options.prioritizeRecent ?? true,
            includeDependencies: options.includeDependencies ?? true,
            categoryWeights: options.categoryWeights || this.defaultCategoryWeights,
            minFileSize: options.minFileSize || 10,
            maxFileSize: options.maxFileSize || 50000
        };
    }

    /**
     * Discover project files
     */
    private async discoverProjectFiles(
        projectPath: string,
        config: Required<LibraryLoadOptions>
    ): Promise<Array<{ path: string; category: string; priority: number; lastModified: Date }>> {
        const discoveredFiles: Array<{ path: string; category: string; priority: number; lastModified: Date }> = [];

        for (const pattern of config.includePatterns) {
            try {
                const files = await glob(pattern, {
                    cwd: projectPath,
                    ignore: config.excludePatterns,
                    nodir: true
                });

                for (const file of files) {
                    const fullPath = path.join(projectPath, file);
                    const stats = await fs.stat(fullPath);
                    
                    // Check file size constraints
                    if (stats.size < config.minFileSize || stats.size > config.maxFileSize) {
                        continue;
                    }

                    const category = this.categorizeFile(file);
                    const priority = this.calculateFilePriority(file, category, config.categoryWeights);
                    
                    discoveredFiles.push({
                        path: file,
                        category,
                        priority,
                        lastModified: stats.mtime
                    });
                }
            } catch (error) {
                console.warn(`⚠️  Error processing pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        return discoveredFiles;
    }

    /**
     * Categorize file based on path and extension
     */
    private categorizeFile(filePath: string): string {
        const path = filePath.toLowerCase();
        const ext = path.split('.').pop() || '';

        if (path.includes('docs/') || path.includes('documentation/') || ext === 'md') {
            return 'documentation';
        }
        if (path.includes('src/') || ['ts', 'js', 'tsx', 'jsx'].includes(ext)) {
            return 'source_code';
        }
        if (['json', 'yaml', 'yml', 'toml', 'ini'].includes(ext) || path.includes('config/')) {
            return 'configuration';
        }
        if (path.includes('templates/') || path.includes('template/')) {
            return 'templates';
        }
        if (['csv', 'tsv', 'xml'].includes(ext) || path.includes('data/')) {
            return 'data';
        }
        if (path.includes('test/') || path.includes('tests/') || path.includes('spec/')) {
            return 'tests';
        }
        if (path.includes('scripts/') || path.includes('script/') || ext === 'sh') {
            return 'scripts';
        }
        if (path.includes('examples/') || path.includes('example/')) {
            return 'examples';
        }

        return 'other';
    }

    /**
     * Calculate file priority based on various factors
     */
    private calculateFilePriority(
        filePath: string,
        category: string,
        categoryWeights: Map<string, number>
    ): number {
        let priority = categoryWeights.get(category) || 0.5;

        // Boost priority for important files
        const importantFiles = [
            'readme', 'changelog', 'license', 'package.json', 'tsconfig.json',
            'jest.config', 'webpack.config', 'main', 'index', 'app'
        ];

        const fileName = path.basename(filePath).toLowerCase();
        for (const important of importantFiles) {
            if (fileName.includes(important)) {
                priority += 0.3;
                break;
            }
        }

        // Boost priority for root-level files
        if (!filePath.includes('/') || filePath.split('/').length <= 2) {
            priority += 0.2;
        }

        // Boost priority for recently modified files
        // This would be enhanced with actual file modification dates

        return Math.min(1.0, priority);
    }

    /**
     * Prioritize files based on configuration
     */
    private async prioritizeFiles(
        discoveredFiles: Array<{ path: string; category: string; priority: number; lastModified: Date }>,
        config: Required<LibraryLoadOptions>
    ): Promise<Array<{ path: string; category: string; priority: number; lastModified: Date }>> {
        let prioritizedFiles = [...discoveredFiles];

        // Sort by priority (highest first)
        prioritizedFiles.sort((a, b) => b.priority - a.priority);

        // If prioritizing recent files, adjust sorting
        if (config.prioritizeRecent) {
            prioritizedFiles.sort((a, b) => {
                const priorityDiff = b.priority - a.priority;
                if (Math.abs(priorityDiff) > 0.1) {
                    return priorityDiff;
                }
                return b.lastModified.getTime() - a.lastModified.getTime();
            });
        }

        return prioritizedFiles;
    }

    /**
     * Load file contents within token limits
     */
    private async loadFileContents(
        prioritizedFiles: Array<{ path: string; category: string; priority: number; lastModified: Date }>,
        config: Required<LibraryLoadOptions>
    ): Promise<ProjectFile[]> {
        const loadedFiles: ProjectFile[] = [];
        let currentTokens = 0;
        const maxTokens = config.maxTokens * 0.9; // Reserve 10% for response

        for (const fileInfo of prioritizedFiles) {
            try {
                const fullPath = path.resolve(process.cwd(), fileInfo.path);
                const content = await fs.readFile(fullPath, 'utf-8');
                const tokens = this.estimateTokens(content);

                // Check if adding this file would exceed token limit
                if (currentTokens + tokens > maxTokens) {
                    console.log(`⚠️  Stopping at ${fileInfo.path} - would exceed token limit`);
                    break;
                }

                const dependencies = this.extractDependencies(content, fileInfo.path);

                loadedFiles.push({
                    path: fileInfo.path,
                    content,
                    tokens,
                    priority: fileInfo.priority,
                    category: fileInfo.category,
                    lastModified: fileInfo.lastModified,
                    dependencies
                });

                currentTokens += tokens;
            } catch (error) {
                console.warn(`⚠️  Could not load ${fileInfo.path}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        console.log(`📊 Loaded ${loadedFiles.length} files (${currentTokens.toLocaleString()} tokens)`);
        console.log(`🎯 Token utilization: ${((currentTokens / maxTokens) * 100).toFixed(1)}%`);

        return loadedFiles;
    }

    /**
     * Extract file dependencies
     */
    private extractDependencies(content: string, filePath: string): string[] {
        const dependencies: string[] = [];
        
        // Extract import/require statements
        const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            const dep = match[1];
            if (!dep.startsWith('.') && !dep.startsWith('/')) {
                dependencies.push(dep);
            }
        }

        return dependencies;
    }

    /**
     * Build project library structure
     */
    private async buildProjectLibrary(
        loadedFiles: ProjectFile[],
        projectPath: string
    ): Promise<ProjectLibrary> {
        const categories = new Map<string, ProjectFile[]>();
        const dependencies = new Map<string, string[]>();
        
        let totalTokens = 0;

        // Group files by category
        for (const file of loadedFiles) {
            if (!categories.has(file.category)) {
                categories.set(file.category, []);
            }
            categories.get(file.category)!.push(file);
            
            if (file.dependencies.length > 0) {
                dependencies.set(file.path, file.dependencies);
            }
            
            totalTokens += file.tokens;
        }

        // Calculate summary
        const summary = {
            sourceCodeFiles: categories.get('source_code')?.length || 0,
            documentationFiles: categories.get('documentation')?.length || 0,
            configurationFiles: categories.get('configuration')?.length || 0,
            templateFiles: categories.get('templates')?.length || 0,
            dataFiles: categories.get('data')?.length || 0
        };

        return {
            files: loadedFiles,
            totalTokens,
            totalFiles: loadedFiles.length,
            categories,
            dependencies,
            summary
        };
    }

    /**
     * Create structured context from library
     */
    private createStructuredContext(
        library: ProjectLibrary,
        maxTokens?: number,
        includeMetadata: boolean = true,
        groupByCategory: boolean = true
    ): string {
        let context = '# Project Library Context\n\n';
        let currentTokens = this.estimateTokens(context);

        if (includeMetadata) {
            const metadata = `
## Library Statistics
- **Total Files:** ${library.totalFiles}
- **Total Tokens:** ${library.totalTokens.toLocaleString()}
- **Categories:** ${Array.from(library.categories.keys()).join(', ')}
- **Source Code Files:** ${library.summary.sourceCodeFiles}
- **Documentation Files:** ${library.summary.documentationFiles}
- **Configuration Files:** ${library.summary.configurationFiles}

`;
            context += metadata;
            currentTokens += this.estimateTokens(metadata);
        }

        if (groupByCategory) {
            // Group by category
            for (const [category, files] of library.categories) {
                const categoryHeader = `\n## ${category.toUpperCase().replace('_', ' ')} (${files.length} files)\n\n`;
                context += categoryHeader;
                currentTokens += this.estimateTokens(categoryHeader);

                for (const file of files) {
                    const fileSection = this.createFileSection(file, includeMetadata);
                    const fileTokens = this.estimateTokens(fileSection);
                    
                    if (maxTokens && currentTokens + fileTokens > maxTokens) {
                        context += `\n<!-- Truncated - would exceed token limit -->\n`;
                        break;
                    }
                    
                    context += fileSection;
                    currentTokens += fileTokens;
                }
                
                if (maxTokens && currentTokens >= maxTokens) break;
            }
        } else {
            // Sequential order
            for (const file of library.files) {
                const fileSection = this.createFileSection(file, includeMetadata);
                const fileTokens = this.estimateTokens(fileSection);
                
                if (maxTokens && currentTokens + fileTokens > maxTokens) {
                    context += `\n<!-- Truncated - would exceed token limit -->\n`;
                    break;
                }
                
                context += fileSection;
                currentTokens += fileTokens;
            }
        }

        console.log(`📄 Generated structured context: ${currentTokens.toLocaleString()} tokens`);
        return context;
    }

    /**
     * Create concatenated context from library
     */
    private createConcatenatedContext(
        library: ProjectLibrary,
        maxTokens?: number,
        includeMetadata: boolean = true
    ): string {
        let context = '';
        let currentTokens = 0;

        if (includeMetadata) {
            const metadata = `Project Library (${library.totalFiles} files, ${library.totalTokens.toLocaleString()} tokens)\n\n`;
            context += metadata;
            currentTokens += this.estimateTokens(metadata);
        }

        for (const file of library.files) {
            const fileContent = `\n=== ${file.path} ===\n${file.content}\n`;
            const fileTokens = this.estimateTokens(fileContent);
            
            if (maxTokens && currentTokens + fileTokens > maxTokens) {
                context += `\n<!-- Truncated - would exceed token limit -->\n`;
                break;
            }
            
            context += fileContent;
            currentTokens += fileTokens;
        }

        console.log(`📄 Generated concatenated context: ${currentTokens.toLocaleString()} tokens`);
        return context;
    }

    /**
     * Create summarized context from library
     */
    private createSummarizedContext(
        library: ProjectLibrary,
        maxTokens?: number
    ): string {
        let context = `# Project Library Summary\n\n`;
        let currentTokens = this.estimateTokens(context);

        const stats = this.getLibraryStats(library);
        
        // Add summary statistics
        const summaryText = `
## Overview
- **Total Files:** ${stats.totalFiles}
- **Total Tokens:** ${stats.totalTokens.toLocaleString()}
- **Average File Size:** ${stats.averageFileSize.toFixed(0)} tokens

## Category Breakdown
${Object.entries(stats.categoryBreakdown).map(([category, count]) => 
    `- **${category}**: ${count} files (${stats.tokenBreakdown[category].toLocaleString()} tokens)`
).join('\n')}

## Largest Files
${stats.largestFiles.map(file => 
    `- **${file.path}**: ${file.tokens.toLocaleString()} tokens`
).join('\n')}

`;

        context += summaryText;
        currentTokens += this.estimateTokens(summaryText);

        // Add key file contents (prioritized)
        const keyFiles = library.files
            .filter(file => file.priority > 0.8)
            .sort((a, b) => b.priority - a.priority);

        for (const file of keyFiles) {
            const fileSummary = `\n## ${file.path}\n${this.summarizeFileContent(file.content, 500)}\n`;
            const summaryTokens = this.estimateTokens(fileSummary);
            
            if (maxTokens && currentTokens + summaryTokens > maxTokens) {
                context += `\n<!-- Additional files truncated -->\n`;
                break;
            }
            
            context += fileSummary;
            currentTokens += summaryTokens;
        }

        console.log(`📄 Generated summarized context: ${currentTokens.toLocaleString()} tokens`);
        return context;
    }

    /**
     * Create file section for structured context
     */
    private createFileSection(file: ProjectFile, includeMetadata: boolean): string {
        let section = `### ${file.path}\n`;
        
        if (includeMetadata) {
            section += `*Category: ${file.category} | Priority: ${file.priority.toFixed(2)} | Tokens: ${file.tokens}*\n\n`;
        }
        
        section += `\`\`\`\n${file.content}\n\`\`\`\n\n`;
        
        return section;
    }

    /**
     * Summarize file content
     */
    private summarizeFileContent(content: string, maxLength: number): string {
        if (content.length <= maxLength) {
            return content;
        }
        
        // Try to find a good breaking point
        const truncated = content.substring(0, maxLength);
        const lastNewline = truncated.lastIndexOf('\n');
        const lastSpace = truncated.lastIndexOf(' ');
        
        const breakPoint = Math.max(lastNewline, lastSpace);
        
        if (breakPoint > maxLength * 0.8) {
            return content.substring(0, breakPoint) + '\n\n... (truncated)';
        }
        
        return content.substring(0, maxLength) + '\n\n... (truncated)';
    }

    /**
     * Get optimization strategies for specific document types
     */
    private getOptimizationStrategies(documentType: string): {
        includePatterns: string[];
        excludePatterns: string[];
        categoryWeights: Map<string, number>;
    } {
        const baseWeights = new Map(this.defaultCategoryWeights);
        
        switch (documentType) {
            case 'project-charter':
            case 'requirements-documentation':
                return {
                    includePatterns: [
                        '**/*.md',
                        '**/README*',
                        '**/package.json',
                        '**/tsconfig.json',
                        '**/src/**/*.ts',
                        '**/docs/**/*',
                        '**/templates/**/*'
                    ],
                    excludePatterns: this.defaultExcludePatterns,
                    categoryWeights: new Map([
                        ['documentation', 1.0],
                        ['configuration', 0.9],
                        ['source_code', 0.7],
                        ['templates', 0.8],
                        ['data', 0.5]
                    ])
                };
                
            case 'technical-design':
            case 'architecture-design':
                return {
                    includePatterns: [
                        '**/src/**/*.ts',
                        '**/src/**/*.js',
                        '**/docs/**/*.md',
                        '**/README*',
                        '**/package.json',
                        '**/tsconfig.json',
                        '**/webpack.config.*',
                        '**/jest.config.*'
                    ],
                    excludePatterns: this.defaultExcludePatterns,
                    categoryWeights: new Map([
                        ['source_code', 1.0],
                        ['documentation', 0.9],
                        ['configuration', 0.8],
                        ['templates', 0.6],
                        ['tests', 0.7]
                    ])
                };
                
            case 'quality-metrics':
            case 'test-plan':
                return {
                    includePatterns: [
                        '**/tests/**/*',
                        '**/src/**/*.ts',
                        '**/jest.config.*',
                        '**/package.json',
                        '**/README*',
                        '**/docs/**/*.md'
                    ],
                    excludePatterns: this.defaultExcludePatterns,
                    categoryWeights: new Map([
                        ['tests', 1.0],
                        ['source_code', 0.9],
                        ['configuration', 0.8],
                        ['documentation', 0.7]
                    ])
                };
                
            default:
                return {
                    includePatterns: this.defaultIncludePatterns,
                    excludePatterns: this.defaultExcludePatterns,
                    categoryWeights: baseWeights
                };
        }
    }

    /**
     * Estimate tokens in text
     */
    private estimateTokens(text: string): number {
        // Simple token estimation (rough approximation)
        return Math.ceil(text.length / 4);
    }
}
