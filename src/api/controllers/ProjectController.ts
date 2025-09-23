// Project Controller
// filepath: src/api/controllers/ProjectController.ts

import { Request, Response } from 'express';
import { Project, IProject } from '../../models/Project.js';
import { ProjectDocument } from '../../models/ProjectDocument.js';
import { logger } from '../../utils/logger.js';
import { validationResult } from 'express-validator';

export class ProjectController {
  
  /**
   * Get all projects with optional filtering and pagination
   */
  public static async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        framework,
        owner,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (status) filter.status = status;
      if (framework) filter.framework = framework;
      if (owner) filter.owner = new RegExp(owner as string, 'i');
      if (search) {
        filter.$or = [
          { name: new RegExp(search as string, 'i') },
          { description: new RegExp(search as string, 'i') }
        ];
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [projects, total] = await Promise.all([
        Project.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Project.countDocuments(filter)
      ]);

      // Calculate accurate document and stakeholder counts for each project
      const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
          try {
            // Count non-deleted documents (handle both null and undefined deletedAt)
            const documentCount = await ProjectDocument.countDocuments({ 
              projectId: project._id.toString(),
              $or: [
                { deletedAt: { $exists: false } },
                { deletedAt: null }
              ]
            });
            
            
            // Count active stakeholders (with fallback if collection doesn't exist)
            let stakeholderCount = 0;
            try {
              // Try to import and use Stakeholder model
              const { Stakeholder } = await import('../../models/Stakeholder.js');
              stakeholderCount = await Stakeholder.countDocuments({ 
                projectId: project._id.toString(),
                isActive: true
              });
            } catch (error) {
              console.log(`⚠️ Stakeholder collection not available for project ${project._id}, using 0`);
              stakeholderCount = 0;
            }

            // Calculate compliance score from individual document compliance scores
            let calculatedComplianceScore = 0;
            if (documentCount > 0) {
              const documents = await ProjectDocument.find({ 
                projectId: project._id.toString(),
                $or: [
                  { deletedAt: { $exists: false } },
                  { deletedAt: null }
                ]
              });
              
              // Calculate average compliance score from documents
              const complianceScores = documents.map(doc => {
                // Use metadata.complianceScore first, then qualityScore as fallback
                return doc.metadata?.complianceScore || doc.qualityScore || 0;
              });
              
              if (complianceScores.length > 0) {
                calculatedComplianceScore = Math.round(
                  complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length
                );
              }
            }

            console.log(`📊 Project ${project.name}: docs=${documentCount}, stakeholders=${stakeholderCount}, compliance=${calculatedComplianceScore}%`);

            return {
              ...project.toJSON(),
              documents: documentCount,
              stakeholders: stakeholderCount,
              complianceScore: calculatedComplianceScore
            };
          } catch (error) {
            console.error(`❌ Error calculating counts for project ${project._id}:`, error);
            // Fallback to existing values
            return {
              ...project.toJSON(),
              documents: project.documents || 0,
              stakeholders: project.stakeholders || 0,
              complianceScore: project.complianceScore || 0
            };
          }
        })
      );

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: projectsWithCounts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          status,
          framework,
          owner,
          search
        }
      });

      logger.info(`📊 Retrieved ${projects.length} projects (page ${pageNum}/${totalPages})`);
    } catch (error: any) {
      logger.error('❌ Error retrieving projects:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve projects'
      });
    }
  }

  /**
   * Get a single project by ID
   */
  public static async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);
      
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        data: project
      });

      logger.info(`📊 Retrieved project: ${project.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error retrieving project:', error);
      
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid project ID format'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve project'
      });
    }
  }

  /**
   * Create a new project
   */
  public static async createProject(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid input data',
          details: errors.array()
        });
        return;
      }

      const projectData = req.body;
      
      // Create new project
      const project = new Project(projectData);
      const savedProject = await project.save();

      res.status(201).json({
        success: true,
        data: savedProject,
        message: 'Project created successfully'
      });

      logger.info(`✅ Created new project: ${savedProject.name} (${savedProject._id})`);
    } catch (error: any) {
      logger.error('❌ Error creating project:', error);

      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid project data',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create project'
      });
    }
  }

  /**
   * Update an existing project
   */
  public static async updateProject(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid input data',
          details: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      const project = await Project.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });

      logger.info(`✅ Updated project: ${project.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error updating project:', error);

      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid project ID format'
        });
        return;
      }

      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid project data',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update project'
      });
    }
  }

  /**
   * Delete a project
   */
  public static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Project deleted successfully',
        data: { id: project._id, name: project.name }
      });

      logger.info(`🗑️ Deleted project: ${project.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error deleting project:', error);

      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid project ID format'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete project'
      });
    }
  }

  /**
   * Get project statistics
   */
  public static async getProjectStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await Project.aggregate([
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            averageComplianceScore: { $avg: '$complianceScore' },
            totalDocuments: { $sum: '$documents' },
            totalStakeholders: { $sum: '$stakeholders' }
          }
        },
        {
          $project: {
            _id: 0,
            totalProjects: 1,
            averageComplianceScore: { $round: ['$averageComplianceScore', 2] },
            totalDocuments: 1,
            totalStakeholders: 1
          }
        }
      ]);

      const statusStats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const frameworkStats = await Project.aggregate([
        {
          $group: {
            _id: '$framework',
            count: { $sum: 1 },
            averageCompliance: { $avg: '$complianceScore' }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            averageCompliance: { $round: ['$averageCompliance', 2] }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalProjects: 0,
            averageComplianceScore: 0,
            totalDocuments: 0,
            totalStakeholders: 0
          },
          statusBreakdown: statusStats,
          frameworkBreakdown: frameworkStats
        }
      });

      logger.info('📊 Retrieved project statistics');
    } catch (error: any) {
      logger.error('❌ Error retrieving project statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve project statistics'
      });
    }
  }
}
