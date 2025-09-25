import express from 'express';
import { ComplianceAuditService } from '../../services/ComplianceAuditService.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/compliance-audit/events
 * Get compliance-specific audit events
 */
router.get('/events', async (req, res) => {
  try {
    const {
      projectId,
      standardType,
      eventType,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const events = await ComplianceAuditService.getComplianceEvents(
      projectId as string,
      standardType as string,
      eventType as string,
      start,
      end,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      message: 'Compliance audit events retrieved successfully',
      data: {
        events,
        total: events.length,
        filters: {
          projectId,
          standardType,
          eventType,
          startDate: start,
          endDate: end,
          limit: parseInt(limit as string)
        }
      }
    });
  } catch (error) {
    logger.error('❌ Error fetching compliance audit events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve compliance audit events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/compliance-audit/analytics
 * Get compliance analytics data
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

    const analytics = await ComplianceAuditService.getComplianceAnalytics(
      projectId as string,
      start,
      end
    );

    if (!analytics) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate compliance analytics'
      });
    }

    res.json({
      success: true,
      message: 'Compliance analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('❌ Error fetching compliance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve compliance analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/compliance-audit/log-score-change
 * Log a compliance score change event
 */
router.post('/log-score-change', async (req, res) => {
  try {
    const {
      projectId,
      documentId,
      userId,
      userName,
      standardType,
      previousScore,
      newScore,
      contextData
    } = req.body;

    if (!projectId || !userId || !userName || !standardType || 
        previousScore === undefined || newScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, userId, userName, standardType, previousScore, newScore'
      });
    }

    await ComplianceAuditService.logScoreChange(
      projectId,
      documentId,
      userId,
      userName,
      standardType,
      previousScore,
      newScore,
      contextData
    );

    res.json({
      success: true,
      message: 'Compliance score change logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging compliance score change:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log compliance score change',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/compliance-audit/log-issue-created
 * Log a compliance issue creation event
 */
router.post('/log-issue-created', async (req, res) => {
  try {
    const {
      projectId,
      documentId,
      userId,
      userName,
      issueId,
      issueTitle,
      issueSeverity,
      standardType,
      contextData
    } = req.body;

    if (!projectId || !userId || !userName || !issueId || !issueTitle || 
        !issueSeverity || !standardType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, userId, userName, issueId, issueTitle, issueSeverity, standardType'
      });
    }

    await ComplianceAuditService.logIssueCreated(
      projectId,
      documentId,
      userId,
      userName,
      issueId,
      issueTitle,
      issueSeverity,
      standardType,
      contextData
    );

    res.json({
      success: true,
      message: 'Compliance issue creation logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging compliance issue creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log compliance issue creation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/compliance-audit/log-issue-resolved
 * Log a compliance issue resolution event
 */
router.post('/log-issue-resolved', async (req, res) => {
  try {
    const {
      projectId,
      documentId,
      userId,
      userName,
      issueId,
      issueTitle,
      issueSeverity,
      standardType,
      resolutionNotes,
      contextData
    } = req.body;

    if (!projectId || !userId || !userName || !issueId || !issueTitle || 
        !issueSeverity || !standardType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, userId, userName, issueId, issueTitle, issueSeverity, standardType'
      });
    }

    await ComplianceAuditService.logIssueResolved(
      projectId,
      documentId,
      userId,
      userName,
      issueId,
      issueTitle,
      issueSeverity,
      standardType,
      resolutionNotes,
      contextData
    );

    res.json({
      success: true,
      message: 'Compliance issue resolution logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging compliance issue resolution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log compliance issue resolution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/compliance-audit/log-workflow-event
 * Log a compliance workflow event
 */
router.post('/log-workflow-event', async (req, res) => {
  try {
    const {
      eventType,
      projectId,
      documentId,
      userId,
      userName,
      workflowId,
      workflowName,
      workflowStatus,
      standardType,
      contextData
    } = req.body;

    if (!eventType || !projectId || !userId || !userName || !workflowId || 
        !workflowName || !workflowStatus) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventType, projectId, userId, userName, workflowId, workflowName, workflowStatus'
      });
    }

    await ComplianceAuditService.logWorkflowEvent(
      eventType,
      projectId,
      documentId,
      userId,
      userName,
      workflowId,
      workflowName,
      workflowStatus,
      standardType,
      contextData
    );

    res.json({
      success: true,
      message: 'Compliance workflow event logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging compliance workflow event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log compliance workflow event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/compliance-audit/log-assessment
 * Log a compliance assessment event
 */
router.post('/log-assessment', async (req, res) => {
  try {
    const {
      projectId,
      documentId,
      userId,
      userName,
      standardType,
      assessmentType,
      complianceLevel,
      score,
      contextData
    } = req.body;

    if (!projectId || !userId || !userName || !standardType || 
        !assessmentType || !complianceLevel || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, userId, userName, standardType, assessmentType, complianceLevel, score'
      });
    }

    await ComplianceAuditService.logAssessmentEvent(
      projectId,
      documentId,
      userId,
      userName,
      standardType,
      assessmentType,
      complianceLevel,
      score,
      contextData
    );

    res.json({
      success: true,
      message: 'Compliance assessment logged successfully'
    });
  } catch (error) {
    logger.error('❌ Error logging compliance assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log compliance assessment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
