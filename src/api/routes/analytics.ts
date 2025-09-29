import { Router, Request, Response } from 'express';
import dbConnection from '../../config/database.js';

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
    
    // Get templates count (active only)
    const activeTemplatesCount = await db.collection('templates').countDocuments({ is_active: { $ne: false } });
    
    // Get users count (active users)
    const activeUsersCount = await db.collection('users').countDocuments({ isActive: true });
    
    // Get projects for calculations
    const projects = await db.collection('projects').find({}).toArray();
    
    // Calculate time saved from actual document values
    const projectDocuments = await db.collection('projectdocuments').find({}).toArray();
    const timeSaved = projectDocuments.reduce((total, doc) => {
      // Sum up the actual time saved values from each document
      return total + (doc.timeSaved || 0);
    }, 0);
    
    // Calculate success rate based on completed projects
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const successRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = await db.collection('realtime_metrics').countDocuments({
      timestamp: { $gte: thirtyDaysAgo.toISOString() }
    });
    
    console.log(`📊 Analytics: ${activeTemplatesCount} templates, ${activeUsersCount} users, ${timeSaved}h saved (from ${projectDocuments.length} documents), ${successRate}% success`);
    
    res.status(200).json({
      success: true,
      data: {
        templatesCreated: activeTemplatesCount,
        activeUsers: activeUsersCount,
        timeSaved: timeSaved,
        successRate: successRate,
        totalProjects: projects.length,
        completedProjects: completedProjects,
        totalDocuments: projectDocuments.length,
        recentActivities: recentActivities,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
