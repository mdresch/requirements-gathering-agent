const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rga-admin:rga-admin-password@rga-cluster.8jqjq.mongodb.net/rga-database?retryWrites=true&w=majority';

async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('rga-database');
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'Audit Trail Server is running on port 3002' });
});

// Simple audit trail endpoint
app.get('/api/v1/audit-trail/simple', async (req, res) => {
    try {
        const { page = 1, limit = 20, documentId, projectId, userId, action, category, severity, searchTerm, startDate, endDate } = req.query;
        
        // Mock data for now
        const mockEntries = [
            {
                _id: 'audit_001',
                documentId: 'doc_123',
                documentName: 'Requirements Specification v2.1',
                documentType: 'requirements',
                projectId: 'project_456',
                projectName: 'Customer Portal Enhancement',
                action: 'created',
                actionDescription: 'Document created successfully',
                userId: 'user_789',
                userName: 'John Doe',
                userRole: 'Business Analyst',
                userEmail: 'john.doe@company.com',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                severity: 'medium',
                category: 'document',
                notes: 'Initial document creation',
                tags: ['requirements', 'babok'],
                contextData: {
                    aiProvider: 'openai',
                    aiModel: 'gpt-4',
                    tokensUsed: 1500,
                    qualityScore: 85
                }
            },
            {
                _id: 'audit_002',
                documentId: 'doc_124',
                documentName: 'Business Case Document',
                documentType: 'business-case',
                projectId: 'project_456',
                projectName: 'Customer Portal Enhancement',
                action: 'updated',
                actionDescription: 'Document updated with new requirements',
                userId: 'user_790',
                userName: 'Jane Smith',
                userRole: 'Product Manager',
                userEmail: 'jane.smith@company.com',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                severity: 'low',
                category: 'document',
                notes: 'Added new stakeholder requirements',
                tags: ['business-case', 'requirements'],
                contextData: {
                    aiProvider: 'openai',
                    aiModel: 'gpt-4',
                    tokensUsed: 2000,
                    qualityScore: 92
                }
            }
        ];

        // Apply basic filtering
        let filteredEntries = mockEntries;
        
        if (documentId) {
            filteredEntries = filteredEntries.filter(entry => entry.documentId === documentId);
        }
        if (projectId) {
            filteredEntries = filteredEntries.filter(entry => entry.projectId === projectId);
        }
        if (userId) {
            filteredEntries = filteredEntries.filter(entry => entry.userId === userId);
        }
        if (action && action !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.action === action);
        }
        if (category && category !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.category === category);
        }
        if (severity && severity !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.severity === severity);
        }

        // Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                entries: paginatedEntries,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: filteredEntries.length,
                    pages: Math.ceil(filteredEntries.length / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching simple audit trail:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Simple audit trail analytics endpoint
app.get('/api/v1/audit-trail/simple/analytics', async (req, res) => {
    try {
        const { documentId, projectId, userId, startDate, endDate } = req.query;
        
        // Mock analytics data
        const analytics = {
            totalEntries: 25,
            entriesByAction: {
                'created': 8,
                'updated': 12,
                'deleted': 2,
                'viewed': 3
            },
            entriesByCategory: {
                'document': 18,
                'user': 4,
                'system': 3
            },
            entriesBySeverity: {
                'high': 3,
                'medium': 15,
                'low': 7
            },
            entriesByUser: {
                'John Doe': 8,
                'Jane Smith': 10,
                'Mike Johnson': 7
            },
            entriesByDay: {
                '2024-01-15': 5,
                '2024-01-16': 8,
                '2024-01-17': 7,
                '2024-01-18': 5
            },
            averageQualityScore: 87,
            totalTokensUsed: 45000,
            mostActiveUsers: [
                { name: 'Jane Smith', count: 10 },
                { name: 'John Doe', count: 8 },
                { name: 'Mike Johnson', count: 7 }
            ],
            recentActivity: [
                {
                    _id: 'audit_001',
                    documentName: 'Requirements Specification v2.1',
                    action: 'created',
                    userName: 'John Doe',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                    _id: 'audit_002',
                    documentName: 'Business Case Document',
                    action: 'updated',
                    userName: 'Jane Smith',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            ]
        };

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching simple audit trail analytics:', error);
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

        // Insert into database if available
        if (db) {
            const result = await db.collection('documentaudittrails').insertOne(auditEntry);
            auditEntry._id = result.insertedId;
        }

        console.log(`✅ New audit trail entry created: ${action} for ${documentName}`);

        res.status(201).json({
            success: true,
            message: 'Audit trail entry created successfully',
            data: auditEntry
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

// Start server
async function startServer() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Audit Trail Server running on port ${PORT}`);
        console.log(`📊 Serving audit trail data from MongoDB Atlas`);
        console.log(`🔗 Available endpoints:`);
        console.log(`   GET /api/v1/health`);
        console.log(`   GET /api/v1/audit-trail/simple`);
        console.log(`   GET /api/v1/audit-trail/simple/analytics`);
        console.log(`   POST /api/v1/audit-trail`);
    });
}

startServer().catch(console.error);
