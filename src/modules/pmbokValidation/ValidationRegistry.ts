/**
 * Validation Registry
 * 
 * Central registry for all validation processors in the ADPA Quality Assurance Engine.
 * Provides registration, discovery, and management of validation rules.
 * 
 * This registry follows the factory pattern and enables dynamic discovery
 * and execution of validation checks based on document types and context.
 * 
 * @version 1.0.0
 * @author ADPA Quality Assurance Engine Team
 * @created June 2025
 */

import { IValidator } from './interfaces/IValidator.js';

/**
 * Configuration for validator registration
 */
export interface ValidatorRegistration {
    /** The validator instance */
    validator: IValidator;
    
    /** Whether this validator is currently enabled */
    enabled: boolean;
    
    /** When this validator was registered */
    registeredAt: Date;
    
    /** Version of the validator */
    version?: string;
    
    /** Additional metadata */
    metadata?: Record<string, any>;
}

/**
 * Filter criteria for validator discovery
 */
export interface ValidatorFilter {
    /** Only return validators applicable to these document types */
    documentTypes?: string[];
    
    /** Only return validators with these IDs */
    validatorIds?: string[];
    
    /** Only return enabled/disabled validators */
    enabledOnly?: boolean;
    
    /** Minimum priority level (1 = highest) */
    minPriority?: number;
    
    /** Maximum priority level (10 = lowest) */
    maxPriority?: number;
    
    /** Only return validators with specific tags */
    tags?: string[];
}

/**
 * Central registry for all validation processors
 */
export class ValidationRegistry {
    private static instance: ValidationRegistry;
    private validators: Map<string, ValidatorRegistration> = new Map();
    private tags: Map<string, Set<string>> = new Map(); // tag -> validator IDs
    
    private constructor() {}
    
    /**
     * Get the singleton instance of the registry
     */
    public static getInstance(): ValidationRegistry {
        if (!ValidationRegistry.instance) {
            ValidationRegistry.instance = new ValidationRegistry();
        }
        return ValidationRegistry.instance;
    }
    
    /**
     * Register a new validator
     * @param validator The validator to register
     * @param options Registration options
     */
    public register(
        validator: IValidator, 
        options: {
            enabled?: boolean;
            version?: string;
            tags?: string[];
            metadata?: Record<string, any>;
        } = {}
    ): void {
        if (this.validators.has(validator.id)) {
            console.warn(`Validator with ID '${validator.id}' is already registered. Replacing existing registration.`);
        }
        
        const registration: ValidatorRegistration = {
            validator,
            enabled: options.enabled ?? validator.defaultEnabled,
            registeredAt: new Date(),
            version: options.version,
            metadata: options.metadata
        };
        
        this.validators.set(validator.id, registration);
        
        // Register tags
        if (options.tags) {
            for (const tag of options.tags) {
                if (!this.tags.has(tag)) {
                    this.tags.set(tag, new Set());
                }
                this.tags.get(tag)!.add(validator.id);
            }
        }
        
        console.log(`✅ Registered validator: ${validator.name} (${validator.id})`);
    }
    
    /**
     * Unregister a validator
     * @param validatorId The ID of the validator to remove
     */
    public unregister(validatorId: string): boolean {
        const removed = this.validators.delete(validatorId);
        
        // Remove from tags
        for (const [tag, validatorIds] of this.tags) {
            validatorIds.delete(validatorId);
            if (validatorIds.size === 0) {
                this.tags.delete(tag);
            }
        }
        
        if (removed) {
            console.log(`🗑️ Unregistered validator: ${validatorId}`);
        }
        
        return removed;
    }
    
    /**
     * Enable or disable a validator
     * @param validatorId The validator ID
     * @param enabled Whether to enable or disable
     */
    public setEnabled(validatorId: string, enabled: boolean): boolean {
        const registration = this.validators.get(validatorId);
        if (registration) {
            registration.enabled = enabled;
            console.log(`${enabled ? '✅' : '❌'} ${enabled ? 'Enabled' : 'Disabled'} validator: ${validatorId}`);
            return true;
        }
        return false;
    }
    
    /**
     * Get all registered validators matching the filter
     * @param filter Optional filter criteria
     * @returns Array of validator registrations
     */
    public getValidators(filter?: ValidatorFilter): ValidatorRegistration[] {
        let validatorList = Array.from(this.validators.values());
        
        if (!filter) {
            return validatorList;
        }
        
        // Apply filters
        if (filter.enabledOnly !== undefined) {
            validatorList = validatorList.filter(reg => reg.enabled === filter.enabledOnly);
        }
        
        if (filter.validatorIds) {
            validatorList = validatorList.filter(reg => 
                filter.validatorIds!.includes(reg.validator.id)
            );
        }
        
        if (filter.documentTypes) {
            validatorList = validatorList.filter(reg =>
                reg.validator.isApplicable(filter.documentTypes!)
            );
        }
        
        if (filter.minPriority !== undefined) {
            validatorList = validatorList.filter(reg => 
                reg.validator.priority >= filter.minPriority!
            );
        }
        
        if (filter.maxPriority !== undefined) {
            validatorList = validatorList.filter(reg => 
                reg.validator.priority <= filter.maxPriority!
            );
        }
        
        if (filter.tags) {
            const matchingValidatorIds = new Set<string>();
            for (const tag of filter.tags) {
                const tagValidators = this.tags.get(tag);
                if (tagValidators) {
                    for (const validatorId of tagValidators) {
                        matchingValidatorIds.add(validatorId);
                    }
                }
            }
            validatorList = validatorList.filter(reg => 
                matchingValidatorIds.has(reg.validator.id)
            );
        }
        
        // Sort by priority (1 = highest priority)
        return validatorList.sort((a, b) => a.validator.priority - b.validator.priority);
    }
    
    /**
     * Get a specific validator by ID
     * @param validatorId The validator ID
     * @returns The validator registration or undefined
     */
    public getValidator(validatorId: string): ValidatorRegistration | undefined {
        return this.validators.get(validatorId);
    }
    
    /**
     * Check if a validator is registered
     * @param validatorId The validator ID
     * @returns Whether the validator is registered
     */
    public isRegistered(validatorId: string): boolean {
        return this.validators.has(validatorId);
    }
    
    /**
     * Get all available tags
     * @returns Array of tag names
     */
    public getTags(): string[] {
        return Array.from(this.tags.keys());
    }
    
    /**
     * Get validators by tag
     * @param tag The tag name
     * @returns Array of validator IDs with this tag
     */
    public getValidatorsByTag(tag: string): string[] {
        return Array.from(this.tags.get(tag) || []);
    }
    
    /**
     * Get registry statistics
     * @returns Statistics about the registry
     */
    public getStats(): {
        totalValidators: number;
        enabledValidators: number;
        disabledValidators: number;
        totalTags: number;
        validatorsByPriority: Record<number, number>;
    } {
        const validatorList = Array.from(this.validators.values());
        const enabled = validatorList.filter(v => v.enabled).length;
        
        const priorityCounts: Record<number, number> = {};
        for (const reg of validatorList) {
            const priority = reg.validator.priority;
            priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        }
        
        return {
            totalValidators: validatorList.length,
            enabledValidators: enabled,
            disabledValidators: validatorList.length - enabled,
            totalTags: this.tags.size,
            validatorsByPriority: priorityCounts
        };
    }
    
    /**
     * Clear all registered validators (useful for testing)
     */
    public clear(): void {
        this.validators.clear();
        this.tags.clear();
        console.log('🧹 Cleared all registered validators');
    }
    
    /**
     * List all registered validators for debugging
     */
    public listValidators(): void {
        console.log('\n📋 Registered Validators:');
        console.log('========================');
        
        const validatorList = this.getValidators();
        for (const reg of validatorList) {
            const status = reg.enabled ? '✅' : '❌';
            console.log(`${status} [P${reg.validator.priority}] ${reg.validator.name} (${reg.validator.id})`);
            console.log(`    ${reg.validator.description}`);
            if (reg.validator.applicableDocuments.length > 0) {
                console.log(`    📄 Applies to: ${reg.validator.applicableDocuments.join(', ')}`);
            }
        }
        
        const stats = this.getStats();
        console.log(`\n📊 Total: ${stats.totalValidators} validators (${stats.enabledValidators} enabled, ${stats.disabledValidators} disabled)`);
    }
}
