// Stakeholder routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/stakeholders/project/:id - Get stakeholders for a project
router.get('/project/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PROJECT_ID',
          message: 'Project ID is required'
        }
      });
    }
    
    // Validate project exists
    const project = await mongoose.connection.db?.collection('projects')
      .findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Get stakeholders for this project
    const stakeholders = await mongoose.connection.db?.collection('stakeholders')
      .find({ projectId: id })
      .toArray() || [];
    
    res.json({
      success: true,
      data: {
        stakeholders: stakeholders,
        projectId: id
      }
    });
  } catch (error: any) {
    console.error('❌ Get project stakeholders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STAKEHOLDERS_ERROR',
        message: 'Failed to retrieve project stakeholders'
      }
    });
  }
});

export default router;
