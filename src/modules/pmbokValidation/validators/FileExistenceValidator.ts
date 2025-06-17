/**
 * File Existence Validator
 * 
 * Validates that expected PMBOK documents exist in the file system.
 * This is a fundamental check that ensures the basic generation process
 * has completed successfully before running more detailed content analysis.
 * 
 * @version 1.0.0
 * @author ADPA Quality Assurance Engine Team
 * @created June 2025
 */

import { IValidator, ValidationConfig, ValidationResult } from '../interfaces/IValidator.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileExistenceValidator implements IValidator {
    public readonly name = 'File Existence Validator';
    public readonly description = 'Verifies that expected PMBOK documents exist in the file system';
    public readonly id = 'file-existence';
    public readonly version = '1.0.0';
    public readonly tags = ['basic', 'filesystem', 'pmbok'];
      private documentsBasePath: string;
    
    // Required interface properties
    public readonly applicableDocuments: string[] = []; // Apply to all documents
    public readonly priority: number = 0; // Highest priority - check files exist first
    public readonly defaultEnabled: boolean = true;
    
    constructor(documentsBasePath: string = 'generated-documents') {
        this.documentsBasePath = documentsBasePath;
    }

    public isApplicable(documentTypes: string[]): boolean {
        // File existence should always be checked regardless of document types
        return true;
    }

    public getConfigSchema?(): Record<string, any> {
        return {};
    }

    public async validate(config: ValidationConfig): Promise<ValidationResult> {
        const startTime = Date.now();
        const issues: string[] = [];
        const strengths: string[] = [];
        const recommendations: string[] = [];
        
        let score = 100;
        const maxScore = 100;
        
        console.log('📁 Validating file existence...');
        
        // Check if base documents directory exists
        try {
            await fs.access(this.documentsBasePath);
            strengths.push('Documents directory exists');
        } catch (error) {
            issues.push(`Documents directory '${this.documentsBasePath}' does not exist`);
            score = 0;
            
            return {
                validatorId: this.id,
                validatorName: this.name,
                passed: false,
                score,
                maxScore,
                issues,
                strengths,
                severity: 'critical',
                recommendations: ['Ensure document generation has completed successfully'],
                executionTimeMs: Date.now() - startTime,
                metadata: { basePathMissing: true }
            };
        }
        
        // Expected core PMBOK documents
        const expectedDocuments = [
            'project-charter/project-charter.md',
            'stakeholder-management/stakeholder-register.md',
            'scope-management/project-scope-statement.md',
            'strategic-statements/mission-vision-core-values.md'
        ];
        
        let foundDocuments = 0;
        const missingDocuments: string[] = [];
        
        for (const docPath of expectedDocuments) {
            const fullPath = path.join(this.documentsBasePath, docPath);
            try {
                await fs.access(fullPath);
                foundDocuments++;
                strengths.push(`Found: ${docPath}`);
            } catch (error) {
                missingDocuments.push(docPath);
                issues.push(`Missing document: ${docPath}`);
            }
        }
        
        // Calculate score based on found documents
        score = Math.round((foundDocuments / expectedDocuments.length) * 100);
        
        // Add recommendations for missing documents
        if (missingDocuments.length > 0) {
            recommendations.push(`Generate missing documents: ${missingDocuments.join(', ')}`);
            recommendations.push('Check document generation logs for errors');
        }
        
        // Check for additional documents that exist
        try {
            const allFiles = await this.findAllMarkdownFiles(this.documentsBasePath);
            if (allFiles.length > expectedDocuments.length) {
                strengths.push(`Found ${allFiles.length} total documents (${allFiles.length - expectedDocuments.length} additional)`);
            }
        } catch (error) {
            // Non-critical error
        }
        
        const passed = score >= 80; // 80% threshold for file existence
        
        return {
            validatorId: this.id,
            validatorName: this.name,
            passed,
            score,
            maxScore,
            issues,
            strengths,
            severity: missingDocuments.length > 2 ? 'critical' : missingDocuments.length > 0 ? 'warning' : 'info',
            recommendations,
            executionTimeMs: Date.now() - startTime,
            metadata: {
                expectedCount: expectedDocuments.length,
                foundCount: foundDocuments,
                missingDocuments,
                documentsBasePath: this.documentsBasePath
            }
        };
    }
    
    /**
     * Recursively find all markdown files in the documents directory
     */
    private async findAllMarkdownFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findAllMarkdownFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.name.endsWith('.md')) {
                    files.push(path.relative(this.documentsBasePath, fullPath));
                }
            }
        } catch (error) {
            // Directory might not be accessible
        }
        
        return files;
    }
}
