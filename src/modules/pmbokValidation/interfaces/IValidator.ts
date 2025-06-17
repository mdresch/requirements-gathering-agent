/**
 * IValidator Interface
 * 
 * Defines the contract for all individual validation processors in the 
 * ADPA Quality Assurance Engine validation factory system.
 * 
 * This interface enables a modular, extensible validation architecture
 * where each validator focuses on a specific aspect of PMBOK compliance.
 * 
 * @version 1.0.0
 * @author ADPA Quality Assurance Engine Team
 * @created June 2025
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
    /** Unique identifier for this validation check */
    validatorId: string;
    
    /** Human-readable name of the validation */
    validatorName: string;
    
    /** Whether this validation passed */
    passed: boolean;
    
    /** Numeric score (0-100) for this validation aspect */
    score: number;
    
    /** Maximum possible score for this validation */
    maxScore: number;
    
    /** Array of specific issues found */
    issues: string[];
    
    /** Array of positive findings/strengths */
    strengths: string[];
    
    /** Severity level of issues found */
    severity: 'critical' | 'warning' | 'info';
    
    /** Recommendations for improvement */
    recommendations: string[];
    
    /** Execution time in milliseconds */
    executionTimeMs: number;
    
    /** Additional metadata specific to this validator */
    metadata?: Record<string, any>;
}

/**
 * Configuration for a validation operation
 */
export interface ValidationConfig {
    /** Documents to validate (key-value pairs of document type and content) */
    documents: Record<string, string>;
    
    /** Base path for document files */
    basePath: string;
    
    /** Whether to include detailed analysis */
    includeDetailedAnalysis?: boolean;
    
    /** Specific document types to focus on */
    focusDocuments?: string[];
    
    /** Validation-specific configuration */
    validatorConfig?: Record<string, any>;
}

/**
 * Core interface that all validators must implement
 */
export interface IValidator {
    /** Unique identifier for this validator */
    readonly id: string;
    
    /** Human-readable name for this validator */
    readonly name: string;
    
    /** Description of what this validator checks */
    readonly description: string;
    
    /** Document types this validator applies to (empty array = all documents) */
    readonly applicableDocuments: string[];
    
    /** Priority level (1 = highest, 10 = lowest) for execution order */
    readonly priority: number;
    
    /** Whether this validator is enabled by default */
    readonly defaultEnabled: boolean;
    
    /**
     * Perform the validation
     * @param config Configuration and documents to validate
     * @returns Promise resolving to validation result
     */
    validate(config: ValidationConfig): Promise<ValidationResult>;
    
    /**
     * Check if this validator applies to the given document types
     * @param documentTypes Array of document type keys
     * @returns Whether this validator should run
     */
    isApplicable(documentTypes: string[]): boolean;
    
    /**
     * Get validator-specific configuration schema
     * @returns JSON schema for this validator's configuration
     */
    getConfigSchema?(): Record<string, any>;
}

/**
 * Abstract base class for validators with common functionality
 */
export abstract class BaseValidator implements IValidator {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly applicableDocuments: string[];
    abstract readonly priority: number;
    readonly defaultEnabled: boolean = true;
    
    abstract validate(config: ValidationConfig): Promise<ValidationResult>;
    
    /**
     * Default implementation of applicability check
     */
    isApplicable(documentTypes: string[]): boolean {
        // If no specific documents are defined, applies to all
        if (this.applicableDocuments.length === 0) {
            return true;
        }
        
        // Check if any of the document types match our applicable documents
        return documentTypes.some(docType => 
            this.applicableDocuments.includes(docType)
        );
    }
    
    /**
     * Helper method to create a standardized validation result
     */
    protected createResult(
        passed: boolean,
        score: number,
        maxScore: number = 100,
        issues: string[] = [],
        strengths: string[] = [],
        severity: 'critical' | 'warning' | 'info' = 'warning',
        recommendations: string[] = [],
        executionTimeMs: number = 0,
        metadata?: Record<string, any>
    ): ValidationResult {
        return {
            validatorId: this.id,
            validatorName: this.name,
            passed,
            score,
            maxScore,
            issues,
            strengths,
            severity,
            recommendations,
            executionTimeMs,
            metadata
        };
    }
    
    /**
     * Helper method to measure execution time
     */
    protected async measureExecutionTime<T>(operation: () => Promise<T>): Promise<{ result: T; timeMs: number }> {
        const start = Date.now();
        const result = await operation();
        const timeMs = Date.now() - start;
        return { result, timeMs };
    }
}
