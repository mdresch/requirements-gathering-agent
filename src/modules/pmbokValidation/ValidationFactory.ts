/**
 * Validation Processing Factory
 * 
 * Core orchestrator for the ADPA Quality Assurance Engine validation system.
 * Manages the execution of multiple validators and aggregates results into
 * comprehensive compliance reports.
 * 
 * This factory provides the main interface for running validation checks
 * and follows the same architectural pattern as the DocumentGenerator's
 * ProcessorFactory for consistency and maintainability.
 * 
 * @version 1.0.0
 * @author ADPA Quality Assurance Engine Team
 * @created June 2025
 */

import { ValidationRegistry, ValidatorFilter } from './ValidationRegistry.js';
import { IValidator, ValidationConfig, ValidationResult } from './interfaces/IValidator.js';

/**
 * Comprehensive validation report aggregating all validator results
 */
export interface ComprehensiveValidationReport {
    /** Overall validation summary */
    summary: {
        totalValidators: number;
        passedValidators: number;
        failedValidators: number;
        overallScore: number;
        maxPossibleScore: number;
        overallPassed: boolean;
        executionTimeMs: number;
        timestamp: Date;
    };
    
    /** Results from individual validators */
    validatorResults: ValidationResult[];
    
    /** Aggregated issues by severity */
    issuesSummary: {
        critical: string[];
        warning: string[];
        info: string[];
    };
    
    /** Aggregated strengths */
    strengths: string[];
    
    /** Aggregated recommendations */
    recommendations: string[];
    
    /** Consistency score for cross-document validation */
    consistencyScore: number;
    
    /** Document-specific scores */
    documentScores: Record<string, {
        score: number;
        maxScore: number;
        issues: string[];
        strengths: string[];
    }>;
    
    /** PMBOK compliance assessment */
    pmbokCompliance: {
        score: number;
        isCompliant: boolean;
        missingElements: string[];
        documentQuality: Record<string, any>;
    };
}

/**
 * Options for validation execution
 */
export interface ValidationExecutionOptions {
    /** Whether to run validations in parallel */
    parallel?: boolean;
    
    /** Maximum number of concurrent validations */
    maxConcurrency?: number;
    
    /** Whether to stop on first critical failure */
    stopOnCriticalFailure?: boolean;
    
    /** Whether to include detailed analysis */
    includeDetailedAnalysis?: boolean;
    
    /** Specific validators to run (if not provided, runs all applicable) */
    validatorIds?: string[];
    
    /** Tags to filter validators */
    tags?: string[];
    
    /** Minimum score threshold for overall compliance */
    complianceThreshold?: number;
}

/**
 * Main validation processing factory
 */
export class ValidationFactory {
    private registry: ValidationRegistry;
    
    constructor() {
        this.registry = ValidationRegistry.getInstance();
    }
    
    /**
     * Run comprehensive validation on the provided documents
     * @param config Validation configuration
     * @param options Execution options
     * @returns Comprehensive validation report
     */
    public async runComprehensiveValidation(
        config: ValidationConfig,
        options: ValidationExecutionOptions = {}
    ): Promise<ComprehensiveValidationReport> {
        const startTime = Date.now();
        
        console.log('🔍 Starting comprehensive PMBOK validation...');
        
        // Get applicable validators
        const filter: ValidatorFilter = {
            enabledOnly: true,
            documentTypes: Object.keys(config.documents),
            validatorIds: options.validatorIds,
            tags: options.tags
        };
        
        const validatorRegistrations = this.registry.getValidators(filter);
        const validators = validatorRegistrations.map(reg => reg.validator);
        
        if (validators.length === 0) {
            console.warn('⚠️ No applicable validators found for the provided documents');
        }
        
        console.log(`📋 Running ${validators.length} validators...`);
        
        // Execute validators
        const validatorResults: ValidationResult[] = [];
        
        if (options.parallel && validators.length > 1) {
            validatorResults.push(...await this.runValidatorsInParallel(
                validators, 
                config, 
                options
            ));
        } else {
            validatorResults.push(...await this.runValidatorsSequentially(
                validators, 
                config, 
                options
            ));
        }
        
        // Aggregate results
        const report = this.aggregateResults(validatorResults, config, options);
        report.summary.executionTimeMs = Date.now() - startTime;
        report.summary.timestamp = new Date();
        
        console.log(`✅ Validation complete in ${report.summary.executionTimeMs}ms`);
        console.log(`📊 Overall Score: ${report.summary.overallScore}/${report.summary.maxPossibleScore}`);
        console.log(`📋 Status: ${report.summary.overallPassed ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        
        return report;
    }
    
    /**
     * Run a specific validator
     * @param validatorId The validator ID to run
     * @param config Validation configuration
     * @returns Validation result
     */
    public async runValidator(
        validatorId: string,
        config: ValidationConfig
    ): Promise<ValidationResult | null> {
        const registration = this.registry.getValidator(validatorId);
        if (!registration || !registration.enabled) {
            console.warn(`⚠️ Validator '${validatorId}' not found or disabled`);
            return null;
        }
        
        console.log(`🔍 Running validator: ${registration.validator.name}`);
        
        try {
            const result = await registration.validator.validate(config);
            console.log(`${result.passed ? '✅' : '❌'} ${registration.validator.name}: ${result.score}/${result.maxScore}`);
            return result;
        } catch (error) {
            console.error(`❌ Error running validator '${validatorId}':`, error);
            
            // Return error result
            return {
                validatorId,
                validatorName: registration.validator.name,
                passed: false,
                score: 0,
                maxScore: 100,
                issues: [`Validator execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                strengths: [],
                severity: 'critical',
                recommendations: ['Fix validator implementation'],
                executionTimeMs: 0,
                metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    
    /**
     * Get available validators for the given document types
     * @param documentTypes Document types to check
     * @returns Array of applicable validators
     */
    public getApplicableValidators(documentTypes: string[]): IValidator[] {
        const filter: ValidatorFilter = {
            enabledOnly: true,
            documentTypes
        };
        
        return this.registry.getValidators(filter).map(reg => reg.validator);
    }
    
    /**
     * Register a new validator
     * @param validator The validator to register
     * @param options Registration options
     */
    public registerValidator(
        validator: IValidator,
        options: {
            enabled?: boolean;
            version?: string;
            tags?: string[];
            metadata?: Record<string, any>;
        } = {}
    ): void {
        this.registry.register(validator, options);
    }
    
    /**
     * Get registry statistics
     */
    public getStats() {
        return this.registry.getStats();
    }
    
    /**
     * List all registered validators
     */
    public listValidators(): void {
        this.registry.listValidators();
    }
    
    /**
     * Run validators in parallel
     */
    private async runValidatorsInParallel(
        validators: IValidator[],
        config: ValidationConfig,
        options: ValidationExecutionOptions
    ): Promise<ValidationResult[]> {
        const maxConcurrency = options.maxConcurrency || 3;
        const results: ValidationResult[] = [];
        
        // Process validators in batches
        for (let i = 0; i < validators.length; i += maxConcurrency) {
            const batch = validators.slice(i, i + maxConcurrency);
            const batchPromises = batch.map(validator => this.runValidatorSafely(validator, config));
            const batchResults = await Promise.all(batchPromises);
            
            results.push(...batchResults.filter(result => result !== null) as ValidationResult[]);
            
            // Check for critical failures
            if (options.stopOnCriticalFailure) {
                const criticalFailure = batchResults.find(result => 
                    result && result.severity === 'critical' && !result.passed
                );
                if (criticalFailure) {
                    console.warn(`🚨 Critical failure detected, stopping validation: ${criticalFailure.validatorName}`);
                    break;
                }
            }
        }
        
        return results;
    }
    
    /**
     * Run validators sequentially
     */
    private async runValidatorsSequentially(
        validators: IValidator[],
        config: ValidationConfig,
        options: ValidationExecutionOptions
    ): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];
        
        for (const validator of validators) {
            const result = await this.runValidatorSafely(validator, config);
            if (result) {
                results.push(result);
                
                // Check for critical failures
                if (options.stopOnCriticalFailure && result.severity === 'critical' && !result.passed) {
                    console.warn(`🚨 Critical failure detected, stopping validation: ${result.validatorName}`);
                    break;
                }
            }
        }
        
        return results;
    }
    
    /**
     * Safely run a validator with error handling
     */
    private async runValidatorSafely(
        validator: IValidator,
        config: ValidationConfig
    ): Promise<ValidationResult | null> {
        try {
            const result = await validator.validate(config);
            console.log(`${result.passed ? '✅' : '❌'} ${validator.name}: ${result.score}/${result.maxScore}`);
            return result;
        } catch (error) {
            console.error(`❌ Error running validator '${validator.id}':`, error);
            return null;
        }
    }
    
    /**
     * Aggregate validation results into comprehensive report
     */
    private aggregateResults(
        validatorResults: ValidationResult[],
        config: ValidationConfig,
        options: ValidationExecutionOptions
    ): ComprehensiveValidationReport {
        const totalValidators = validatorResults.length;
        const passedValidators = validatorResults.filter(r => r.passed).length;
        const failedValidators = totalValidators - passedValidators;
        
        // Calculate overall score
        const totalScore = validatorResults.reduce((sum, r) => sum + r.score, 0);
        const maxPossibleScore = validatorResults.reduce((sum, r) => sum + r.maxScore, 0);
        const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
        
        // Determine compliance
        const complianceThreshold = options.complianceThreshold || 70;
        const overallPassed = overallScore >= complianceThreshold && failedValidators === 0;
        
        // Aggregate issues by severity
        const issuesSummary = {
            critical: [] as string[],
            warning: [] as string[],
            info: [] as string[]
        };
        
        const strengths: string[] = [];
        const recommendations: string[] = [];
        
        for (const result of validatorResults) {
            issuesSummary[result.severity].push(...result.issues);
            strengths.push(...result.strengths);
            recommendations.push(...result.recommendations);
        }
        
        // Calculate document scores (simplified for now)
        const documentScores: Record<string, any> = {};
        for (const docType of Object.keys(config.documents)) {
            const docResults = validatorResults.filter(r => 
                r.metadata?.documentType === docType || r.validatorId.includes(docType)
            );
            
            if (docResults.length > 0) {
                const docScore = docResults.reduce((sum, r) => sum + r.score, 0);
                const docMaxScore = docResults.reduce((sum, r) => sum + r.maxScore, 0);
                
                documentScores[docType] = {
                    score: docMaxScore > 0 ? Math.round((docScore / docMaxScore) * 100) : 0,
                    maxScore: 100,
                    issues: docResults.flatMap(r => r.issues),
                    strengths: docResults.flatMap(r => r.strengths)
                };
            }
        }
        
        return {
            summary: {
                totalValidators,
                passedValidators,
                failedValidators,
                overallScore,
                maxPossibleScore: 100,
                overallPassed,
                executionTimeMs: 0, // Will be set by caller
                timestamp: new Date()
            },
            validatorResults,
            issuesSummary,
            strengths: [...new Set(strengths)], // Remove duplicates
            recommendations: [...new Set(recommendations)], // Remove duplicates
            consistencyScore: overallScore, // Simplified for now
            documentScores,
            pmbokCompliance: {
                score: overallScore,
                isCompliant: overallPassed,
                missingElements: issuesSummary.critical,
                documentQuality: documentScores
            }
        };
    }
}
