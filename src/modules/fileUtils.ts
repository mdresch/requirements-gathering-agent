/**
 * File Utilities Module for Requirements Gathering Agent
 * 
 * Provides comprehensive file management and document generation utilities
 * for creating structured project documentation and PMBOK-compliant outputs.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Markdown file generation with automatic extension handling
 * - Batch file operations with directory structure creation
 * - Structured project documentation organization
 * - PMBOK document categorization and placement
 * - Error handling and logging for file operations
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\fileUtils.ts
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Generate a markdown file with the specified content
 */
export async function generateMarkdownFile(filename: string, content: string): Promise<void> {
    try {
        // Ensure the filename has .md extension
        const mdFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        const filepath = join(process.cwd(), mdFilename);
        
        // Write the file
        await writeFile(filepath, content, 'utf-8');
        
    } catch (error) {
        console.error(`Error writing file ${filename}:`, error);
        throw error;
    }
}

/**
 * Generate multiple markdown files in a specified directory
 */
export async function generateMarkdownFiles(
    directory: string, 
    files: Array<{ name: string; content: string }>
): Promise<void> {
    try {
        // Create directory if it doesn't exist
        await mkdir(directory, { recursive: true });
        
        // Write all files
        const writePromises = files.map(file => {
            const filename = file.name.endsWith('.md') ? file.name : `${file.name}.md`;
            const filepath = join(directory, filename);
            return writeFile(filepath, file.content, 'utf-8');
        });
        
        await Promise.all(writePromises);
        
    } catch (error) {
        console.error(`Error writing files to ${directory}:`, error);
        throw error;
    }
}

/**
 * Generate a structured project documentation folder
 */
export async function generateProjectDocumentation(
    projectName: string,
    documents: Record<string, string>
): Promise<void> {
    try {
        const baseDir = join(process.cwd(), `${projectName}-docs`);
        const pmBokDir = join(baseDir, 'pmbok');
        
        // Create directory structure
        await mkdir(pmBokDir, { recursive: true });
        
        // Organize documents by type
        const pmBokDocs = [
            'project-charter',
            'scope-management-plan',
            'risk-management-plan',
            'work-breakdown-structure',
            'stakeholder-register'
        ];
        
        const writePromises: Promise<void>[] = [];
        
        // Write PMBOK documents
        for (const [docName, content] of Object.entries(documents)) {
            if (content) {
                const filename = `${docName}.md`;
                const filepath = pmBokDocs.includes(docName) 
                    ? join(pmBokDir, filename)
                    : join(baseDir, filename);
                    
                writePromises.push(writeFile(filepath, content, 'utf-8'));
            }
        }
        
        await Promise.all(writePromises);
        
        console.log(`📁 Project documentation generated in: ${baseDir}`);
        
    } catch (error) {
        console.error(`Error generating project documentation:`, error);
        throw error;
    }
}

// Version export for tracking
export const fileUtilsVersion = '2.1.3';