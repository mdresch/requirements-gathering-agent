/**
 * Context Utilization Service
 * Extracts AI context utilization data from audit trail entries
 */

interface ContextUtilizationMetrics {
  totalInteractions: number;
  averageUtilization: number;
  totalTokensUsed: number;
  totalCost: number;
  utilizationDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  topProviders: Array<{
    provider: string;
    count: number;
    percentage: number;
    avgUtilization: number;
  }>;
  utilizationTrends: Array<{
    period: string;
    utilization: number;
    generations: number;
  }>;
  performanceMetrics: {
    averageGenerationTime: number;
    averageTokensPerSecond: number;
  };
}

interface DocumentTraceability {
  generationJobId: string;
  templateId: string;
  aiProvider: string;
  aiModel: string;
  contextBreakdown: {
    systemPrompt: { tokens: number; percentage: string };
    userPrompt: { tokens: number; percentage: string };
    projectContext: { tokens: number; percentage: string };
    template: { tokens: number; percentage: string };
    response: { tokens: number; percentage: string };
  };
  utilizationPercentage: number;
  generationTime: number;
  qualityScore: number;
  complianceScore: number;
  createdAt: string;
  sourceInformation: {
    projectName: string;
    projectType: string;
    framework: string;
    documentType: string;
  };
}

export class ContextUtilizationService {
  private static readonly API_BASE_URL = 'http://localhost:3002/api/v1';

  /**
   * Get project analytics from audit trail data
   */
  static async getProjectAnalytics(projectId: string): Promise<ContextUtilizationMetrics> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/audit-trail/simple?page=1&limit=1000`, {
        headers: { 'X-API-Key': 'dev-api-key-123' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit trail data: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      let auditEntries = [];
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          auditEntries = data.data;
        } else if (data.data.entries && Array.isArray(data.data.entries)) {
          auditEntries = data.data.entries;
        }
      }

      // Ensure auditEntries is an array
      if (!Array.isArray(auditEntries)) {
        console.warn('Audit entries is not an array:', auditEntries);
        return this.getEmptyMetrics();
      }

      // Filter entries for the specific project and AI-related actions
      const aiEntries = auditEntries.filter((entry: any) => 
        entry.projectId === projectId && 
        entry.contextData && 
        (entry.contextData.aiProvider || entry.contextData.tokensUsed)
      );

      if (aiEntries.length === 0) {
        return this.getEmptyMetrics();
      }

      return this.calculateMetrics(aiEntries);

    } catch (error) {
      console.error('Failed to fetch project analytics:', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get document traceability from audit trail data
   */
  static async getDocumentTraceability(documentId: string): Promise<DocumentTraceability[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/audit-trail/simple?page=1&limit=1000`, {
        headers: { 'X-API-Key': 'dev-api-key-123' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit trail data: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      let auditEntries = [];
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          auditEntries = data.data;
        } else if (data.data.entries && Array.isArray(data.data.entries)) {
          auditEntries = data.data.entries;
        }
      }

      // Ensure auditEntries is an array
      if (!Array.isArray(auditEntries)) {
        console.warn('Audit entries is not an array in getDocumentTraceability:', auditEntries);
        return [];
      }

      // Filter entries for the specific document and AI-related actions
      const documentEntries = auditEntries.filter((entry: any) => 
        entry.documentId === documentId && 
        entry.contextData && 
        (entry.contextData.aiProvider || entry.contextData.tokensUsed)
      );

      return documentEntries.map((entry: any) => this.transformToTraceability(entry));

    } catch (error) {
      console.error('Failed to fetch document traceability:', error);
      return [];
    }
  }

  /**
   * Calculate metrics from audit trail entries
   */
  private static calculateMetrics(entries: any[]): ContextUtilizationMetrics {
    const totalInteractions = entries.length;
    
    // Calculate utilization metrics
    const totalTokensUsed = entries.reduce((sum, entry) => 
      sum + (entry.contextData?.tokensUsed || 0), 0);
    
    const averageUtilization = entries.reduce((sum, entry) => 
      sum + (entry.contextData?.contextUtilization || 75), 0) / totalInteractions;
    
    // Estimate cost based on tokens (rough approximation)
    const totalCost = totalTokensUsed * 0.00002; // ~$0.00002 per token
    
    // Calculate utilization distribution
    const utilizationDistribution = {
      high: entries.filter(e => (e.contextData?.contextUtilization || 75) >= 90).length,
      medium: entries.filter(e => {
        const util = e.contextData?.contextUtilization || 75;
        return util >= 70 && util < 90;
      }).length,
      low: entries.filter(e => (e.contextData?.contextUtilization || 75) < 70).length
    };
    
    // Calculate provider statistics
    const providerStats = new Map<string, { count: number; totalUtilization: number }>();
    entries.forEach(entry => {
      const provider = entry.contextData?.aiProvider || 'Unknown';
      const utilization = entry.contextData?.contextUtilization || 75;
      
      if (!providerStats.has(provider)) {
        providerStats.set(provider, { count: 0, totalUtilization: 0 });
      }
      
      const stats = providerStats.get(provider)!;
      stats.count++;
      stats.totalUtilization += utilization;
    });
    
    const topProviders = Array.from(providerStats.entries()).map(([provider, stats]) => ({
      provider,
      count: stats.count,
      percentage: (stats.count / totalInteractions) * 100,
      avgUtilization: stats.totalUtilization / stats.count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    
    // Calculate utilization trends (group by week)
    const trends = this.calculateTrends(entries);
    
    // Calculate performance metrics
    const totalGenerationTime = entries.reduce((sum, entry) => 
      sum + (entry.contextData?.generationTime || 1500), 0);
    
    const averageGenerationTime = totalGenerationTime / totalInteractions;
    const averageTokensPerSecond = totalTokensUsed / (totalGenerationTime / 1000);
    
    return {
      totalInteractions,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
      totalTokensUsed,
      totalCost: Math.round(totalCost * 100) / 100,
      utilizationDistribution,
      topProviders,
      utilizationTrends: trends,
      performanceMetrics: {
        averageGenerationTime: Math.round(averageGenerationTime),
        averageTokensPerSecond: Math.round(averageTokensPerSecond * 100) / 100
      }
    };
  }

  /**
   * Calculate utilization trends from entries
   */
  private static calculateTrends(entries: any[]): Array<{
    period: string;
    utilization: number;
    generations: number;
  }> {
    const trends = new Map<string, { totalUtilization: number; count: number }>();
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const week = this.getWeekKey(date);
      const utilization = entry.contextData?.contextUtilization || 75;
      
      if (!trends.has(week)) {
        trends.set(week, { totalUtilization: 0, count: 0 });
      }
      
      const trend = trends.get(week)!;
      trend.totalUtilization += utilization;
      trend.count++;
    });
    
    return Array.from(trends.entries()).map(([week, data]) => ({
      period: week,
      utilization: Math.round((data.totalUtilization / data.count) * 100) / 100,
      generations: data.count
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get week key for grouping
   */
  private static getWeekKey(date: Date): string {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    const weekNum = Math.ceil((startOfWeek.getDate() - 1) / 7) + 1;
    return `Week ${weekNum}`;
  }

  /**
   * Transform audit trail entry to traceability format
   */
  private static transformToTraceability(entry: any): DocumentTraceability {
    const contextData = entry.contextData || {};
    
    // Estimate context breakdown based on available data
    const totalTokens = contextData.tokensUsed || 8000;
    const systemPromptTokens = Math.round(totalTokens * 0.15);
    const userPromptTokens = Math.round(totalTokens * 0.10);
    const projectContextTokens = Math.round(totalTokens * 0.25);
    const templateTokens = Math.round(totalTokens * 0.08);
    const responseTokens = Math.round(totalTokens * 0.22);
    
    return {
      generationJobId: `job_${entry.documentId}_${entry.timestamp}`,
      templateId: contextData.templateUsed || 'unknown',
      aiProvider: contextData.aiProvider || 'Unknown',
      aiModel: contextData.aiModel || 'gpt-4',
      contextBreakdown: {
        systemPrompt: { 
          tokens: systemPromptTokens, 
          percentage: `${((systemPromptTokens / totalTokens) * 100).toFixed(1)}%` 
        },
        userPrompt: { 
          tokens: userPromptTokens, 
          percentage: `${((userPromptTokens / totalTokens) * 100).toFixed(1)}%` 
        },
        projectContext: { 
          tokens: projectContextTokens, 
          percentage: `${((projectContextTokens / totalTokens) * 100).toFixed(1)}%` 
        },
        template: { 
          tokens: templateTokens, 
          percentage: `${((templateTokens / totalTokens) * 100).toFixed(1)}%` 
        },
        response: { 
          tokens: responseTokens, 
          percentage: `${((responseTokens / totalTokens) * 100).toFixed(1)}%` 
        }
      },
      utilizationPercentage: contextData.contextUtilization || 75,
      generationTime: contextData.generationTime || 1500,
      qualityScore: contextData.qualityScore || 85,
      complianceScore: 92, // Default compliance score
      createdAt: entry.timestamp,
      sourceInformation: {
        projectName: entry.projectName || 'Unknown Project',
        projectType: 'Web Application',
        framework: contextData.framework || 'React/Node.js',
        documentType: entry.documentType || 'Unknown'
      }
    };
  }

  /**
   * Get empty metrics when no data is available
   */
  private static getEmptyMetrics(): ContextUtilizationMetrics {
    return {
      totalInteractions: 0,
      averageUtilization: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      utilizationDistribution: { high: 0, medium: 0, low: 0 },
      topProviders: [],
      utilizationTrends: [],
      performanceMetrics: {
        averageGenerationTime: 0,
        averageTokensPerSecond: 0
      }
    };
  }
}
