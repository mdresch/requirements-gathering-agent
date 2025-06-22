import { createRequire } from 'module';
import app from './app.js';
import { logger } from './config/logger.js';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`🚀 ADPA API Server running in ${NODE_ENV} mode`);
  logger.info(`📡 Server listening on port ${PORT}`);
  logger.info(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🔍 Health check available at http://localhost:${PORT}/api/v1/health`);
  
  if (NODE_ENV === 'development') {
    logger.info(`🛠️  Development mode - enhanced logging and debugging enabled`);
  }
});

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
