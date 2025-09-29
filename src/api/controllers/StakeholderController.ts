import { Request, Response } from 'express';
import { Stakeholder, IStakeholder } from '../../models/Stakeholder.js';
import { Project } from '../../models/Project.js';
import { logger } from '../../utils/logger.js';
import { validationResult } from 'express-validator';
import { 
  createSuccessResponse, 
  createPaginatedResponse, 
  transformDocuments,
  validateAndConvertId,
  handleIdValidationError 
} from '../../utils/idUtils.js';

export class StakeholderController {
  
  /**
   * Get all stakeholders for a project
   */
  public static async getProjectStakeholders(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { role, active } = req.query;

      // Verify project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      // Build filter
      const filter: any = { projectId };
      if (role) filter.role = role;
      if (active !== undefined) filter.isActive = active === 'true';

      const stakeholders = await Stakeholder.find(filter)
        .sort({ role: 1, priorityScore: -1, name: 1 });

      // Group stakeholders by role
      const groupedStakeholders = {
        project_manager: stakeholders.filter(s => s.role === 'project_manager'),
        sponsors: stakeholders.filter(s => s.role === 'sponsor'),
        team_members: stakeholders.filter(s => s.role === 'team_member'),
        end_users: stakeholders.filter(s => s.role === 'end_user'),
        stakeholders: stakeholders.filter(s => s.role === 'stakeholder')
      };

      const responseData = {
        stakeholders: transformDocuments(stakeholders),
        groupedStakeholders: {
          project_manager: transformDocuments(groupedStakeholders.project_manager),
          sponsors: transformDocuments(groupedStakeholders.sponsors),
          team_members: transformDocuments(groupedStakeholders.team_members),
          end_users: transformDocuments(groupedStakeholders.end_users),
          stakeholders: transformDocuments(groupedStakeholders.stakeholders)
        },
        summary: {
          total: stakeholders.length,
          byRole: {
            project_manager: groupedStakeholders.project_manager.length,
            sponsors: groupedStakeholders.sponsors.length,
            team_members: groupedStakeholders.team_members.length,
            end_users: groupedStakeholders.end_users.length,
            stakeholders: groupedStakeholders.stakeholders.length
          },
          active: stakeholders.filter(s => s.isActive).length,
          inactive: stakeholders.filter(s => !s.isActive).length
        }
      };

      res.json(createSuccessResponse(responseData, 'Stakeholders retrieved successfully'));

      logger.info(`📊 Retrieved ${stakeholders.length} stakeholders for project ${projectId}`);
    } catch (error: any) {
      logger.error('❌ Error retrieving stakeholders:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve stakeholders'
      });
    }
  }

  /**
   * Create a new stakeholder
   */
  public static async createStakeholder(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const stakeholderData = req.body;
      stakeholderData.projectId = req.params.projectId;

      // Verify project exists
      const project = await Project.findById(stakeholderData.projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      const stakeholder = new Stakeholder(stakeholderData);
      await stakeholder.save();

      // Update project stakeholder count
      await Project.findByIdAndUpdate(stakeholderData.projectId, {
        $inc: { stakeholders: 1 }
      });

      res.status(201).json({
        success: true,
        data: stakeholder
      });

      logger.info(`✅ Created stakeholder "${stakeholder.name}" for project ${stakeholderData.projectId}`);
    } catch (error: any) {
      logger.error('❌ Error creating stakeholder:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create stakeholder'
      });
    }
  }

  /**
   * Update a stakeholder
   */
  public static async updateStakeholder(req: Request, res: Response): Promise<void> {
    try {
      const { stakeholderId } = req.params;
      const updateData = req.body;

      const stakeholder = await Stakeholder.findByIdAndUpdate(
        stakeholderId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!stakeholder) {
        res.status(404).json({
          success: false,
          error: 'Stakeholder not found'
        });
        return;
      }

      res.json({
        success: true,
        data: stakeholder
      });

      logger.info(`✅ Updated stakeholder "${stakeholder.name}"`);
    } catch (error: any) {
      logger.error('❌ Error updating stakeholder:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update stakeholder'
      });
    }
  }

  /**
   * Delete a stakeholder
   */
  public static async deleteStakeholder(req: Request, res: Response): Promise<void> {
    try {
      const { stakeholderId } = req.params;

      const stakeholder = await Stakeholder.findById(stakeholderId);
      if (!stakeholder) {
        res.status(404).json({
          success: false,
          error: 'Stakeholder not found'
        });
        return;
      }

      await Stakeholder.findByIdAndDelete(stakeholderId);

      // Update project stakeholder count
      await Project.findByIdAndUpdate(stakeholder.projectId, {
        $inc: { stakeholders: -1 }
      });

      res.json({
        success: true,
        message: 'Stakeholder deleted successfully'
      });

      logger.info(`✅ Deleted stakeholder "${stakeholder.name}"`);
    } catch (error: any) {
      logger.error('❌ Error deleting stakeholder:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete stakeholder'
      });
    }
  }

  /**
   * Get stakeholder analytics for a project
   */
  public static async getStakeholderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const stakeholders = await Stakeholder.find({ projectId });

      // Calculate analytics
      const analytics = {
        totalStakeholders: stakeholders.length,
        byRole: {
          project_manager: stakeholders.filter(s => s.role === 'project_manager').length,
          sponsors: stakeholders.filter(s => s.role === 'sponsor').length,
          team_members: stakeholders.filter(s => s.role === 'team_member').length,
          end_users: stakeholders.filter(s => s.role === 'end_user').length,
          stakeholders: stakeholders.filter(s => s.role === 'stakeholder').length
        },
        byInfluence: {
          critical: stakeholders.filter(s => s.influence === 'critical').length,
          high: stakeholders.filter(s => s.influence === 'high').length,
          medium: stakeholders.filter(s => s.influence === 'medium').length,
          low: stakeholders.filter(s => s.influence === 'low').length
        },
        byEngagement: {
          high: stakeholders.filter(s => s.engagementLevel >= 4).length,
          medium: stakeholders.filter(s => s.engagementLevel === 3).length,
          low: stakeholders.filter(s => s.engagementLevel <= 2).length
        },
        averagePowerLevel: stakeholders.reduce((sum, s) => sum + s.powerLevel, 0) / stakeholders.length || 0,
        averageEngagementLevel: stakeholders.reduce((sum, s) => sum + s.engagementLevel, 0) / stakeholders.length || 0,
        activeStakeholders: stakeholders.filter(s => s.isActive).length,
        communicationPreferences: {
          email: stakeholders.filter(s => s.communicationPreference === 'email').length,
          phone: stakeholders.filter(s => s.communicationPreference === 'phone').length,
          meeting: stakeholders.filter(s => s.communicationPreference === 'meeting').length,
          portal: stakeholders.filter(s => s.communicationPreference === 'portal').length
        }
      };

      res.json({
        success: true,
        data: analytics
      });

      logger.info(`📊 Generated stakeholder analytics for project ${projectId}`);
    } catch (error: any) {
      logger.error('❌ Error generating stakeholder analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate stakeholder analytics'
      });
    }
  }
}
