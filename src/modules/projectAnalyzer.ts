/**
 * Project Analyzer Module for Requirements Gathering Agent
 * 
 * Provides comprehensive project analysis capabilities including markdown file discovery,
 * content categorization, relevance scoring, and project context building.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Enhanced markdown file discovery with recursive directory scanning
 * - Intelligent relevance scoring based on content and file structure
 * - Automatic categorization of project documentation
 * - Comprehensive project context building from multiple sources
 * - Support for package.json metadata integration
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\projectAnalyzer.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProjectMarkdownFile {
  fileName: string;
  filePath: string;
  content: string;
  relevanceScore: number;
  category: 'primary' | 'documentation' | 'planning' | 'development' | 'other';
}

export interface ProjectAnalysis {
  readme: string | null;
  additionalMarkdownFiles: ProjectMarkdownFile[];
  packageJson: Record<string, any> | null;
  projectContext: string;
  suggestedSources: string[];
}

/**
 * Reads the README.md file from the given project path.
 * @param projectPath - The root directory of the project.
 * @returns The content of README.md if found, otherwise null.
 */
export async function getReadmeContent(projectPath: string): Promise<string | null> {
  const readmePath = path.join(projectPath, 'README.md');
  try {
    const content = await fs.readFile(readmePath, 'utf-8');
    return content;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Reads and parses the package.json file from the given project path.
 * @param projectPath - The root directory of the project.
 * @returns The parsed package.json object if found and valid, otherwise null.
 */
export async function getProjectPackageJson(projectPath: string): Promise<Record<string, any> | null> {
  const pkgPath = path.join(projectPath, 'package.json');
  try {
    const content = await fs.readFile(pkgPath, 'utf-8');
    return JSON.parse(content);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null;
    }
    // Optionally log error or rethrow
    return null;
  }
}

/**
 * Analyzes the entire project directory for relevant markdown files and project information.
 * @param projectPath - The root directory of the project.
 * @returns Complete project analysis including all relevant markdown files.
 */
export async function analyzeProjectComprehensively(projectPath: string): Promise<ProjectAnalysis> {
  console.log('🔍 Analyzing project for all relevant markdown files...');
  
  const readme = await getReadmeContent(projectPath);
  const packageJson = await getProjectPackageJson(projectPath);
  const additionalMarkdownFiles = await findRelevantMarkdownFiles(projectPath);
  
  // Build comprehensive project context
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

// Project Analyzer: Add support for recognizing and categorizing the new checklist document
const CHECKLIST_FILENAMES = [
  'Project-KickOff-Preprations-CheckList.md',
  'project-kickoff-preparations-checklist.md'
];

/**
 * Finds all relevant markdown files in the project directory.
 * @param projectPath - The root directory of the project.
 * @returns Array of relevant markdown files with content and metadata.
 */
export async function findRelevantMarkdownFiles(projectPath: string): Promise<ProjectMarkdownFile[]> {
  const markdownFiles: ProjectMarkdownFile[] = [];
  
  try {
    // Search in root directory
    const rootFiles = await findMarkdownInDirectory(projectPath, projectPath, 0);
    markdownFiles.push(...rootFiles);
    
    // Search in common documentation directories
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
      } catch {
        // Directory doesn't exist, skip
      }
    }
    
    // Sort by relevance score (highest first)
    return markdownFiles
      .filter(file => file.content.length > 50) // Filter out very small files
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
  } catch (error) {
    console.warn('⚠️ Error scanning for markdown files:', error);
    return [];
  }
}

/**
 * Recursively finds markdown files in a directory.
 * @param dirPath - Directory to search in.
 * @param projectRoot - Root project directory for relative paths.
 * @param depth - Current search depth.
 * @returns Array of markdown files found.
 */
async function findMarkdownInDirectory(
  dirPath: string, 
  projectRoot: string, 
  depth: number
): Promise<ProjectMarkdownFile[]> {
  const files: ProjectMarkdownFile[] = [];
  const maxDepth = 3; // Limit recursion depth
  
  if (depth > maxDepth) return files;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        // Skip README.md as it's handled separately
        if (entry.name.toLowerCase() === 'readme.md') continue;
        
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const relativePath = path.relative(projectRoot, fullPath);
          
          const file: ProjectMarkdownFile = {
            fileName: entry.name,
            filePath: relativePath,
            content,
            relevanceScore: calculateRelevanceScore(entry.name, content, relativePath),
            category: categorizeMarkdownFile(entry.name, content, relativePath)
          };
          
          files.push(file);
        } catch (error) {
          console.warn(`⚠️ Could not read ${fullPath}:`, error);
        }
      } else if (entry.isDirectory() && !shouldSkipDirectory(entry.name)) {
        // Recursively search subdirectories
        const subFiles = await findMarkdownInDirectory(fullPath, projectRoot, depth + 1);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    // Directory not accessible, skip
  }
  
  return files;
}

/**
 * Calculates relevance score for a markdown file based on name, content, and location.
 * @param fileName - Name of the file.
 * @param content - File content.
 * @param relativePath - Relative path from project root.
 * @returns Relevance score (0-100).
 */
function calculateRelevanceScore(fileName: string, content: string, relativePath: string): number {
  let score = 0;
  
  const fileNameLower = fileName.toLowerCase();
  const contentLower = content.toLowerCase();
  const pathLower = relativePath.toLowerCase();
  
  // High-value file names
  const highValueNames = [
    'architecture', 'design', 'requirements', 'specification', 'specs',
    'planning', 'roadmap', 'overview', 'introduction', 'getting-started',
    'install', 'setup', 'configuration', 'api', 'guide', 'tutorial',
    'contributing', 'changelog', 'features', 'scope', 'objectives'
  ];
  
  // Check file name relevance
  for (const keyword of highValueNames) {
    if (fileNameLower.includes(keyword)) {
      score += 20;
      break;
    }
  }
  
  // Check content relevance
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
  score += Math.min(termCount * 3, 30); // Max 30 points for content relevance
  
  // Location-based scoring
  if (pathLower.includes('docs') || pathLower.includes('documentation')) {
    score += 15;
  }
  if (pathLower.includes('requirements') || pathLower.includes('specs')) {
    score += 20;
  }
  if (pathLower.includes('planning') || pathLower.includes('design')) {
    score += 15;
  }
  
  // Content length bonus (more substantial content)
  if (content.length > 1000) score += 10;
  if (content.length > 3000) score += 10;
  
  // Structure bonus (has headers)
  const headerCount = (content.match(/^#+\s/gm) || []).length;
  if (headerCount >= 3) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Categorizes a markdown file based on its name, content, and location.
 * @param fileName - Name of the file.
 * @param content - File content.
 * @param relativePath - Relative path from project root.
 * @returns File category.
 */
function categorizeMarkdownFile(fileName: string, content: string, relativePath: string): 
  'primary' | 'documentation' | 'planning' | 'development' | 'other' {
  
  const fileNameLower = fileName.toLowerCase();
  const pathLower = relativePath.toLowerCase();
  
  // Primary project files
  if (fileNameLower.includes('overview') || fileNameLower.includes('introduction') ||
      fileNameLower.includes('getting-started') || fileNameLower.includes('setup')) {
    return 'primary';
  }
  
  // Planning and requirements
  if (fileNameLower.includes('requirements') || fileNameLower.includes('planning') ||
      fileNameLower.includes('roadmap') || fileNameLower.includes('scope') ||
      pathLower.includes('requirements') || pathLower.includes('planning')) {
    return 'planning';
  }
  
  // Development documentation
  if (fileNameLower.includes('api') || fileNameLower.includes('architecture') ||
      fileNameLower.includes('design') || fileNameLower.includes('technical') ||
      fileNameLower.includes('contributing') || fileNameLower.includes('development')) {
    return 'development';
  }
  
  // General documentation
  if (pathLower.includes('docs') || pathLower.includes('documentation') ||
      fileNameLower.includes('guide') || fileNameLower.includes('tutorial')) {
    return 'documentation';
  }
  
  return 'other';
}

/**
 * Determines if a directory should be skipped during search.
 * @param dirName - Directory name.
 * @returns True if directory should be skipped.
 */
function shouldSkipDirectory(dirName: string): boolean {
  const skipDirs = [
    'node_modules', '.git', '.vscode', '.idea', 'dist', 'build',
    'coverage', '.nyc_output', 'logs', 'tmp', 'temp', '.cache',
    'generated-documents' // Skip our own generated documents
  ];
  
  return skipDirs.includes(dirName) || dirName.startsWith('.');
}

/**
 * Builds comprehensive project context from all available sources.
 * @param readme - README content.
 * @param markdownFiles - Additional markdown files.
 * @param packageJson - Package.json content.
 * @returns Comprehensive project context string.
 */
function buildProjectContext(
  readme: string | null, 
  markdownFiles: ProjectMarkdownFile[], 
  packageJson: Record<string, any> | null
): string {
  let context = '';
  
  // Add README content first
  if (readme) {
    context += '=== PROJECT README ===\n';
    context += readme;
    context += '\n\n';
  }
  
  // Add package.json information
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
  
  // Add high-relevance markdown files (score > 30)
  const highRelevanceFiles = markdownFiles
    .filter(file => file.relevanceScore > 30)
    .slice(0, 10); // Limit to top 10 files to avoid context overflow
  
  for (const file of highRelevanceFiles) {
    context += `=== ${file.fileName.toUpperCase()} (${file.category}) ===\n`;
    context += `Path: ${file.filePath}\n`;
    context += `Relevance Score: ${file.relevanceScore}\n\n`;
    
    // Include content but limit length to avoid token overflow
    const maxLength = 2000;
    const content = file.content.length > maxLength 
      ? file.content.substring(0, maxLength) + '\n... [truncated]'
      : file.content;
    
    context += content;
    context += '\n\n';
  }
  
  return context;
}

/**
 * Gets suggested source files for documentation generation.
 * @param markdownFiles - Available markdown files.
 * @returns Array of suggested file paths.
 */
function getSuggestedSourceFiles(markdownFiles: ProjectMarkdownFile[]): string[] {
  return markdownFiles
    .filter(file => file.relevanceScore > 40)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
    .map(file => file.filePath);
}
