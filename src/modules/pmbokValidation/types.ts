/**
 * PMBOK Validation Types
 * Type definitions for PMBOK validation functionality
 */

/**
 * Interface for PMBOK compliance validation result
 */
export interface PMBOKComplianceResult {
    /** Whether the documents are PMBOK compliant */
    compliance: boolean;
    /** Consistency score from 0-100 */
    consistencyScore: number;
    /** Issues and recommendations */
    findings: {
        /** Critical compliance issues */
        critical: string[];
        /** Warning-level issues */
        warnings: string[];
        /** Improvement recommendations */
        recommendations: string[];
    };
    /** Quality assessment for individual documents */
    documentQuality: Record<string, DocumentQualityAssessment>;
}

/**
 * Interface for document quality assessment
 */
export interface DocumentQualityAssessment {
    /** Quality score from 0-100 */
    score: number;
    /** Issues found in document */
    issues: string[];
    /** Strengths of the document */
    strengths: string[];
}

/**
 * Interface for document requirements
 */
export interface PMBOKDocumentRequirements {
    /** Required elements in the document */
    required: string[];
    /** Document category */
    category: string;
}

/**
 * Combined validation result
 */
export interface ComprehensiveValidationResult {
    /** Basic validation result (file existence) */
    validation: {
        isComplete: boolean;
        missing: string[];
        errors: string[];
    };
    /** PMBOK compliance validation result */
    pmbokCompliance: PMBOKComplianceResult;
}
