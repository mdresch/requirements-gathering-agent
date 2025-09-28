// Phase 1: Compliance Issues Service - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { ComplianceIssueModel, IComplianceIssue } from '../models/ComplianceIssue.model.js';
import { logger } from '../utils/logger.js';

export interface ComplianceIssuesAnalytics {
  totalIssues: number;
  issuesByStatus: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issuesByStandard: Record<string, number>;
  averageResolutionTime: number;
  overdueIssues: number;
  recentIssues: IComplianceIssue[];
  topIssueTypes: Array<{
    issueType: string;
    count: number;
  }>;
}

export class ComplianceIssuesService {
  /**
   * Get compliance issues for a specific project
   */
  async getProjectIssues(projectId: string, filters?: {
    standardType?: string;
    status?: string;
    severity?: string;
    assigneeId?: string;
  }): Promise<IComplianceIssue[]> {
    try {
      const query: any = { projectId };
      
      if (filters?.standardType) {
        query.standardType = filters.standardType;
      }
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.severity) {
        query.severity = filters.severity;
      }
      if (filters?.assigneeId) {
        query.assigneeId = filters.assigneeId;
      }

      const issues = await ComplianceIssueModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      logger.info(`🐛 Retrieved ${issues.length} compliance issues for project ${projectId}`);
      return issues;
    } catch (error) {
      logger.error('❌ Error fetching project compliance issues:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for compliance issues
   */
  async getAnalytics(projectId?: string, startDate?: Date, endDate?: Date): Promise<ComplianceIssuesAnalytics> {
    try {
      const matchQuery: any = {};
      if (projectId) {
        matchQuery.projectId = projectId;
      }
      if (startDate && endDate) {
        matchQuery.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalIssues: { $sum: 1 },
            issues: { $push: '$$ROOT' },
            resolvedIssues: {
              $push: {
                $cond: [
                  { $eq: ['$status', 'RESOLVED'] },
                  {
                    issueId: '$_id',
                    createdAt: '$createdAt',
                    resolvedAt: '$resolvedAt'
                  },
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            totalIssues: 1,
            issues: 1,
            resolvedIssues: { $filter: { input: '$resolvedIssues', cond: { $ne: ['$$this', null] } } }
          }
        }
      ];

      const [analytics] = await ComplianceIssueModel.aggregate(pipeline);
      
      if (!analytics) {
        return {
          totalIssues: 0,
          issuesByStatus: {},
          issuesBySeverity: {},
          issuesByStandard: {},
          averageResolutionTime: 0,
          overdueIssues: 0,
          recentIssues: [],
          topIssueTypes: []
        };
      }

      // Calculate metrics
      const issuesByStatus: Record<string, number> = {};
      const issuesBySeverity: Record<string, number> = {};
      const issuesByStandard: Record<string, number> = {};
      const issueTypes: Record<string, number> = {};
      let overdueIssues = 0;
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      analytics.issues.forEach((issue: any) => {
        // Status counts
        issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
        
        // Severity counts
        issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
        
        // Standard counts
        issuesByStandard[issue.standardType] = (issuesByStandard[issue.standardType] || 0) + 1;
        
        // Issue type counts
        issueTypes[issue.issueType] = (issueTypes[issue.issueType] || 0) + 1;
        
        // Overdue issues
        if (issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED') {
          overdueIssues++;
        }
        
        // Resolution time calculation
        if (issue.status === 'RESOLVED' && issue.resolvedAt) {
          const resolutionTime = new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime();
          totalResolutionTime += resolutionTime;
          resolvedCount++;
        }
      });

      // Calculate average resolution time in hours
      const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) : 0;

      // Get top issue types
      const topIssueTypes = Object.entries(issueTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([issueType, count]) => ({ issueType, count }));

      // Get recent issues
      const recentIssues = analytics.issues
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      logger.info(`🐛 Generated compliance issues analytics: ${analytics.totalIssues} total issues`);

      return {
        totalIssues: analytics.totalIssues,
        issuesByStatus,
        issuesBySeverity,
        issuesByStandard,
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
        overdueIssues,
        recentIssues,
        topIssueTypes
      };
    } catch (error) {
      logger.error('❌ Error generating compliance issues analytics:', error);
      throw error;
    }
  }

  /**
   * Create a new compliance issue
   */
  async createIssue(issueData: {
    projectId: string;
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
    issueType: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string;
    dueDate?: Date;
    createdBy: string;
    tags?: string[];
    metadata?: any;
  }): Promise<IComplianceIssue> {
    try {
      const issue = new ComplianceIssueModel({
        ...issueData,
        status: 'OPEN',
        priority: issueData.priority || 'MEDIUM',
        history: [{
          action: 'CREATED',
          description: `Issue created by ${issueData.createdBy}`,
          user: issueData.createdBy,
          timestamp: new Date()
        }]
      });

      await issue.save();
      
      logger.info(`✅ Created compliance issue: ${issueData.title} for project ${issueData.projectId}`);
      return issue;
    } catch (error) {
      logger.error('❌ Error creating compliance issue:', error);
      throw error;
    }
  }

  /**
   * Update an existing compliance issue
   */
  async updateIssue(issueId: string, updateData: {
    status?: string;
    assigneeId?: string;
    priority?: string;
    dueDate?: Date;
    description?: string;
    updatedBy: string;
  }): Promise<IComplianceIssue | null> {
    try {
      const issue = await ComplianceIssueModel.findById(issueId);
      if (!issue) {
        return null;
      }

      // Track changes for history
      const changes: any = {};
      Object.keys(updateData).forEach(key => {
        if (key !== 'updatedBy' && updateData[key as keyof typeof updateData] !== undefined) {
          changes[key] = {
            from: issue[key as keyof typeof issue],
            to: updateData[key as keyof typeof updateData]
          };
        }
      });

      // Update the issue
      Object.assign(issue, updateData);
      issue.updatedBy = updateData.updatedBy;

      // Add to history
      issue.history.push({
        action: 'UPDATED',
        description: `Issue updated by ${updateData.updatedBy}`,
        user: updateData.updatedBy,
        timestamp: new Date(),
        changes
      });

      // Set resolved timestamp if status changed to RESOLVED
      if (updateData.status === 'RESOLVED' && issue.status !== 'RESOLVED') {
        issue.resolvedAt = new Date();
      }

      await issue.save();
      
      logger.info(`✅ Updated compliance issue: ${issueId}`);
      return issue;
    } catch (error) {
      logger.error('❌ Error updating compliance issue:', error);
      throw error;
    }
  }

  /**
   * Add comment to an issue
   */
  async addComment(issueId: string, commentData: {
    text: string;
    author: string;
  }): Promise<IComplianceIssue | null> {
    try {
      const issue = await ComplianceIssueModel.findById(issueId);
      if (!issue) {
        return null;
      }

      const comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: commentData.text,
        author: commentData.author,
        createdAt: new Date()
      };

      issue.comments.push(comment);
      issue.history.push({
        action: 'COMMENT_ADDED',
        description: `Comment added by ${commentData.author}`,
        user: commentData.author,
        timestamp: new Date()
      });

      await issue.save();
      
      logger.info(`💬 Added comment to compliance issue: ${issueId}`);
      return issue;
    } catch (error) {
      logger.error('❌ Error adding comment to compliance issue:', error);
      throw error;
    }
  }

  /**
   * Search issues by text
   */
  async searchIssues(searchTerm: string, projectId?: string): Promise<IComplianceIssue[]> {
    try {
      const query: any = {
        $text: { $search: searchTerm }
      };
      
      if (projectId) {
        query.projectId = projectId;
      }

      const issues = await ComplianceIssueModel
        .find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(50);

      logger.info(`🔍 Found ${issues.length} compliance issues matching "${searchTerm}"`);
      return issues;
    } catch (error) {
      logger.error('❌ Error searching compliance issues:', error);
      throw error;
    }
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(): Promise<void> {
    try {
      const sampleIssues = [
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'BABOK' as const,
          issueType: 'Requirements Completeness',
          severity: 'HIGH' as const,
          title: 'Missing stakeholder requirements',
          description: 'The requirements document is missing key stakeholder input from the marketing team.',
          status: 'OPEN' as const,
          priority: 'HIGH' as const,
          createdBy: 'john.doe@company.com',
          tags: ['requirements', 'stakeholder', 'completeness']
        },
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'PMBOK' as const,
          issueType: 'Risk Management',
          severity: 'MEDIUM' as const,
          title: 'Inadequate risk assessment',
          description: 'The project risk register needs to be updated with recent market changes.',
          status: 'ASSIGNED' as const,
          priority: 'MEDIUM' as const,
          assigneeId: 'jane.smith@company.com',
          createdBy: 'project.manager@company.com',
          tags: ['risk', 'assessment', 'management']
        },
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'DMBOK' as const,
          issueType: 'Data Quality',
          severity: 'CRITICAL' as const,
          title: 'Data validation failures',
          description: 'Multiple data validation checks are failing in the customer database.',
          status: 'IN_PROGRESS' as const,
          priority: 'URGENT' as const,
          assigneeId: 'data.analyst@company.com',
          createdBy: 'system.admin@company.com',
          tags: ['data', 'quality', 'validation']
        }
      ];

      // Clear existing sample data
      await ComplianceIssueModel.deleteMany({ createdBy: { $regex: /@company\.com$/ } });
      
      // Insert sample data
      await ComplianceIssueModel.insertMany(sampleIssues);
      
      logger.info('✅ Seeded compliance issues sample data');
    } catch (error) {
      logger.error('❌ Error seeding compliance issues:', error);
      throw error;
    }
  }
}

export default new ComplianceIssuesService();
