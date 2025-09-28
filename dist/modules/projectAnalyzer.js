import * as fs from 'fs/promises';
import * as path from 'path';
import { PACKAGE_JSON_FILENAME } from '../constants.js';
export async function getReadmeContent(projectPath) {
    const readmePath = path.join(projectPath, 'README.md');
    try {
        const content = await fs.readFile(readmePath, 'utf-8');
        return content;
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        throw err;
    }
}
export async function getProjectPackageJson(projectPath) {
    const pkgPath = path.join(projectPath, PACKAGE_JSON_FILENAME);
    try {
        const content = await fs.readFile(pkgPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        return null;
    }
}
export async function analyzeProjectComprehensively(projectPath) {
    console.log('🔍 Analyzing project for all relevant markdown files...');
    const readme = await getReadmeContent(projectPath);
    const packageJson = await getProjectPackageJson(projectPath);
    const additionalMarkdownFiles = await findRelevantMarkdownFiles(projectPath);
    const projectContext = buildProjectContext(readme, additionalMarkdownFiles, packageJson);
    const suggestedSources = getSuggestedSourceFiles(additionalMarkdownFiles);
    console.log(`✅ Found ${additionalMarkdownFiles.length} additional markdown files`);
    return {
        readme,
        additionalMarkdownFiles,
        packageJson,
        projectContext,
        suggestedSources
    };
}
const CHECKLIST_FILENAMES = [
    'Project-KickOff-Preprations-CheckList.md',
    'project-kickoff-preparations-checklist.md'
];
export async function findRelevantMarkdownFiles(projectPath) {
    const markdownFiles = [];
    try {
        const rootFiles = await findMarkdownInDirectory(projectPath, projectPath, 0);
        markdownFiles.push(...rootFiles);
        const commonDirs = [
            'docs', 'documentation', 'doc',
            'requirements', 'specs', 'specifications',
            'planning', 'design', 'architecture',
            '.github', 'wiki'
        ];
        for (const dir of commonDirs) {
            const dirPath = path.join(projectPath, dir);
            try {
                await fs.access(dirPath);
                const dirFiles = await findMarkdownInDirectory(dirPath, projectPath, 1);
                markdownFiles.push(...dirFiles);
            }
            catch {
            }
        }
        return markdownFiles
            .filter(file => file.content.length > 50)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    catch (error) {
        console.warn('⚠️ Error scanning for markdown files:', error);
        return [];
    }
}
async function findMarkdownInDirectory(dirPath, projectRoot, depth) {
    const files = [];
    const maxDepth = 3;
    if (depth > maxDepth)
        return files;
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                if (entry.name.toLowerCase() === 'readme.md')
                    continue;
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const relativePath = path.relative(projectRoot, fullPath);
                    const file = {
                        fileName: entry.name,
                        filePath: relativePath,
                        content,
                        relevanceScore: calculateRelevanceScore(entry.name, content, relativePath),
                        category: categorizeMarkdownFile(entry.name, content, relativePath)
                    };
                    files.push(file);
                }
                catch (error) {
                    console.warn(`⚠️ Could not read ${fullPath}:`, error);
                }
            }
            else if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
                const subFiles = await findMarkdownInDirectory(fullPath, projectRoot, depth + 1);
                files.push(...subFiles);
            }
        }
    }
    catch (error) {
    }
    return files;
}
function calculateRelevanceScore(fileName, content, relativePath) {
    let score = 0;
    const fileNameLower = fileName.toLowerCase();
    const contentLower = content.toLowerCase();
    const pathLower = relativePath.toLowerCase();
    const highValueNames = [
        'architecture', 'design', 'requirements', 'specification', 'specs',
        'planning', 'roadmap', 'overview', 'introduction', 'getting-started',
        'install', 'setup', 'configuration', 'api', 'guide', 'tutorial',
        'contributing', 'changelog', 'features', 'scope', 'objectives'
    ];
    for (const keyword of highValueNames) {
        if (fileNameLower.includes(keyword)) {
            score += 20;
            break;
        }
    }
    const relevantTerms = [
        'project', 'application', 'system', 'requirements', 'features',
        'functionality', 'architecture', 'design', 'implementation',
        'goals', 'objectives', 'scope', 'stakeholder', 'user story',
        'use case', 'business', 'technical', 'specification'
    ];
    let termCount = 0;
    for (const term of relevantTerms) {
        if (contentLower.includes(term)) {
            termCount++;
        }
    }
    score += Math.min(termCount * 3, 30);
    if (pathLower.includes('docs') || pathLower.includes('documentation')) {
        score += 15;
    }
    if (pathLower.includes('requirements') || pathLower.includes('specs')) {
        score += 20;
    }
    if (pathLower.includes('planning') || pathLower.includes('design')) {
        score += 15;
    }
    if (content.length > 1000)
        score += 10;
    if (content.length > 3000)
        score += 10;
    const headerCount = (content.match(/^#+\s/gm) || []).length;
    if (headerCount >= 3)
        score += 10;
    return Math.min(score, 100);
}
function categorizeMarkdownFile(fileName, content, relativePath) {
    const fileNameLower = fileName.toLowerCase();
    const pathLower = relativePath.toLowerCase();
    if (fileNameLower.includes('overview') || fileNameLower.includes('introduction') ||
        fileNameLower.includes('getting-started') || fileNameLower.includes('setup')) {
        return 'primary';
    }
    if (fileNameLower.includes('requirements') || fileNameLower.includes('planning') ||
        fileNameLower.includes('roadmap') || fileNameLower.includes('scope') ||
        pathLower.includes('requirements') || pathLower.includes('planning')) {
        return 'planning';
    }
    if (fileNameLower.includes('api') || fileNameLower.includes('architecture') ||
        fileNameLower.includes('design') || fileNameLower.includes('technical') ||
        fileNameLower.includes('contributing') || fileNameLower.includes('development')) {
        return 'development';
    }
    if (pathLower.includes('docs') || pathLower.includes('documentation') ||
        fileNameLower.includes('guide') || fileNameLower.includes('tutorial')) {
        return 'documentation';
    }
    return 'other';
}
function shouldSkipDirectory(dirName) {
    const skipDirs = [
        'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
        'coverage', '.nyc_output', 'logs', 'tmp', 'temp', '.cache',
        'generated-documents'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
}
function buildProjectContext(readme, markdownFiles, packageJson) {
    let context = '';
    if (readme) {
        context += '=== PROJECT README ===\n';
        context += readme;
        context += '\n\n';
    }
    if (packageJson) {
        context += '=== PROJECT METADATA ===\n';
        context += `Name: ${packageJson.name || 'Unknown'}\n`;
        context += `Description: ${packageJson.description || 'No description'}\n`;
        context += `Version: ${packageJson.version || 'Unknown'}\n`;
        if (packageJson.dependencies) {
            context += `Dependencies: ${Object.keys(packageJson.dependencies).join(', ')}\n`;
        }
        if (packageJson.devDependencies) {
            context += `Dev Dependencies: ${Object.keys(packageJson.devDependencies).join(', ')}\n`;
        }
        if (packageJson.scripts) {
            context += `Available Scripts: ${Object.keys(packageJson.scripts).join(', ')}\n`;
        }
        context += '\n';
    }
    const highRelevanceFiles = markdownFiles
        .filter(file => file.relevanceScore > 30)
        .slice(0, 10);
    for (const file of highRelevanceFiles) {
        context += `=== ${file.fileName.toUpperCase()} (${file.category}) ===\n`;
        context += `Path: ${file.filePath}\n`;
        context += `Relevance Score: ${file.relevanceScore}\n\n`;
        const maxLength = 2000;
        const content = file.content.length > maxLength
            ? file.content.substring(0, maxLength) + '\n... [truncated]'
            : file.content;
        context += content;
        context += '\n\n';
    }
    return context;
}
function getSuggestedSourceFiles(markdownFiles) {
    return markdownFiles
        .filter(file => file.relevanceScore > 40)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)
        .map(file => file.filePath);
}
