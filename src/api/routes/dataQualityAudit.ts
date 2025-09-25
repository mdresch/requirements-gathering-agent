import * as express from 'express';
import { DataQualityAuditService } from '../../services/DataQualityAuditService.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/v1/data-quality-audit/log-assessment
 * Log a data quality assessment event
 */
router.post('/log-assessment', async (req, res) => {
  try {
    const {
      assessmentId,
      documentId,
      projectId,
      userId,
      userName,
      assessmentType,
      overallScore,
      dimensions,
      issues,
      recommendations,
      metadata,
      contextData
    } = req.body;

    if (!assessmentId || !documentId || !projectId || !userId || !userName || 
        !assessmentType || overallScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assessmentId, documentId, projectId, userId, userName, assessmentType, overallScore'
      });
    }

    const assessment = {
      assessmentId,
      documentId,
      projectId,
      userId,
      userName,
      assessmentType,
      timestamp: new Date(),
      overallScore,
      dimensions: dimensions || {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        validity: 0,
        uniqueness: 0
      },
      issues: issues || [],
      recommendations: recommendations || [],
      metadata: metadata || {
        dataSource: 'manual',
        validationRules: [],
        assessmentDuration: 0
      }
    };

    await DataQualityAuditService.logDataQualityAssessment(assessment, contextData);

    res.json({
      success: true,
      message: 'Data quality assessment logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging data quality assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log data quality assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/data-quality-audit/log-issue-resolution
 * Log a data quality issue resolution event
 */
router.post('/log-issue-resolution', async (req, res) => {
  try {
    const {
      documentId,
      projectId,
      userId,
      userName,
      issueId,
      issueType,
      resolutionMethod,
      resolutionNotes,
      contextData
    } = req.body;

    if (!documentId || !projectId || !userId || !userName || !issueId || 
        !issueType || !resolutionMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentId, projectId, userId, userName, issueId, issueType, resolutionMethod'
      });
    }

    await DataQualityAuditService.logIssueResolution(
      documentId,
      projectId,
      userId,
      userName,
      issueId,
      issueType,
      resolutionMethod,
      resolutionNotes,
      contextData
    );

    res.json({
      success: true,
      message: 'Data quality issue resolution logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging data quality issue resolution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log data quality issue resolution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/data-quality-audit/log-rule-validation
 * Log a data quality rule validation event
 */
router.post('/log-rule-validation', async (req, res) => {
  try {
    const {
      documentId,
      projectId,
      userId,
      userName,
      ruleId,
      ruleName,
      validationResult,
      violations,
      contextData
    } = req.body;

    if (!documentId || !projectId || !userId || !userName || !ruleId || 
        !ruleName || !validationResult) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentId, projectId, userId, userName, ruleId, ruleName, validationResult'
      });
    }

    await DataQualityAuditService.logRuleValidation(
      documentId,
      projectId,
      userId,
      userName,
      ruleId,
      ruleName,
      validationResult,
      violations || [],
      contextData
    );

    res.json({
      success: true,
      message: 'Data quality rule validation logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging data quality rule validation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log data quality rule validation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/data-quality-audit/log-quality-improvement
 * Log a data quality improvement event
 */
router.post('/log-quality-improvement', async (req, res) => {
  try {
    const {
      documentId,
      projectId,
      userId,
      userName,
      previousScore,
      newScore,
      improvementMethod,
      improvements,
      contextData
    } = req.body;

    if (!documentId || !projectId || !userId || !userName || 
        previousScore === undefined || newScore === undefined || !improvementMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentId, projectId, userId, userName, previousScore, newScore, improvementMethod'
      });
    }

    await DataQualityAuditService.logQualityImprovement(
      documentId,
      projectId,
      userId,
      userName,
      previousScore,
      newScore,
      improvementMethod,
      improvements || [],
      contextData
    );

    res.json({
      success: true,
      message: 'Data quality improvement logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging data quality improvement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log data quality improvement',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/data-quality-audit/events
 * Get data quality audit events
 */
router.get('/events', async (req, res) => {
  try {
    const {
      projectId,
      assessmentType,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const events = await DataQualityAuditService.getDataQualityEvents(
      projectId as string,
      assessmentType as string,
      start,
      end,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      message: 'Data quality audit events retrieved successfully',
      data: {
        events,
        total: events.length,
        filters: {
          projectId,
          assessmentType,
          startDate: start,
          endDate: end,
          limit: parseInt(limit as string)
        }
      }
    });
  } catch (error) {
    logger.error('❌ Error fetching data quality audit events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data quality audit events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/data-quality-audit/analytics
 * Get data quality analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const {
      projectId,
      startDate,
      endDate
    } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const analytics = await DataQualityAuditService.getDataQualityAnalytics(
      projectId as string,
      start,
      end
    );

    if (!analytics) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate data quality analytics'
      });
    }

    res.json({
      success: true,
      message: 'Data quality analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('❌ Error fetching data quality analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data quality analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
