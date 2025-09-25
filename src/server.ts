import app from './app.js';
import { logger } from './config/logger.js';
import dbConnection from './config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || process.env.API_PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database connection and services
async function initializeDatabase() {
  try {
    await dbConnection.connect();
    logger.info('✅ Database connection established');
    
    // Initialize TemplateRepository and connect it to TemplateController
    const { TemplateRepository } = await import('./repositories/TemplateRepository.js');
    const templateRepository = new TemplateRepository();
    const { TemplateController } = await import('./api/controllers/TemplateController.js');
    
    // Set the repository in the controller
    TemplateController.setTemplateRepository(templateRepository);
    logger.info('✅ TemplateRepository initialized and connected to TemplateController');
    
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection first
    await initializeDatabase();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 ADPA API Server running in ${NODE_ENV} mode`);
      logger.info(`📡 Server listening on port ${PORT}`);
      logger.info(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`🔍 Health check available at http://localhost:${PORT}/api/v1/health`);
      logger.info(`🗄️  Database: MongoDB connected`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🛠️  Development mode - enhanced logging and debugging enabled`);
      }
    });
    
    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
const server = await startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

export default server;
