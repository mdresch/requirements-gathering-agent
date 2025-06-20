/**
 * ADPA Git Integration Module
 * Handles fetching content and data from the ADPA Git repository
 */

import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Git Repository Manager
 * Handles cloning, updating, and reading from the ADPA repository
 */
export class GitRepositoryManager {
    constructor(repoUrl = null, localPath = null) {
        this.repoUrl = repoUrl || 'https://github.com/CBA-Consult/requirements-gathering-agent.git';
        this.branch = 'main';
        this.localPath = localPath || path.join(__dirname, '..', 'temp', 'adpa-repo');
        this.git = simpleGit();
    }

    /**
     * Clone or update the repository
     */
    async ensureRepository() {
        try {
            // Check if repository already exists
            if (await fs.pathExists(this.localPath)) {
                console.log('Repository exists, pulling latest changes...');
                const git = simpleGit(this.localPath);
                await git.pull();
                return true;
            } else {
                console.log('Cloning repository...');
                await fs.ensureDir(path.dirname(this.localPath));
                await this.git.clone(this.repoUrl, this.localPath);
                return true;
            }
        } catch (error) {
            console.error('Error managing repository:', error);
            throw error;
        }
    }

    /**
     * Get README content from the repository
     */
    async getReadmeContent() {
        await this.ensureRepository();
        const readmePath = path.join(this.localPath, 'README.md');
        
        if (await fs.pathExists(readmePath)) {
            return await fs.readFile(readmePath, 'utf-8');
        } else {
            throw new Error('README.md not found in repository');
        }
    }

    /**
     * Get documentation files from the docs directory
     */
    async getDocumentationFiles() {
        await this.ensureRepository();
        const docsPath = path.join(this.localPath, 'docs');
        
        if (!(await fs.pathExists(docsPath))) {
            return [];
        }

        const files = await fs.readdir(docsPath);
        const docFiles = [];

        for (const file of files) {
            if (file.endsWith('.md')) {
                const filePath = path.join(docsPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                docFiles.push({
                    filename: file,
                    title: this.extractTitle(content) || file.replace('.md', ''),
                    content: content,
                    lastModified: (await fs.stat(filePath)).mtime
                });
            }
        }

        return docFiles;
    }

    /**
     * Get generated documents from the generated-documents directory
     */
    async getGeneratedDocuments() {
        await this.ensureRepository();
        const generatedPath = path.join(this.localPath, 'generated-documents');
        
        if (!(await fs.pathExists(generatedPath))) {
            return [];
        }

        return await this.scanDirectoryForDocuments(generatedPath);
    }

    /**
     * Recursively scan directory for documents
     */
    async scanDirectoryForDocuments(dirPath) {
        const documents = [];
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory()) {
                // Recursively scan subdirectories
                const subDocs = await this.scanDirectoryForDocuments(fullPath);
                documents.push(...subDocs);
            } else if (item.name.endsWith('.md') || item.name.endsWith('.docx')) {
                const content = item.name.endsWith('.md') 
                    ? await fs.readFile(fullPath, 'utf-8')
                    : `[Word Document: ${item.name}]`;
                
                documents.push({
                    filename: item.name,
                    title: this.extractTitle(content) || item.name.replace(/\.(md|docx)$/, ''),
                    content: content,
                    category: this.getCategoryFromPath(fullPath, dirPath),
                    lastModified: (await fs.stat(fullPath)).mtime,
                    type: item.name.endsWith('.md') ? 'markdown' : 'word'
                });
            }
        }

        return documents;
    }

    /**
     * Get package.json information
     */
    async getPackageInfo() {
        await this.ensureRepository();
        const packagePath = path.join(this.localPath, 'package.json');
        
        if (await fs.pathExists(packagePath)) {
            const packageContent = await fs.readFile(packagePath, 'utf-8');
            return JSON.parse(packageContent);
        }
        
        return null;
    }

    /**
     * Get configuration files
     */
    async getConfigFiles() {
        await this.ensureRepository();
        const configFiles = [];
        
        const configFilenames = [
            'config-rga.json',
            'tsconfig.json',
            'jest.config.js',
            '.env.example'
        ];

        for (const filename of configFilenames) {
            const filePath = path.join(this.localPath, filename);
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf-8');
                configFiles.push({
                    filename,
                    content,
                    lastModified: (await fs.stat(filePath)).mtime
                });
            }
        }

        return configFiles;
    }

    /**
     * Extract title from markdown content
     */
    extractTitle(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                return line.substring(2).trim();
            }
        }
        return null;
    }

    /**
     * Get category from file path
     */
    getCategoryFromPath(fullPath, basePath) {
        const relativePath = path.relative(basePath, fullPath);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length > 1) {
            return pathParts[0]; // First directory is the category
        }
        
        return 'general';
    }

    /**
     * Get recent commits information
     */
    async getRecentCommits(limit = 10) {
        await this.ensureRepository();
        const git = simpleGit(this.localPath);
        
        try {
            const log = await git.log({ maxCount: limit });
            return log.all.map(commit => ({
                hash: commit.hash,
                message: commit.message,
                author: commit.author_name,
                date: commit.date,
                files: commit.diff?.files || []
            }));
        } catch (error) {
            console.error('Error getting commits:', error);
            return [];
        }
    }

    /**
     * Get repository statistics
     */
    async getRepositoryStats() {
        await this.ensureRepository();
        const stats = {
            totalFiles: 0,
            markdownFiles: 0,
            documentationFiles: 0,
            generatedDocuments: 0,
            lastUpdate: null
        };

        try {
            // Count files
            await this.countFiles(this.localPath, stats);
            
            // Get last commit date
            const git = simpleGit(this.localPath);
            const log = await git.log({ maxCount: 1 });
            if (log.all.length > 0) {
                stats.lastUpdate = log.all[0].date;
            }
        } catch (error) {
            console.error('Error getting repository stats:', error);
        }

        return stats;
    }

    /**
     * Recursively count files
     */
    async countFiles(dirPath, stats) {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                    await this.countFiles(fullPath, stats);
                } else if (item.isFile()) {
                    stats.totalFiles++;
                    
                    if (item.name.endsWith('.md')) {
                        stats.markdownFiles++;
                        
                        if (fullPath.includes('docs')) {
                            stats.documentationFiles++;
                        } else if (fullPath.includes('generated-documents')) {
                            stats.generatedDocuments++;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error counting files in', dirPath, error);
        }
    }
}

/**
 * Confluence Content Transformer
 * Transforms Git content for Confluence publishing
 */
export class ConfluenceContentTransformer {
    /**
     * Transform markdown to Confluence storage format
     */
    static markdownToConfluence(markdown) {
        // Basic markdown to Confluence transformation
        let content = markdown;
        
        // Convert headers
        content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Convert bold and italic
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert code blocks
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>');
        
        // Convert inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert links
        content = content.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
        
        // Convert lists
        content = content.replace(/^- (.*$)/gm, '<li>$1</li>');
        content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Convert line breaks
        content = content.replace(/\n\n/g, '</p><p>');
        content = `<p>${content}</p>`;
        
        // Clean up empty paragraphs
        content = content.replace(/<p><\/p>/g, '');
        
        return content;
    }

    /**
     * Create page structure for Confluence
     */
    static createPageStructure(title, content, spaceKey = 'ADPA', parentId = null) {
        return {
            type: 'page',
            title: title,
            space: { key: spaceKey },
            body: {
                storage: {
                    value: content,
                    representation: 'storage'
                }
            },
            ...(parentId && { ancestors: [{ id: parentId }] })
        };
    }

    /**
     * Generate page hierarchy based on categories
     */
    static generatePageHierarchy(documents) {
        const hierarchy = {};
        
        for (const doc of documents) {
            const category = doc.category || 'General';
            if (!hierarchy[category]) {
                hierarchy[category] = [];
            }
            hierarchy[category].push(doc);
        }
        
        return hierarchy;
    }
}
