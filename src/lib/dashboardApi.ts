import { apiClient } from './api';

export interface QualityTrendData {
  period: string;
  date: string;
  qualityScore: number;
  babokScore: number;
  pmbokScore: number;
  feedbackScore: number;
}

export interface DashboardMetrics {
  babokCompliance: number;
  pmbokCompliance: number;
  overallScore: number;
  feedbackScore: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    responseTime: number;
    databaseStatus: 'connected' | 'disconnected';
    apiStatus: 'operational' | 'degraded' | 'down';
  };
  qualityTrends: QualityTrendData[];
  recentActivities: Array<{
    id: string;
    type: 'document_generated' | 'feedback_submitted' | 'quality_assessed' | 'compliance_checked';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    projectId?: string;
    documentId?: string;
  }>;
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageQualityScore: number;
    totalDocuments: number;
    totalFeedback: number;
  };
}

export class DashboardApiService {
  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Load all required data in parallel
      const [
        complianceResponse,
        projectsResponse,
        feedbackResponse,
        qualityTrendsResponse,
        systemHealthResponse
      ] = await Promise.all([
        apiClient.getStandardsCompliance(),
        apiClient.getProjects(),
        apiClient.getFeedbackSummary(),
        this.getQualityTrends(),
        this.getSystemHealth()
      ]);

      // Process compliance data
      const babokCompliance = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.babok || 0 
        : 0;
      const pmbokCompliance = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.pmbok || 0 
        : 0;
      const overallScore = complianceResponse.success 
        ? complianceResponse.data?.overallScore || 0 
        : 0;

      // Process projects data
      const projects = projectsResponse.success ? projectsResponse.data || [] : [];
      const totalProjects = projects.length;
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;

      // Process feedback data
      const feedbackScore = feedbackResponse.success 
        ? feedbackResponse.data?.averageRating || 0 
        : 0;
      const totalFeedback = feedbackResponse.success 
        ? feedbackResponse.data?.totalFeedback || 0 
        : 0;

      // Calculate average quality score from projects
      const averageQualityScore = projects.length > 0
        ? projects.reduce((sum: number, p: any) => sum + (p.qualityScore || 0), 0) / projects.length
        : 0;

      // Count total documents across all projects
      const totalDocuments = await this.getTotalDocumentsCount();

      // Get recent activities
      const recentActivities = await this.getRecentActivities();

      return {
        babokCompliance,
        pmbokCompliance,
        overallScore,
        feedbackScore,
        systemHealth: systemHealthResponse,
        qualityTrends: qualityTrendsResponse,
        recentActivities,
        projectStats: {
          totalProjects,
          activeProjects,
          completedProjects,
          averageQualityScore: Math.round(averageQualityScore),
          totalDocuments,
          totalFeedback
        }
      };
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get quality trends over time
   */
  static async getQualityTrends(days: number = 56): Promise<QualityTrendData[]> {
    try {
      // In a real implementation, this would query historical quality data
      // For now, we'll generate realistic mock data based on current metrics
      
      const complianceResponse = await apiClient.getStandardsCompliance();
      const currentBabok = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.babok || 90 
        : 90;
      const currentPmbok = complianceResponse.success 
        ? complianceResponse.data?.standardsCompliance?.pmbok || 87 
        : 87;
      const currentOverall = complianceResponse.success 
        ? complianceResponse.data?.overallScore || 88 
        : 88;

      // Generate trend data with realistic progression
      const trends: QualityTrendData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < Math.ceil(days / 7); i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        // Generate realistic progression with some variation
        const progressFactor = (i + 1) / Math.ceil(days / 7);
        const variation = (Math.random() - 0.5) * 4; // ±2% variation
        
        const qualityScore = Math.max(60, Math.min(100, 
          Math.round(70 + (currentOverall - 70) * progressFactor + variation)
        ));
        const babokScore = Math.max(60, Math.min(100, 
          Math.round(75 + (currentBabok - 75) * progressFactor + variation)
        ));
        const pmbokScore = Math.max(60, Math.min(100, 
          Math.round(72 + (currentPmbok - 72) * progressFactor + variation)
        ));
        const feedbackScore = Math.max(2.0, Math.min(5.0, 
          Math.round((3.0 + (4.0 - 3.0) * progressFactor + (Math.random() - 0.5) * 0.4) * 10) / 10
        ));

        trends.push({
          period: `Week ${i + 1}`,
          date: weekStart.toISOString().split('T')[0],
          qualityScore,
          babokScore,
          pmbokScore,
          feedbackScore
        });
      }

      return trends;
    } catch (error) {
      console.error('Error loading quality trends:', error);
      return [];
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<DashboardMetrics['systemHealth']> {
    try {
      // In a real implementation, this would check actual system health
      // For now, we'll simulate a healthy system
      
      // Simulate response time check
      const startTime = Date.now();
      await apiClient.getStandardsCompliance();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        uptime: 99.9,
        responseTime,
        databaseStatus: 'connected',
        apiStatus: responseTime < 1000 ? 'operational' : 'degraded'
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'error',
        uptime: 0,
        responseTime: 0,
        databaseStatus: 'disconnected',
        apiStatus: 'down'
      };
    }
  }

  /**
   * Get total documents count across all projects
   */
  static async getTotalDocumentsCount(): Promise<number> {
    try {
      const projectsResponse = await apiClient.getProjects();
      if (!projectsResponse.success || !projectsResponse.data) {
        return 0;
      }

      let totalDocuments = 0;
      const projects = projectsResponse.data;

      // Get documents count for each project
      for (const project of projects) {
        try {
          const documentsResponse = await apiClient.getProjectDocuments(project.id);
          if (documentsResponse.success && documentsResponse.data) {
            totalDocuments += documentsResponse.data.length;
          }
        } catch (error) {
          console.warn(`Failed to get documents for project ${project.id}:`, error);
        }
      }

      return totalDocuments;
    } catch (error) {
      console.error('Error getting total documents count:', error);
      return 0;
    }
  }

  /**
   * Get recent activities across the system
   */
  static async getRecentActivities(limit: number = 10): Promise<DashboardMetrics['recentActivities']> {
    try {
      const activities: DashboardMetrics['recentActivities'] = [];

      // Get recent projects
      const projectsResponse = await apiClient.getProjects();
      if (projectsResponse.success && projectsResponse.data) {
        const projects = projectsResponse.data.slice(0, 3); // Get last 3 projects

        for (const project of projects) {
          try {
            // Get recent documents for this project
            const documentsResponse = await apiClient.getProjectDocuments(project.id);
            if (documentsResponse.success && documentsResponse.data) {
              const recentDocs = documentsResponse.data
                .sort((a: any, b: any) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                .slice(0, 2);

              recentDocs.forEach((doc: any, index: number) => {
                activities.push({
                  id: `doc_${doc.id}_${index}`,
                  type: 'document_generated',
                  title: `${doc.name} Generated`,
                  description: `New ${doc.type} document created for ${project.name}`,
                  timestamp: doc.generatedAt,
                  status: 'success',
                  projectId: project.id,
                  documentId: doc.id
                });
              });
            }

            // Get recent feedback for this project
            const feedbackResponse = await apiClient.getProjectFeedback(project.id);
            if (feedbackResponse.success && feedbackResponse.data) {
              const recentFeedback = feedbackResponse.data
                .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 1);

              recentFeedback.forEach((feedback: any, index: number) => {
                activities.push({
                  id: `feedback_${feedback._id}_${index}`,
                  type: 'feedback_submitted',
                  title: 'New Feedback Received',
                  description: `User feedback on ${feedback.documentType} (Rating: ${feedback.rating}/5)`,
                  timestamp: feedback.submittedAt,
                  status: 'success',
                  projectId: project.id,
                  documentId: feedback.documentId
                });
              });
            }
          } catch (error) {
            console.warn(`Failed to get activities for project ${project.id}:`, error);
          }
        }
      }

      // Sort all activities by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  /**
   * Get quality metrics for a specific project
   */
  static async getProjectQualityMetrics(projectId: string): Promise<{
    averageQualityScore: number;
    documentCount: number;
    feedbackCount: number;
    averageRating: number;
    trends: QualityTrendData[];
  }> {
    try {
      const [documentsResponse, feedbackResponse] = await Promise.all([
        apiClient.getProjectDocuments(projectId),
        apiClient.getProjectFeedback(projectId)
      ]);

      const documents = documentsResponse.success ? documentsResponse.data || [] : [];
      const feedback = feedbackResponse.success ? feedbackResponse.data || [] : [];

      const averageQualityScore = documents.length > 0
        ? documents.reduce((sum: number, doc: any) => sum + (doc.qualityScore || 0), 0) / documents.length
        : 0;

      const averageRating = feedback.length > 0
        ? feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / feedback.length
        : 0;

      // Generate project-specific trends
      const trends = await this.getProjectQualityTrends(projectId);

      return {
        averageQualityScore: Math.round(averageQualityScore),
        documentCount: documents.length,
        feedbackCount: feedback.length,
        averageRating: Math.round(averageRating * 10) / 10,
        trends
      };
    } catch (error) {
      console.error('Error getting project quality metrics:', error);
      return {
        averageQualityScore: 0,
        documentCount: 0,
        feedbackCount: 0,
        averageRating: 0,
        trends: []
      };
    }
  }

  /**
   * Get quality trends for a specific project
   */
  static async getProjectQualityTrends(projectId: string, days: number = 28): Promise<QualityTrendData[]> {
    try {
      // This would typically query historical quality data for the specific project
      // For now, we'll generate project-specific trends
      
      const projectMetrics = await this.getProjectQualityMetrics(projectId);
      const currentScore = projectMetrics.averageQualityScore || 80;

      const trends: QualityTrendData[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < Math.ceil(days / 7); i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        
        const progressFactor = (i + 1) / Math.ceil(days / 7);
        const variation = (Math.random() - 0.5) * 6; // ±3% variation for project-specific data
        
        const qualityScore = Math.max(60, Math.min(100, 
          Math.round(70 + (currentScore - 70) * progressFactor + variation)
        ));

        trends.push({
          period: `Week ${i + 1}`,
          date: weekStart.toISOString().split('T')[0],
          qualityScore,
          babokScore: Math.max(60, qualityScore + Math.round((Math.random() - 0.5) * 8)),
          pmbokScore: Math.max(60, qualityScore + Math.round((Math.random() - 0.5) * 8)),
          feedbackScore: Math.max(2.0, Math.min(5.0, 
            Math.round((3.0 + (projectMetrics.averageRating - 3.0) * progressFactor + (Math.random() - 0.5) * 0.6) * 10) / 10
          ))
        });
      }

      return trends;
    } catch (error) {
      console.error('Error getting project quality trends:', error);
      return [];
    }
  }
}
