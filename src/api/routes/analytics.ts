import { Router, Request, Response } from 'express';
import dbConnection from '../../config/database.js';
import { createSuccessResponse } from '../../utils/idUtils.js';

const router = Router();

// Analytics endpoint for homepage stats
router.get('/homepage', async (req: Request, res: Response) => {
  try {
    console.log('📊 Loading homepage analytics...');
    
    // Get database connection
    const connection = await dbConnection.connect();
    if (!connection || connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const db = connection.db;
    if (!db) {
      throw new Error('Database instance not available');
    }
    
    // Type assertion to help TypeScript understand db is not null
    const database = db as NonNullable<typeof db>;
    
    // Get templates count (active only)
    const activeTemplatesCount = await database.collection('templates').countDocuments({ is_active: { $ne: false } });
    
    // Get users count (active users)
    const activeUsersCount = await database.collection('users').countDocuments({ isActive: true });
    
    // Get projects for calculations
    const projects = await database.collection('projects').find({}).toArray();
    
    // Calculate conservative time saved using low amounts from template ranges
    // Only include active (non-deleted) documents
    const projectDocuments = await database.collection('projectdocuments').find({
      deletedAt: { $exists: false }
    }).toArray();
    
    // Get all templates to extract time estimates
    const templates = await database.collection('templates').find({ is_active: { $ne: false } }).toArray();
    
    // Build dynamic time estimates from template metadata
    const TIME_ESTIMATES: Record<string, number> = {};
    templates.forEach(template => {
      const docKey = template.documentKey || template.name || 'unknown';
      let timeSaved = 2; // Default conservative estimate
      
      if (template.metadata?.estimatedTime) {
        const estimatedTime = template.metadata.estimatedTime;
        
        if (typeof estimatedTime === 'string') {
          // Extract first number from strings like "2-4 hours", "6-8 hours", "7-9 hours"
          const match = estimatedTime.match(/(\d+)/);
          if (match) {
            timeSaved = parseInt(match[1]);
          }
        } else if (typeof estimatedTime === 'number') {
          timeSaved = estimatedTime;
        }
      }
      
      TIME_ESTIMATES[docKey] = timeSaved;
    });
    
    let totalTimeSaved = 0;
    const templateBreakdown: Record<string, { timeSaved: number, documentCount: number, totalTimeSaved: number }> = {};
    
    // Calculate time saved for each active document using dynamic estimates
    projectDocuments.forEach(doc => {
      const docType = doc.type || 'unknown';
      const timeSaved = TIME_ESTIMATES[docType] || 2; // Default to 2 hours for unknown types
      
      totalTimeSaved += timeSaved;
      
      // Track breakdown by type
      if (!templateBreakdown[docType]) {
        templateBreakdown[docType] = {
          timeSaved: timeSaved,
          documentCount: 0,
          totalTimeSaved: 0
        };
      }
      templateBreakdown[docType].documentCount++;
      templateBreakdown[docType].totalTimeSaved += timeSaved;
    });
    
    const timeSaved = totalTimeSaved;
    
    // Calculate success rate based on completed projects
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const successRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = await database.collection('realtime_metrics').countDocuments({
      timestamp: { $gte: thirtyDaysAgo.toISOString() }
    });
    
    console.log(`📊 Analytics: ${activeTemplatesCount} templates, ${activeUsersCount} users, ${timeSaved}h saved (${Object.keys(templateBreakdown).length} templates used), ${successRate}% success`);
    
    // Log template breakdown for debugging
    Object.entries(templateBreakdown).forEach(([templateKey, data]) => {
      if (data.documentCount > 0) {
        console.log(`  📄 ${templateKey}: ${data.timeSaved}h × ${data.documentCount} docs = ${data.totalTimeSaved}h`);
      }
    });
    
    const analyticsData = {
      templatesCreated: activeTemplatesCount,
      activeUsers: activeUsersCount,
      timeSaved: timeSaved,
      successRate: successRate,
      totalProjects: projects.length,
      completedProjects: completedProjects,
      totalDocuments: projectDocuments.length,
      totalTemplates: templates.length,
      templateBreakdown: templateBreakdown,
      recentActivities: recentActivities,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(createSuccessResponse(analyticsData, 'Analytics data retrieved successfully'));
    
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Analytics endpoint to count all active documents
router.get('/active-documents-count', async (req: Request, res: Response) => {
  try {
    console.log('📊 Counting active documents...');
    
    // Get database connection
    const connection = await dbConnection.connect();
    if (!connection || connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    const db = connection.db;
    if (!db) {
      throw new Error('Database instance not available');
    }
    
    // Type assertion to help TypeScript understand db is not null
    const database = db as NonNullable<typeof db>;
    
    // Count active documents (where deletedAt doesn't exist or is null)
    const activeDocumentsCount = await database.collection('projectdocuments').countDocuments({
      deletedAt: { $exists: false }
    });
    
    // Also get breakdown by status for additional insights
    const statusBreakdown = await database.collection('projectdocuments').aggregate([
      {
        $match: {
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    // Get breakdown by document type
    const typeBreakdown = await database.collection('projectdocuments').aggregate([
      {
        $match: {
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    console.log(`📊 Active documents count: ${activeDocumentsCount}`);
    console.log(`📊 Status breakdown:`, statusBreakdown);
    console.log(`📊 Type breakdown:`, typeBreakdown);
    
    const documentsData = {
      totalActiveDocuments: activeDocumentsCount,
      statusBreakdown: statusBreakdown,
      typeBreakdown: typeBreakdown,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(createSuccessResponse(documentsData, 'Active documents count retrieved successfully'));
    
  } catch (error) {
    console.error('❌ Active documents count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count active documents',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
