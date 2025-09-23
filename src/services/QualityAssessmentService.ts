// Quality Assessment Service
// filepath: src/services/QualityAssessmentService.ts

import { ProjectDocument } from '../models/ProjectDocument.js';

export interface QualityAssessmentResult {
  overallScore: number;
  dimensionScores: {
    structure: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    relevance: number;
    professionalQuality: number;
    standardsCompliance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  assessmentDate: Date;
  assessmentVersion: string;
}

export default class QualityAssessmentService {
  private static instance: QualityAssessmentService;

  private constructor() {
    // Simple initialization
  }

  static getInstance(): QualityAssessmentService {
    if (!QualityAssessmentService.instance) {
      QualityAssessmentService.instance = new QualityAssessmentService();
    }
    return QualityAssessmentService.instance;
  }

  /**
   * Assess document quality comprehensively
   */
  async assessDocumentQuality(
    documentContent: string,
    documentType: string,
    projectContext?: any,
    framework: string = 'multi'
  ): Promise<QualityAssessmentResult> {
    try {
      console.log(`🔍 Starting quality assessment for ${documentType} document`);
      
      // Perform basic quality assessment
      return this.performBasicQualityAssessment(documentContent, documentType, framework);
    } catch (error) {
      console.error(`❌ Error during quality assessment for ${documentType}:`, error);
      // Fallback to basic assessment
      return this.performBasicQualityAssessment(documentContent, documentType, framework);
    }
  }

  /**
   * Perform basic quality assessment
   */
  private performBasicQualityAssessment(
    documentContent: string,
    documentType: string,
    framework: string = 'multi'
  ): QualityAssessmentResult {
    console.log(`📊 Performing basic quality assessment for ${documentType}`);
    
    const wordCount = documentContent.split(' ').length;
    const sectionCount = (documentContent.match(/^#{1,6}\s+/gm) || []).length;
    const hasHeadings = sectionCount > 0;
    const hasContent = wordCount > 100;
    const hasStructure = hasHeadings && hasContent;
    
    // Basic scoring based on content analysis
    const structureScore = hasStructure ? 80 : (hasHeadings ? 60 : 40);
    const completenessScore = hasContent ? 75 : 30;
    const accuracyScore = 70; // Default neutral score
    const consistencyScore = 65; // Default neutral score
    const relevanceScore = 70; // Default neutral score
    const professionalQualityScore = hasStructure ? 75 : 50;
    const standardsComplianceScore = framework === 'pmbok' ? 80 : 70;
    
    const overallScore = Math.round(
      (structureScore + completenessScore + accuracyScore + consistencyScore + 
       relevanceScore + professionalQualityScore + standardsComplianceScore) / 7
    );
    
    const dimensionScores = {
      structure: structureScore,
      completeness: completenessScore,
      accuracy: accuracyScore,
      consistency: consistencyScore,
      relevance: relevanceScore,
      professionalQuality: professionalQualityScore,
      standardsCompliance: standardsComplianceScore
    };
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    if (hasStructure) {
      strengths.push('Well-structured document with clear headings');
    } else {
      weaknesses.push('Document lacks clear structure and headings');
      recommendations.push('Add proper headings and section organization');
    }
    
    if (hasContent) {
      strengths.push('Comprehensive content coverage');
    } else {
      weaknesses.push('Document content appears incomplete');
      recommendations.push('Expand document content with more detailed information');
    }
    
    if (wordCount > 500) {
      strengths.push('Detailed and comprehensive content');
    } else if (wordCount < 200) {
      weaknesses.push('Document content is too brief');
      recommendations.push('Add more detailed explanations and examples');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Consider adding more specific examples');
      recommendations.push('Review for consistency in terminology');
      recommendations.push('Ensure all required sections are included');
    }
    
    return {
      overallScore,
      dimensionScores,
      strengths,
      weaknesses,
      recommendations,
      assessmentDate: new Date(),
      assessmentVersion: '1.0.0-basic'
    };
  }

  /**
   * Update document with quality assessment results
   */
  async updateDocumentQualityScore(documentId: string, qualityResult: QualityAssessmentResult): Promise<void> {
    try {
      const document = await ProjectDocument.findById(documentId);
      if (!document) {
        console.warn(`⚠️ Document with ID ${documentId} not found for quality score update.`);
        return;
      }

      document.qualityScore = qualityResult.overallScore;
      document.metadata = {
        ...document.metadata,
        qualityAssessment: qualityResult,
      };
      await document.save();
      console.log(`✅ Document ${documentId} updated with quality score: ${qualityResult.overallScore}%`);
    } catch (error) {
      console.error(`❌ Error updating quality score for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get quality assessment for a document
   */
  async getDocumentQualityAssessment(documentId: string): Promise<QualityAssessmentResult | null> {
    try {
      const document = await ProjectDocument.findById(documentId).select('qualityScore metadata.qualityAssessment');
      if (!document) {
        return null;
      }

      // Check if detailed quality assessment exists in metadata
      const detailedAssessment = (document.metadata as any)?.qualityAssessment;
      if (detailedAssessment) {
        return detailedAssessment;
      }

      // If no detailed assessment, create a basic one from the quality score
      if (document.qualityScore !== undefined && document.qualityScore !== null) {
        return {
          overallScore: document.qualityScore,
          dimensionScores: {
            structure: Math.max(0, document.qualityScore - 10),
            completeness: Math.max(0, document.qualityScore - 5),
            accuracy: document.qualityScore,
            consistency: Math.max(0, document.qualityScore - 8),
            relevance: Math.max(0, document.qualityScore - 6),
            professionalQuality: Math.max(0, document.qualityScore - 7),
            standardsCompliance: Math.max(0, document.qualityScore - 4)
          },
          strengths: document.qualityScore >= 70 ? [
            'Document has good overall quality',
            'Content appears well-structured',
            'Meets basic quality standards'
          ] : [],
          weaknesses: document.qualityScore < 70 ? [
            'Document quality could be improved',
            'Content may need additional review',
            'Consider enhancing structure and completeness'
          ] : [],
          recommendations: [
            'Review document structure and organization',
            'Ensure all required sections are included',
            'Consider adding more detailed content'
          ],
          assessmentDate: new Date(),
          assessmentVersion: '1.0.0-basic'
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting quality assessment for document ${documentId}:`, error);
      return null;
    }
  }
}