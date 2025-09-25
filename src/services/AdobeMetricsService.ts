import { realTimeMetricsService } from './RealTimeMetricsService.js';
import { logger } from '../utils/logger.js';

/**
 * Adobe Creative Suite Metrics Service
 * Wraps Adobe Creative Suite operations with real-time metrics tracking
 */

export interface AdobeOperationData {
  userId: string;
  projectId?: string;
  operationType: 'pdf_convert' | 'document_create' | 'template_apply' | 'export';
  documentType: string;
  fileSize?: number;
  outputFormat: string;
}

export class AdobeMetricsService {
  /**
   * Track Adobe PDF conversion operation
   */
  public static async trackPdfConversion(
    data: AdobeOperationData,
    operation: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting Adobe PDF conversion with metrics tracking', {
        userId: data.userId,
        operationType: data.operationType,
        documentType: data.documentType
      });
      
      // Execute the actual Adobe operation
      const result = await operation();
      
      const processingTime = Date.now() - startTime;
      
      // Track successful operation
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: true,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      logger.info('Adobe PDF conversion completed successfully', {
        processingTime: processingTime,
        success: true
      });
      
      return result;
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      // Track failed operation
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: false,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      logger.error('Adobe PDF conversion failed', {
        error: error.message,
        processingTime: processingTime,
        success: false
      });
      
      throw error;
    }
  }

  /**
   * Track Adobe document creation operation
   */
  public static async trackDocumentCreation(
    data: AdobeOperationData,
    operation: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting Adobe document creation with metrics tracking', {
        userId: data.userId,
        operationType: data.operationType,
        documentType: data.documentType
      });
      
      const result = await operation();
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: true,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      return result;
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: false,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      throw error;
    }
  }

  /**
   * Track Adobe template application operation
   */
  public static async trackTemplateApplication(
    data: AdobeOperationData,
    operation: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: true,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      return result;
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: false,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      throw error;
    }
  }

  /**
   * Track Adobe export operation
   */
  public static async trackExport(
    data: AdobeOperationData,
    operation: () => Promise<any>
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: true,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      return result;
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      realTimeMetricsService.trackAdobeIntegration({
        timestamp: new Date(),
        operation: {
          type: data.operationType,
          documentType: data.documentType,
          success: false,
          processingTime: processingTime,
          fileSize: data.fileSize,
          outputFormat: data.outputFormat
        },
        user: {
          userId: data.userId,
          projectId: data.projectId
        }
      });
      
      throw error;
    }
  }

  /**
   * Get Adobe usage statistics
   */
  public static async getAdobeUsageStats(userId?: string, projectId?: string): Promise<{
    totalOperations: number;
    successRate: number;
    averageProcessingTime: number;
    operationsByType: Record<string, number>;
    recentOperations: any[];
  }> {
    try {
      const recentMetrics = realTimeMetricsService.getRecentMetrics('adobe_integration', 1000);
      
      let filteredMetrics = recentMetrics;
      
      if (userId) {
        filteredMetrics = filteredMetrics.filter(metric => metric.metadata.userId === userId);
      }
      
      if (projectId) {
        filteredMetrics = filteredMetrics.filter(metric => metric.metadata.projectId === projectId);
      }
      
      const totalOperations = filteredMetrics.length;
      const successfulOperations = filteredMetrics.filter(metric => metric.data.success).length;
      const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;
      
      const totalProcessingTime = filteredMetrics.reduce((sum, metric) => sum + (metric.data.processingTime || 0), 0);
      const averageProcessingTime = totalOperations > 0 ? totalProcessingTime / totalOperations : 0;
      
      const operationsByType: Record<string, number> = {};
      filteredMetrics.forEach(metric => {
        const type = metric.data.type || 'unknown';
        operationsByType[type] = (operationsByType[type] || 0) + 1;
      });
      
      const recentOperations = filteredMetrics
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(metric => ({
          timestamp: metric.timestamp,
          type: metric.data.type,
          success: metric.data.success,
          processingTime: metric.data.processingTime,
          documentType: metric.data.documentType,
          outputFormat: metric.data.outputFormat
        }));
      
      return {
        totalOperations,
        successRate: Math.round(successRate * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime),
        operationsByType,
        recentOperations
      };
      
    } catch (error: any) {
      logger.error('Failed to get Adobe usage statistics:', error);
      return {
        totalOperations: 0,
        successRate: 0,
        averageProcessingTime: 0,
        operationsByType: {},
        recentOperations: []
      };
    }
  }
}
