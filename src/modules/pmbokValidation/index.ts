/**
 * PMBOK Validation Module
 * Exports functionality for validating PMBOK compliance
 */
import { PMBOKValidator } from './PMBOKValidator.js';
import { 
    PMBOK_DOCUMENT_REQUIREMENTS,
    PMBOK_TERMINOLOGY,
    QUALITY_THRESHOLDS,
    QUALITY_SCORING 
} from './validationRules.js';
import type { 
    PMBOKComplianceResult, 
    DocumentQualityAssessment, 
    PMBOKDocumentRequirements, 
    ComprehensiveValidationResult
} from './types.js';

// Integration with document generator
export async function validateWithPMBOK(
    documentKeys: string[], 
    basePath: string = 'generated-documents'
): Promise<ComprehensiveValidationResult> {
    const validator = new PMBOKValidator(basePath);
    return await validator.performComprehensiveValidation(documentKeys);
}

export {
    PMBOKValidator,
    PMBOK_DOCUMENT_REQUIREMENTS,
    PMBOK_TERMINOLOGY,
    // Types
    PMBOKComplianceResult,
    DocumentQualityAssessment,
    PMBOKDocumentRequirements,
    ComprehensiveValidationResult
};
