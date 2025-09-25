// Project Document Controller
// filepath: src/api/controllers/ProjectDocumentController.ts

import { Request, Response } from 'express';
import { ProjectDocument, IProjectDocument } from '../../models/ProjectDocument.js';
import { Project } from '../../models/Project.js';
import { logger } from '../../utils/logger.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export class ProjectDocumentController {
  // Health check for database connection
  public static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const connectionState = mongoose.connection.readyState;
      const connectionStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      const isHealthy = connectionState === 1;
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: connectionStates[connectionState as keyof typeof connectionStates],
        readyState: connectionState,
        timestamp: new Date().toISOString(),
        message: isHealthy ? 'Database connection is healthy' : 'Database connection is not ready'
      });
    } catch (error: any) {
      res.status(503).json({
        success: false,
        error: 'Health check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  // Get all documents for a project
  public static async getProjectDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 10, status, type, framework } = req.query;

      // Validate project ID format
      if (!projectId || typeof projectId !== 'string') {
        logger.error('❌ Invalid project ID provided:', projectId);
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Project ID is required and must be a valid string'
        });
        return;
      }

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        logger.error('❌ Database connection not ready, state:', mongoose.connection.readyState);
        res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Database connection is not available. Please try again later.'
        });
        return;
      }

      const filter: any = { 
        projectId,
        deletedAt: null  // Only return non-deleted documents
      };
      
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (framework) filter.framework = framework;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      logger.info(`🔍 Querying documents for project ${projectId} with filter:`, filter);

      const [documents, total] = await Promise.all([
        ProjectDocument.find(filter)
          .sort({ lastModified: -1 })
          .skip(skip)
          .limit(limitNum),
        ProjectDocument.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: documents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocuments: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });

      logger.info(`📄 Retrieved ${documents.length} documents for project ${projectId} (total: ${total})`);
    } catch (error: any) {
      logger.error('❌ Error fetching project documents:', error);
      
      // Handle specific error types
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid project ID format'
        });
        return;
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Database connection error. Please try again later.'
        });
        return;
      }
      
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve project documents',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a specific document by ID
  public static async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await ProjectDocument.findById(id);
      
      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      res.json({
        success: true,
        data: document
      });

      logger.info(`📄 Retrieved document: ${document.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error retrieving document:', error);
      
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid document ID format'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve document'
      });
    }
  }

  // Create a new document
  public static async createDocument(req: Request, res: Response): Promise<void> {
    try {
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

      const documentData = {
        ...req.body,
        generatedBy: req.body.generatedBy || 'System',
        lastModifiedBy: req.body.lastModifiedBy || 'System'
      };

      const document = new ProjectDocument(documentData);
      await document.save();

      // Update project document count
      await Project.findByIdAndUpdate(
        document.projectId,
        { $inc: { documents: 1 } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document created successfully'
      });

      logger.info(`📄 Created document: ${document.name} for project ${document.projectId}`);
    } catch (error: any) {
      logger.error('❌ Error creating document:', error);
      
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid document data',
          details: Object.values(error.errors).map((err: any) => ({
            field: err.path,
            message: err.message
          }))
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create document'
      });
    }
  }

  // Update a document
  public static async updateDocument(req: Request, res: Response): Promise<void> {
    try {
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
      const updateData = {
        ...req.body,
        lastModifiedBy: req.body.lastModifiedBy || 'System'
      };

      const document = await ProjectDocument.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      res.json({
        success: true,
        data: document,
        message: 'Document updated successfully'
      });

      logger.info(`📄 Updated document: ${document.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error updating document:', error);
      
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid document ID format'
        });
        return;
      }

      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid document data',
          details: Object.values(error.errors).map((err: any) => ({
            field: err.path,
            message: err.message
          }))
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update document'
      });
    }
  }

  // Soft delete a document
  public static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await ProjectDocument.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      
      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      // Update project document count (decrease by 1)
      await Project.findByIdAndUpdate(
        document.projectId,
        { $inc: { documents: -1 } },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Document moved to trash successfully'
      });

      logger.info(`📄 Soft deleted document: ${document.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error deleting document:', error);
      
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid document ID format'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete document'
      });
    }
  }

  // Restore a soft-deleted document
  public static async restoreDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await ProjectDocument.findByIdAndUpdate(
        id,
        { deletedAt: null },
        { new: true }
      );
      
      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found'
        });
        return;
      }

      // Update project document count (increase by 1)
      await Project.findByIdAndUpdate(
        document.projectId,
        { $inc: { documents: 1 } },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Document restored successfully'
      });

      logger.info(`📄 Restored document: ${document.name} (${id})`);
    } catch (error: any) {
      logger.error('❌ Error restoring document:', error);
      
      if (error.name === 'CastError') {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid document ID format'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to restore document'
      });
    }
  }

  // Get deleted documents for a project
  public static async getDeletedDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const filter: any = { 
        projectId,
        deletedAt: { $ne: null }  // Only return deleted documents
      };

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [documents, total] = await Promise.all([
        ProjectDocument.find(filter)
          .sort({ deletedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        ProjectDocument.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        documents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocuments: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });

      logger.info(`📄 Retrieved ${documents.length} deleted documents for project ${projectId}`);
    } catch (error) {
      logger.error('❌ Error fetching deleted documents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve deleted documents'
      });
    }
  }

  // Get document statistics for a project
  public static async getDocumentStats(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      const stats = await ProjectDocument.aggregate([
        { $match: { projectId, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalDocuments: { $sum: 1 },
            avgQualityScore: { $avg: '$qualityScore' },
            totalWordCount: { $sum: '$wordCount' },
            statusBreakdown: {
              $push: {
                status: '$status',
                qualityScore: '$qualityScore'
              }
            }
          }
        }
      ]);

      const frameworkStats = await ProjectDocument.aggregate([
        { $match: { projectId, deletedAt: null } },
        {
          $group: {
            _id: '$framework',
            count: { $sum: 1 },
            avgQuality: { $avg: '$qualityScore' }
          }
        }
      ]);

      const categoryStats = await ProjectDocument.aggregate([
        { $match: { projectId, deletedAt: null } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgQuality: { $avg: '$qualityScore' }
          }
        }
      ]);

      const result = {
        totalDocuments: stats[0]?.totalDocuments || 0,
        avgQualityScore: Math.round((stats[0]?.avgQualityScore || 0) * 100) / 100,
        totalWordCount: stats[0]?.totalWordCount || 0,
        statusBreakdown: {
          draft: 0,
          review: 0,
          approved: 0,
          published: 0
        },
        frameworkBreakdown: frameworkStats,
        categoryBreakdown: categoryStats
      };

      // Calculate status breakdown
      if (stats[0]?.statusBreakdown) {
        stats[0].statusBreakdown.forEach((item: any) => {
          const status = item.status as keyof typeof result.statusBreakdown;
          if (status && result.statusBreakdown.hasOwnProperty(status)) {
            result.statusBreakdown[status] = (result.statusBreakdown[status] || 0) + 1;
          }
        });
      }

      res.json({
        success: true,
        data: result
      });

      logger.info(`📊 Retrieved document statistics for project ${projectId}`);
    } catch (error) {
      logger.error('❌ Error fetching document statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve document statistics'
      });
    }
  }
}
