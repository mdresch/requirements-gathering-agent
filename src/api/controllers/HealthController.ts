import { Request, Response } from 'express';

export class HealthController {
    static getHealth(req: Request, res: Response) {
        res.status(200).json({ 
            status: 'ok', 
            message: 'Service is healthy',
            timestamp: new Date().toISOString()
        });
    }

    static getReadiness(req: Request, res: Response) {
        res.status(200).json({ 
            status: 'ready', 
            message: 'Service is ready',
            timestamp: new Date().toISOString()
        });
    }

    static getLiveness(req: Request, res: Response) {
        res.status(200).json({ 
            status: 'live', 
            message: 'Service is live',
            timestamp: new Date().toISOString()
        });
    }

    static getMetrics(req: Request, res: Response) {
        // Example metrics, replace with real metrics as needed
        res.status(200).json({ 
            uptime: process.uptime(), 
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    }

    static getVersion(req: Request, res: Response) {
        // Read version from package.json
        try {
            const packageJson = require('../../../package.json');
            res.status(200).json({
                version: packageJson.version,
                name: packageJson.name,
                description: packageJson.description,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(200).json({
                version: '1.0.0',
                name: 'ADPA API',
                description: 'Document Processing API',
                timestamp: new Date().toISOString()
            });
        }
    }
}
