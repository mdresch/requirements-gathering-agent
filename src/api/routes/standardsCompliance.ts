/**
 * Standards Compliance & Deviation Analysis API Routes
 * 
 * RESTful API endpoints for project standards compliance analysis,
 * deviation detection, and intelligent recommendation generation.
 */

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { StandardsComplianceAnalysisEngine } from '../../modules/standardsCompliance/StandardsComplianceEngine.js';
import { 
  AnalysisRequest, 
  AnalysisResponse, 
  StandardsComplianceConfig,
  ProjectData
} from '../../types/standardsCompliance.js';
import { logger } from '../../config/logger.js';

// Additional type definitions for the API
interface DeviationApprovalRequest {
  approver: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments: string;
  conditions?: string[];
}

interface ComplianceDashboardData {
  projectSummary: {
    projectId: string;
    projectName: string;
    status: string;
    lastAnalyzed: Date;
    nextReview: Date;
    overallScore: number;
    trendDirection: 'IMPROVING' | 'DECLINING' | 'STABLE';
  };
  complianceOverview: {
    standards: {
      babok: { score: number; trend: string; status: string };
      pmbok: { score: number; trend: string; status: string };
      dmbok: { score: number; trend: string; status: string };
      iso: { score: number; trend: string; status: string };
    };
  };
  recentDeviations: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: Date;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate: Date;
    assignee: string;
  }>;
  // Allow for additional properties that might be present
  [key: string]: any;
}

const router = express.Router();

// Default configuration for standards compliance analysis
const DEFAULT_CONFIG: StandardsComplianceConfig = {
  enabledStandards: ['BABOK_V3', 'PMBOK_7', 'DMBOK_2'],
  analysisDepth: 'COMPREHENSIVE',
  intelligentDeviationThreshold: 85,
  riskToleranceLevel: 'MEDIUM',
  includeRecommendations: true,
  generateExecutiveSummary: true,
  outputFormat: 'JSON'
};

// Initialize the analysis engine
const analysisEngine = new StandardsComplianceAnalysisEngine(DEFAULT_CONFIG);

/**
 * @route POST /api/v1/standards/analyze
 * @desc Perform comprehensive standards compliance analysis
 * @access Private
 */
router.post('/analyze',
  [
    body('projectData.projectId').isString().notEmpty().withMessage('Project ID is required'),
    body('projectData.projectName').isString().notEmpty().withMessage('Project name is required'),
    body('projectData.industry').isIn([
      'FINANCIAL_SERVICES', 'HEALTHCARE', 'GOVERNMENT', 'TECHNOLOGY', 
      'MANUFACTURING', 'RETAIL', 'ENERGY', 'TELECOMMUNICATIONS', 'OTHER'
    ]).withMessage('Valid industry is required'),
    body('projectData.projectType').isIn([
      'TRANSFORMATION', 'IMPLEMENTATION', 'ENHANCEMENT', 'COMPLIANCE', 
      'INTEGRATION', 'RESEARCH', 'OPERATIONS'
    ]).withMessage('Valid project type is required'),
    body('projectData.complexity').isIn(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).withMessage('Valid complexity level is required'),
    body('config.enabledStandards').optional().isArray().withMessage('Enabled standards must be an array'),
    body('requestedBy').isString().notEmpty().withMessage('Requestor identification is required')
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { projectData, config = DEFAULT_CONFIG, requestedBy, analysisType = 'FULL' } = req.body;

      logger.info(`🎯 Standards compliance analysis requested by ${requestedBy} for project ${projectData.projectId}`);

      // Create analysis request
      const analysisRequest: AnalysisRequest = {
        requestId: `REQ-${Date.now()}`,
        projectData: projectData as ProjectData,
        enabledStandards: DEFAULT_CONFIG.enabledStandards,
        analysisOptions: {
          includeIntelligentDeviations: true,
          includeCrossStandardAnalysis: true,
          generateExecutiveSummary: DEFAULT_CONFIG.generateExecutiveSummary,
          detailLevel: 'COMPREHENSIVE',
          riskAssessmentLevel: 'COMPREHENSIVE'
        },
        requestDate: new Date(),
        requestor: requestedBy
      };

      // Perform analysis
      const analysisResponse: AnalysisResponse = await analysisEngine.analyzeProject(analysisRequest);

      if (analysisResponse.status === 'FAILED') {
        return res.status(500).json({
          success: false,
          message: 'Analysis failed',
          error: analysisResponse.error,
          analysisId: analysisResponse.analysisId
        });
      }

      logger.info(`✅ Standards compliance analysis completed: ${analysisResponse.analysisId}`);

      res.status(200).json({
        success: true,
        message: 'Standards compliance analysis completed successfully',
        data: {
          analysisId: analysisResponse.analysisId,
          processingTime: analysisResponse.processingTime,
          results: analysisResponse.results,
          summary: {
            overallScore: analysisResponse.results?.complianceMatrix?.standards ? 
              analysisResponse.results.complianceMatrix.standards.reduce((sum, std) => sum + std.overallScore, 0) / analysisResponse.results.complianceMatrix.standards.length : 0,
            deviationCount: (analysisResponse.results?.standardDeviations?.length || 0) + 
                           (analysisResponse.results?.intelligentDeviations?.length || 0),
            riskLevel: analysisResponse.results?.riskLevel || 'UNKNOWN',
            recommendation: analysisResponse.results?.executiveSummary?.overallAssessment?.recommendation || 'REVIEW_REQUIRED'
          }
        }
      });

    } catch (error) {
      logger.error('❌ Standards compliance analysis endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during standards analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance/dashboard
 * @desc Get compliance dashboard data
 * @access Private
 */
router.get('/dashboard',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('timeframe').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid timeframe')
  ],
  async (req: Request, res: Response) => {
    try {
      const { projectId = 'current-project', timeframe = '30d' } = req.query;

      logger.info(`📊 Compliance dashboard requested for project: ${projectId}`);

      // Mock dashboard data - in production this would come from database
      const dashboardData: ComplianceDashboardData = {
        projectSummary: {
          projectId: projectId as string,
          projectName: 'Current Project Analysis',
          status: 'Active',
          lastAnalyzed: new Date(),
          nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          overallScore: 87,
          trendDirection: 'IMPROVING'
        },
        complianceOverview: {
          standards: {
            babok: { score: 94, trend: '+2%', status: 'FULLY_COMPLIANT' },
            pmbok: { score: 89, trend: '+5%', status: 'MOSTLY_COMPLIANT' },
            dmbok: { score: 78, trend: 'stable', status: 'PARTIALLY_COMPLIANT' },
            iso: { score: 85, trend: '+1%', status: 'MOSTLY_COMPLIANT' }
          }
        },
        deviationSummary: {
          total: 12,
          byCategory: {
            METHODOLOGY: 4,
            PROCESS: 5,
            DELIVERABLE: 2,
            GOVERNANCE: 1,
            TOOLS: 0,
            TECHNIQUES: 0,
            ROLES: 0,
            WORKFLOWS: 0
          },
          bySeverity: {
            CRITICAL: 0,
            HIGH: 2,
            MEDIUM: 6,
            LOW: 4,
            INFORMATIONAL: 0
          },
          byStatus: {
            PENDING: 3,
            APPROVED: 8,
            CONDITIONALLY_APPROVED: 1,
            REJECTED: 0,
            UNDER_REVIEW: 0,
            REQUIRES_ESCALATION: 0
          },
          intelligent: {
            total: 8,
            approved: 6,
            pending: 2,
            recommended: 7
          }
        },
        riskMetrics: {
          overallRisk: 'LOW',
          riskByCategory: {
            COMPLIANCE: 'LOW',
            OPERATIONAL: 'MEDIUM',
            FINANCIAL: 'LOW',
            REPUTATIONAL: 'LOW',
            TECHNICAL: 'LOW',
            STRATEGIC: 'MEDIUM'
          },
          topRisks: [
            {              riskId: 'RISK-001',
              description: 'Documentation gaps in hybrid methodology',
              severity: 'MEDIUM',
              probability: 'LOW',
              impact: 'MODERATE',
              mitigation: 'Enhanced documentation templates',
              owner: 'Business Analyst',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          ],
          mitigationProgress: 75
        },
        trends: {
          scores: [
            { date: new Date('2025-05-22'), value: 82 },
            { date: new Date('2025-06-01'), value: 85 },
            { date: new Date('2025-06-15'), value: 87 }
          ],
          deviations: [
            { date: new Date('2025-05-22'), value: 15 },
            { date: new Date('2025-06-01'), value: 13 },
            { date: new Date('2025-06-15'), value: 12 }
          ],
          risks: [
            { date: new Date('2025-05-22'), value: 8 },
            { date: new Date('2025-06-01'), value: 6 },
            { date: new Date('2025-06-15'), value: 4 }
          ],
          period: timeframe as string
        },
        recentDeviations: [
          {
            id: 'DEV-001',
            title: 'Intelligent methodology deviation',
            severity: 'MEDIUM',
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'DEV-002',
            title: 'Process adaptation for agile framework',
            severity: 'LOW',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        actionItems: [
          {
            id: 'ACT-001',
            title: 'Review and approve intelligent methodology deviation',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            assignee: 'Project Manager'
          },
          {
            id: 'ACT-002',
            title: 'Update DMBOK compliance documentation',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            assignee: 'Data Architect'
          }
        ],
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            actor: 'Project Manager',
            action: 'Approved intelligent deviation',
            details: 'Hybrid methodology approach for requirements gathering',
            impact: 'Positive - Expected 40% time savings'
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            actor: 'Business Analyst',
            action: 'Completed standards analysis',
            details: 'BABOK v3 compliance review',
            impact: 'Score improved from 91 to 94'
          }
        ]
      };

      res.status(200).json({
        success: true,
        message: 'Compliance dashboard data retrieved successfully',
        data: dashboardData
      });

    } catch (error) {
      logger.error('❌ Compliance dashboard endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving compliance dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/deviations/summary
 * @desc Get deviation analysis summary
 * @access Private
 */
router.get('/deviations/summary',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('category').optional().isIn(['METHODOLOGY', 'PROCESS', 'DELIVERABLE', 'GOVERNANCE', 'TOOLS', 'TECHNIQUES', 'ROLES', 'WORKFLOWS']).withMessage('Invalid category')
  ],
  async (req: Request, res: Response) => {
    try {
      const { projectId = 'current-project', category } = req.query;

      logger.info(`📋 Deviation summary requested for project: ${projectId}${category ? `, category: ${category}` : ''}`);

      // Mock deviation summary - in production this would query the database
      const deviationSummary = {
        projectId,        totalDeviations: 12,
        standardDeviations: 4,
        intelligentDeviations: 8,
        byCategory: category ? 
          { [category as string]: 3 } : {
          METHODOLOGY: 4,
          PROCESS: 5,
          DELIVERABLE: 2,
          GOVERNANCE: 1
        },
        riskDistribution: {
          VERY_LOW: 2,
          LOW: 6,
          MEDIUM: 3,
          HIGH: 1,
          VERY_HIGH: 0
        },
        approvalStatus: {
          approved: 8,
          pending: 3,
          underReview: 1,
          rejected: 0
        },
        topIntelligentDeviations: [
          {
            deviationId: 'INT-DEV-001',
            category: 'METHODOLOGY',
            description: 'Hybrid agile-waterfall requirements gathering',
            evidenceScore: 92,
            recommendation: 'STRONGLY_APPROVE',
            benefits: ['40% time savings', '25% reduction in changes'],
            approvalStatus: 'PENDING'
          },
          {
            deviationId: 'INT-DEV-002',
            category: 'PROCESS',
            description: 'Tiered change control process',
            evidenceScore: 88,
            recommendation: 'APPROVE',
            benefits: ['60% faster processing', 'Maintained quality'],
            approvalStatus: 'APPROVED'
          }
        ]
      };

      res.status(200).json({
        success: true,
        message: 'Deviation summary retrieved successfully',
        data: deviationSummary
      });

    } catch (error) {
      logger.error('❌ Deviation summary endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving deviation summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/deviations/approve/:id
 * @desc Approve or reject a deviation
 * @access Private
 */
router.post('/deviations/approve/:id',
  [
    param('id').isString().notEmpty().withMessage('Deviation ID is required'),
    body('approver').isString().notEmpty().withMessage('Approver identification is required'),
    body('decision').isIn(['APPROVE', 'REJECT', 'REQUEST_CHANGES']).withMessage('Valid decision is required'),
    body('comments').isString().notEmpty().withMessage('Comments are required'),
    body('conditions').optional().isArray().withMessage('Conditions must be an array')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { approver, decision, comments, conditions = [] }: DeviationApprovalRequest = req.body;

      logger.info(`✅ Deviation approval request: ${id} by ${approver} - ${decision}`);

      // In production, this would update the database
      const approvalResult = {
        deviationId: id,
        approver,
        decision,
        comments,
        conditions,
        approvalDate: new Date(),
        status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW'
      };

      res.status(200).json({
        success: true,
        message: `Deviation ${decision.toLowerCase()}${decision === 'APPROVE' ? 'ed' : decision === 'REJECT' ? 'ed' : ' - changes requested'}`,
        data: approvalResult
      });

    } catch (error) {
      logger.error('❌ Deviation approval endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing deviation approval',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/reports/executive-summary
 * @desc Generate executive summary report
 * @access Private
 */
router.get('/reports/executive-summary',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('format').optional().isIn(['JSON', 'PDF', 'HTML', 'MARKDOWN']).withMessage('Invalid format'),
    query('includeDetails').optional().isBoolean().withMessage('Include details must be boolean')
  ],
  async (req: Request, res: Response) => {
    try {
      const { projectId = 'current-project', format = 'JSON', includeDetails = true } = req.query;

      logger.info(`📄 Executive summary requested for project: ${projectId}, format: ${format}`);

      // Mock executive summary - in production this would be generated from actual analysis
      const executiveSummary = {
        projectId,
        generatedDate: new Date(),
        format,
        summary: {
          overallCompliance: 87,
          riskLevel: 'LOW',
          recommendation: 'PROCEED_WITH_CONDITIONS',
          keyHighlights: [
            'Strong alignment with BABOK v3 (94% compliance)',
            '8 intelligent deviations identified with high evidence scores',
            'Expected 40% efficiency improvement from methodology changes',
            'All critical risks have mitigation strategies in place'
          ]
        },
        complianceBreakdown: {
          babok: { score: 94, status: 'COMPLIANT', trend: 'IMPROVING' },
          pmbok: { score: 89, status: 'MOSTLY_COMPLIANT', trend: 'STABLE' },
          dmbok: { score: 78, status: 'PARTIALLY_COMPLIANT', trend: 'IMPROVING' }
        },
        intelligentDeviations: {
          total: 8,
          highValue: 5,
          recommended: 7,
          estimatedBenefits: {
            timeSavings: '40%',
            costReduction: '$50,000',
            qualityImprovement: '25%'
          }
        },
        riskProfile: {
          level: 'LOW',
          mitigation: '85% coverage',
          monitoring: 'Active',
          topConcerns: [
            'Documentation compliance in hybrid approach',
            'Team coordination complexity'
          ]
        },
        recommendations: [
          'Approve intelligent methodology deviations with enhanced documentation',
          'Implement monitoring for cross-team coordination',
          'Schedule quarterly compliance reviews',
          'Develop DMBOK improvement plan'
        ],
        nextSteps: [
          'Obtain executive approval for methodology changes',
          'Implement enhanced documentation templates',
          'Begin DMBOK compliance improvement initiative',
          'Establish ongoing monitoring processes'
        ]
      };

      if (format === 'PDF' || format === 'HTML' || format === 'MARKDOWN') {
        // In production, this would generate the actual formatted report
        res.status(200).json({
          success: true,
          message: `Executive summary generated in ${format} format`,
          data: {
            ...executiveSummary,
            downloadUrl: `/api/v1/reports/download/${projectId}-executive-summary.${format.toLowerCase()}`,
            note: `${format} generation would be implemented in production`
          }
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Executive summary retrieved successfully',
          data: executiveSummary
        });
      }

    } catch (error) {
      logger.error('❌ Executive summary endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating executive summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/standards/health
 * @desc Health check for standards compliance service
 * @access Public
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Standards Compliance & Deviation Analysis Service is healthy',
    timestamp: new Date(),
    version: '1.0.0',
    features: {
      multiStandardAnalysis: true,
      intelligentDeviations: true,
      executiveReporting: true,
      realTimeAnalysis: true
    }
  });
});

export default router;
