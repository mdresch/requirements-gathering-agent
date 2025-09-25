/**
 * Simple Audit Trail Server
 * Serves audit trail data directly from MongoDB Atlas
 * Bypasses TypeScript compilation issues
 */

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = 3003; // Use a different port to avoid conflicts

// MongoDB Atlas connection
const MONGODB_URI = 'mongodb+srv://mennodrescher_db_user:QueIQ4CBA@adpacluster.boafczv.mongodb.net/requirements-gathering-agent';

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db();
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Basic audit trail endpoint
app.get('/api/v1/audit-trail', async (req, res) => {
    try {
        const { page = 1, limit = 50, documentId, projectId, userId, action, category, severity, searchTerm, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        if (documentId) query.documentId = documentId;
        if (projectId) query.projectId = projectId;
        if (userId) query.userId = userId;
        if (action && action !== 'all') query.action = action;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;
        if (searchTerm) {
            query.$or = [
                { documentName: { $regex: searchTerm, $options: 'i' } },
                { actionDescription: { $regex: searchTerm, $options: 'i' } },
                { userName: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get total count
        const total = await db.collection('documentaudittrails').countDocuments(query);
        
        // Get entries with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const entries = await db.collection('documentaudittrails')
            .find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            data: {
                entries: entries,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching audit trail:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Simple enhanced audit trail endpoint
app.get('/api/v1/audit-trail/simple', async (req, res) => {
    try {
        const { page = 1, limit = 50, documentId, projectId, userId, action, category, severity, searchTerm, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        if (documentId) query.documentId = documentId;
        if (projectId) query.projectId = projectId;
        if (userId) query.userId = userId;
        if (action && action !== 'all') query.action = action;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;
        if (searchTerm) {
            query.$or = [
                { documentName: { $regex: searchTerm, $options: 'i' } },
                { actionDescription: { $regex: searchTerm, $options: 'i' } },
                { userName: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get total count
        const total = await db.collection('documentaudittrails').countDocuments(query);
        
        // Get entries with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const entries = await db.collection('documentaudittrails')
            .find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            data: {
                entries: entries,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching simple audit trail:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Analytics endpoint
app.get('/api/v1/audit-trail/simple/analytics', async (req, res) => {
    try {
        const { documentId, projectId, userId, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        if (documentId) query.documentId = documentId;
        if (projectId) query.projectId = projectId;
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get all entries for analytics
        const entries = await db.collection('documentaudittrails').find(query).toArray();

        // Calculate analytics
        const analytics = {
            totalEntries: entries.length,
            entriesByAction: {},
            entriesByCategory: {},
            entriesBySeverity: {},
            entriesByUser: {},
            entriesByDay: {},
            averageQualityScore: 0,
            totalTokensUsed: 0,
            mostActiveUsers: [],
            recentActivity: entries.slice(0, 10)
        };

        let totalQualityScore = 0;
        let qualityScoreCount = 0;
        let totalTokens = 0;

        entries.forEach(entry => {
            // Count by action
            analytics.entriesByAction[entry.action] = (analytics.entriesByAction[entry.action] || 0) + 1;
            
            // Count by category
            analytics.entriesByCategory[entry.category] = (analytics.entriesByCategory[entry.category] || 0) + 1;
            
            // Count by severity
            analytics.entriesBySeverity[entry.severity] = (analytics.entriesBySeverity[entry.severity] || 0) + 1;
            
            // Count by user
            if (entry.userName) {
                analytics.entriesByUser[entry.userName] = (analytics.entriesByUser[entry.userName] || 0) + 1;
            }
            
            // Count by day
            const day = new Date(entry.timestamp).toISOString().split('T')[0];
            analytics.entriesByDay[day] = (analytics.entriesByDay[day] || 0) + 1;
            
            // Quality score
            if (entry.contextData?.qualityScore) {
                totalQualityScore += entry.contextData.qualityScore;
                qualityScoreCount++;
            }
            
            // Tokens used
            if (entry.contextData?.tokensUsed) {
                totalTokens += entry.contextData.tokensUsed;
            }
        });

        // Calculate averages
        analytics.averageQualityScore = qualityScoreCount > 0 ? Math.round(totalQualityScore / qualityScoreCount) : 0;
        analytics.totalTokensUsed = totalTokens;

        // Get most active users
        analytics.mostActiveUsers = Object.entries(analytics.entriesByUser)
            .map(([userName, count]) => ({ userName, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Data quality audit events endpoint
app.get('/api/v1/data-quality-audit/events', async (req, res) => {
    try {
        const { limit = 50, projectId, assessmentType, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        if (projectId && projectId !== 'all') query.projectId = projectId;
        if (assessmentType && assessmentType !== 'all') query.assessmentType = assessmentType;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get events
        const events = await db.collection('documentaudittrails')
            .find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            data: {
                events: events,
                total: events.length
            }
        });
    } catch (error) {
        console.error('Error fetching data quality events:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Data quality audit analytics endpoint
app.get('/api/v1/data-quality-audit/analytics', async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;
        
        // Build query
        const query = {};
        if (projectId && projectId !== 'all') query.projectId = projectId;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Get all events for analytics
        const events = await db.collection('documentaudittrails').find(query).toArray();

        // Calculate analytics
        const analytics = {
            totalEvents: events.length,
            assessmentsByType: {},
            averageQualityScore: 0,
            totalIssues: 0,
            totalResolutions: 0,
            totalImprovements: 0,
            improvementHistory: [],
            trends: {
                daily: {},
                weekly: {},
                monthly: {}
            }
        };

        let totalQualityScore = 0;
        let qualityScoreCount = 0;

        events.forEach(event => {
            // Count assessments by type
            const eventType = event.contextData?.assessmentType || event.action;
            if (eventType) {
                analytics.assessmentsByType[eventType] = (analytics.assessmentsByType[eventType] || 0) + 1;
            }

            // Quality score
            if (event.contextData?.qualityScore) {
                totalQualityScore += event.contextData.qualityScore;
                qualityScoreCount++;
            }

            // Count issues
            const issuesCount = event.contextData?.issuesCount || 0;
            analytics.totalIssues += issuesCount;

            // Count resolutions
            if (event.contextData?.issueResolution) {
                analytics.totalResolutions++;
            }

            // Count improvements
            if (event.contextData?.qualityImprovement) {
                analytics.totalImprovements++;
                analytics.improvementHistory.push({
                    timestamp: event.timestamp,
                    previousScore: event.contextData?.previousScore,
                    newScore: event.contextData?.newScore,
                    changePercentage: event.contextData?.changePercentage
                });
            }

            // Trends
            const date = new Date(event.timestamp);
            const dayKey = date.toISOString().split('T')[0];
            const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            analytics.trends.daily[dayKey] = (analytics.trends.daily[dayKey] || 0) + 1;
            analytics.trends.weekly[weekKey] = (analytics.trends.weekly[weekKey] || 0) + 1;
            analytics.trends.monthly[monthKey] = (analytics.trends.monthly[monthKey] || 0) + 1;
        });

        // Calculate average quality score
        analytics.averageQualityScore = qualityScoreCount > 0 ? Math.round(totalQualityScore / qualityScoreCount) : 0;

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching data quality analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST endpoint to create new audit trail entries
app.post('/api/v1/audit-trail', async (req, res) => {
    try {
        const {
            documentId,
            documentName,
            documentType,
            projectId,
            projectName,
            action,
            actionDescription,
            userId,
            userName,
            userRole,
            userEmail,
            severity,
            category,
            tags,
            notes,
            contextData
        } = req.body;

        // Validate required fields
        if (!documentId || !documentName || !action) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: documentId, documentName, action'
            });
        }

        // Create audit trail entry
        const auditEntry = {
            documentId,
            documentName,
            documentType: documentType || 'unknown',
            projectId: projectId || 'unknown',
            projectName: projectName || 'Unknown Project',
            action,
            actionDescription: actionDescription || `Document ${action}`,
            userId: userId || 'system',
            userName: userName || 'System User',
            userRole: userRole || 'system',
            userEmail: userEmail || 'system@example.com',
            timestamp: new Date(),
            severity: severity || 'medium',
            category: category || 'document',
            notes: notes || '',
            tags: tags || [],
            contextData: contextData || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert into database
        const result = await db.collection('documentaudittrails').insertOne(auditEntry);

        console.log(`✅ New audit trail entry created: ${action} for ${documentName}`);

        res.status(201).json({
            success: true,
            message: 'Audit trail entry created successfully',
            data: {
                id: result.insertedId,
                ...auditEntry
            }
        });

    } catch (error) {
        console.error('Error creating audit trail entry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating audit trail entry',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Audit Trail Server is running' });
});

// Start server
async function startServer() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Audit Trail Server running on port ${PORT}`);
        console.log(`📊 Serving audit trail data from MongoDB Atlas`);
        console.log(`🔗 Available endpoints:`);
        console.log(`   GET /api/v1/audit-trail`);
        console.log(`   GET /api/v1/audit-trail/simple`);
        console.log(`   GET /api/v1/audit-trail/simple/analytics`);
        console.log(`   POST /api/v1/audit-trail`);
        console.log(`   GET /api/v1/data-quality-audit/events`);
        console.log(`   GET /api/v1/data-quality-audit/analytics`);
        console.log(`   GET /health`);
    });
}

startServer().catch(console.error);
