// Phase 1: Enhanced Data Integration - Simple Mock Server
// Minimal server without external dependencies

import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

/**
 * Phase 1 Simple Mock Server - Real-time Data Integration (No Dependencies)
 * Minimal mock server for testing Phase 1 features
 */

const app = express();
const PORT = 3002;

// Apply CORS globally for all routes FIRST
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    console.log('🏥 Health check requested');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0-phase1-simple-mock',
        services: {
            database: 'mock',
            websocket: 'mock',
            compliance: 'active'
        }
    });
});

// Mock compliance dashboard endpoint
app.get('/api/v1/standards/dashboard', async (req: Request, res: Response) => {
    try {
        const { projectId = 'current-project' } = req.query;
        
        console.log(`📊 Mock compliance dashboard requested for project: ${projectId}`);

        // Mock dashboard data
        const dashboardData = {
            projectSummary: {
                projectId: projectId as string,
                projectName: 'Current Project Analysis',
                status: 'Active',
                lastAnalyzed: new Date(),
                nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                overallScore: 87,
                trendDirection: 'IMPROVING'
            },
            complianceOverview: {
                standards: {
                    babok: { score: 94, trend: '+2%', status: 'FULLY_COMPLIANT' },
                    pmbok: { score: 89, trend: '+5%', status: 'MOSTLY_COMPLIANT' },
                    dmbok: { score: 78, trend: 'stable', status: 'PARTIALLY_COMPLIANT' },
                    iso: { score: 85, trend: '+1%', status: 'MOSTLY_COMPLIANT' }
                }
            },
            deviationSummary: {
                total: 12,
                byCategory: {
                    METHODOLOGY: 4,
                    PROCESS: 5,
                    DELIVERABLE: 2,
                    GOVERNANCE: 1,
                    TOOLS: 0,
                    TECHNIQUES: 0,
                    ROLES: 0,
                    WORKFLOWS: 0
                },
                bySeverity: {
                    CRITICAL: 0,
                    HIGH: 2,
                    MEDIUM: 6,
                    LOW: 4,
                    INFORMATIONAL: 0
                }
            },
            qualityMetrics: {
                overallQuality: 85,
                dataFreshness: 90,
                completeness: 80,
                qualityLevel: 'GOOD',
                issuesFound: 3,
                recommendations: ['Improve data completeness', 'Enhance data validation']
            },
            realTimeEnabled: false,
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'Mock compliance dashboard data retrieved successfully',
            data: dashboardData
        });

    } catch (error) {
        console.error('❌ Mock compliance dashboard endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving mock compliance dashboard data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Enhanced compliance endpoints (mock version)
app.get('/api/v1/standards/enhanced/dashboard', async (req: Request, res: Response) => {
    try {
        const { projectId = 'current-project' } = req.query;
        
        console.log(`📊 Enhanced mock compliance dashboard requested for project: ${projectId}`);

        // Mock enhanced dashboard data
        const dashboardData = {
            projectSummary: {
                projectId: projectId as string,
                projectName: 'Current Project Analysis',
                status: 'Active',
                lastAnalyzed: new Date(),
                nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                overallScore: 87,
                trendDirection: 'IMPROVING'
            },
            complianceOverview: {
                standards: {
                    babok: { score: 94, trend: '+2%', status: 'FULLY_COMPLIANT' },
                    pmbok: { score: 89, trend: '+5%', status: 'MOSTLY_COMPLIANT' },
                    dmbok: { score: 78, trend: 'stable', status: 'PARTIALLY_COMPLIANT' },
                    iso: { score: 85, trend: '+1%', status: 'MOSTLY_COMPLIANT' }
                }
            },
            deviationSummary: {
                total: 12,
                byCategory: {
                    METHODOLOGY: 4,
                    PROCESS: 5,
                    DELIVERABLE: 2,
                    GOVERNANCE: 1
                },
                bySeverity: {
                    CRITICAL: 0,
                    HIGH: 2,
                    MEDIUM: 6,
                    LOW: 4
                }
            },
            qualityMetrics: {
                overallQuality: 85,
                dataFreshness: 90,
                completeness: 80,
                qualityLevel: 'GOOD',
                issuesFound: 3,
                recommendations: ['Improve data completeness', 'Enhance data validation']
            },
            realTimeEnabled: true,
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'Enhanced mock compliance dashboard data retrieved successfully',
            data: dashboardData
        });

    } catch (error) {
        console.error('❌ Enhanced mock compliance dashboard endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving enhanced mock compliance dashboard data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Data quality endpoint (mock version)
app.get('/api/v1/standards/data-quality', async (req: Request, res: Response) => {
    try {
        const { projectId = 'current-project', dataSource = 'compliance-api' } = req.query;

        console.log(`🔍 Mock data quality assessment requested for project: ${projectId}`);

        // Mock quality report
        const qualityReport = {
            projectId: projectId as string,
            dataSource: dataSource as string,
            overallScore: 85,
            qualityLevel: 'GOOD',
            dimensions: {
                completeness: 90,
                accuracy: 88,
                consistency: 82,
                timeliness: 85,
                validity: 80
            },
            issuesFound: 3,
            recommendations: ['Improve data completeness', 'Enhance data validation'],
            validatedAt: new Date()
        };

        res.status(200).json({
            success: true,
            message: 'Mock data quality assessment completed successfully',
            data: {
                currentQuality: qualityReport,
                assessmentTimestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Mock data quality endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing mock data quality assessment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// WebSocket info endpoint (mock version)
app.get('/api/v1/standards/websocket/info', async (req: Request, res: Response) => {
    try {
        const stats = {
            totalConnections: 0,
            aliveConnections: 0,
            projectSubscriptions: {}
        };

        res.status(200).json({
            success: true,
            message: 'Mock WebSocket connection information retrieved successfully',
            data: {
                ...stats,
                websocketUrl: '/ws/compliance',
                supportedMessageTypes: [
                    'METRIC_UPDATE',
                    'ISSUE_UPDATE', 
                    'QUALITY_UPDATE',
                    'STATUS_UPDATE',
                    'PING',
                    'PONG'
                ],
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Mock WebSocket info endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving mock WebSocket information',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start server
async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Phase 1 Simple Mock Server running on port ${PORT}`);
            console.log(`📊 Mock compliance dashboard: http://localhost:${PORT}/api/v1/standards/enhanced/dashboard`);
            console.log(`📊 Original compliance dashboard: http://localhost:${PORT}/api/v1/standards/dashboard`);
            console.log(`🔍 Health check: http://localhost:${PORT}/health`);
            console.log(`ℹ️ This is a simple mock server - no database required!`);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

export default app;
