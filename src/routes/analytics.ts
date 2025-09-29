// Analytics routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/analytics/projects - Get project analytics
router.get('/projects', async (req: Request, res: Response) => {
  try {
    // Get real project data from MongoDB
    const projects = await mongoose.connection.db?.collection('projects')
      .find({})
      .limit(10)
      .toArray() || [];

    const analytics = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      averageComplianceScore: projects.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / Math.max(projects.length, 1),
      projectsByStatus: {
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        archived: projects.filter(p => p.status === 'archived').length
      },
      recentProjects: projects.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        status: p.status,
        complianceScore: p.complianceScore || 0,
        createdAt: p.createdAt
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('❌ Analytics projects endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to retrieve project analytics'
      }
    });
  }
});

// GET /api/v1/analytics/active-documents-count - Count active documents
router.get('/active-documents-count', async (req: Request, res: Response) => {
  try {
    console.log('📊 Counting active documents...');
    
    const documentCount = await mongoose.connection.db?.collection('projectdocuments')
      .countDocuments({ deletedAt: { $exists: false } }) || 0;
    
    const templateCount = await mongoose.connection.db?.collection('templates')
      .countDocuments({ 
        $and: [
          { deletedAt: { $exists: false } },
          { is_deleted: { $ne: true } }
        ]
      }) || 0;
    
    const projectCount = await mongoose.connection.db?.collection('projects')
      .countDocuments({}) || 0;
    
    res.json({
      success: true,
      data: {
        documents: documentCount,
        templates: templateCount,
        projects: projectCount,
        total: documentCount + templateCount + projectCount
      }
    });
  } catch (error: any) {
    console.error('❌ Active documents count error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COUNT_ERROR',
        message: 'Failed to count active documents'
      }
    });
  }
});

// GET /api/v1/analytics/homepage - Get homepage analytics
router.get('/homepage', async (req: Request, res: Response) => {
  try {
    // Get real data from MongoDB
    const projects = await mongoose.connection.db?.collection('projects').find({}).toArray() || [];
    const documents = await mongoose.connection.db?.collection('projectdocuments').find({}).toArray() || [];
    const templates = await mongoose.connection.db?.collection('templates').find({}).toArray() || [];
    
    const analytics = {
      overview: {
        totalProjects: projects.length,
        totalDocuments: documents.length,
        totalTemplates: templates.length,
        activeProjects: projects.filter(p => p.status === 'active').length
      },
      recentActivity: {
        recentProjects: projects.slice(0, 3).map(p => ({
          id: p._id,
          name: p.name,
          status: p.status,
          createdAt: p.createdAt
        })),
        recentDocuments: documents.slice(0, 5).map(d => ({
          id: d._id,
          name: d.name || d.title,
          projectId: d.projectId,
          createdAt: d.createdAt
        }))
      },
      performance: {
        averageComplianceScore: projects.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / Math.max(projects.length, 1),
        documentGenerationRate: documents.length / Math.max(projects.length, 1),
        templateUtilizationRate: templates.filter(t => t.is_active).length / Math.max(templates.length, 1)
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('❌ Homepage analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HOMEPAGE_ANALYTICS_ERROR',
        message: 'Failed to retrieve homepage analytics'
      }
    });
  }
});

export default router;
